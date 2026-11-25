"""Siklus inti end-to-end: Tangkap -> Petakan -> Uji Paham -> Tutup Celah."""

import uuid

import pytest

pytestmark = pytest.mark.integration


async def send(client, team_id, user, body, room="team"):
    r = await client.post(f"/v1/teams/{team_id}/messages", headers=user.h,
                          json={"room": room, "body": body, "client_msg_id": str(uuid.uuid4())})
    assert r.status_code == 201, r.text
    return r.json()["message"]


async def test_health(client):
    assert (await client.get("/healthz")).json() == {"status": "ok"}
    assert (await client.get("/readyz")).json() == {"status": "ready"}


async def test_auth_required_and_problem_json(client):
    r = await client.get("/v1/teams")
    assert r.status_code == 401
    assert r.headers["content-type"].startswith("application/problem+json")
    assert r.json()["status"] == 401 and "request_id" in r.json()
    r = await client.get("/v1/teams", headers={"Authorization": "Bearer palsu"})
    assert r.status_code == 401


async def test_message_idempotency(client, make_team):
    team_id, [rani] = await make_team("Rani")
    body = {"room": "team", "body": "halo", "client_msg_id": "abc-1"}
    r1 = await client.post(f"/v1/teams/{team_id}/messages", headers=rani.h, json=body)
    r2 = await client.post(f"/v1/teams/{team_id}/messages", headers=rani.h, json=body)
    assert r1.status_code == 201 and r2.status_code == 200
    assert r1.json()["message"]["id"] == r2.json()["message"]["id"]
    assert r2.json()["duplicate"] is True


async def test_full_cycle(client, worker, make_team, admin_conn):
    team_id, [rani, dimas, sari] = await make_team("Rani", "Dimas", "Sari")

    # 1. Tangkap: obrolan tim -> usulan keputusan berbukti
    await send(client, team_id, dimas, "Gimana kalau auth pakai Firebase aja?")
    await send(client, team_id, rani, "Oke kita pakai Supabase untuk auth karena RLS-nya bawaan.")
    await send(client, team_id, sari, "Nanti makan siang di mana?")
    assert await worker.drain() >= 1

    brain = (await client.get(f"/v1/teams/{team_id}/brain", headers=sari.h)).json()["items"]
    assert len(brain) == 1, brain
    item = brain[0]
    assert item["status"] == "proposed"
    assert "Supabase" in item["content"]["chosen_option"]
    assert item["content"]["rationale"].startswith("karena")
    assert {e["field"] for e in item["evidence"]} >= {"title", "chosen_option", "rationale"}
    assert item["prompt_version"] == "extract@v1"

    # 2. Propose-confirm oleh manusia (+ tanda dibantu AI)
    r = await client.post(f"/v1/memory/{item['id']}/confirm", headers=dimas.h,
                          json={"action": "confirm", "ai_assisted": True})
    assert r.status_code == 200, r.text
    assert r.json()["item"]["status"] == "confirmed"
    r = await client.post(f"/v1/memory/{item['id']}/confirm", headers=dimas.h,
                          json={"action": "reject"})
    assert r.status_code == 409
    await worker.drain()

    kcs = (await client.get(f"/v1/teams/{team_id}/kcs", headers=sari.h)).json()["items"]
    assert len(kcs) >= 1
    kc_id = kcs[0]["id"]
    r = await client.patch(f"/v1/kcs/{kc_id}", headers=rani.h, json={"criticality": 3})
    assert r.status_code == 200

    # Delta digest untuk anggota lain
    dig = (await client.get(f"/v1/me/digest?team_id={team_id}", headers=sari.h)).json()
    assert any(e["item_id"] == item["id"] for e in dig["events"])

    # 3. Uji paham: butuh persetujuan eksplisit
    r = await client.get(f"/v1/checks/next?team_id={team_id}", headers=sari.h)
    assert r.status_code == 403
    await client.patch("/v1/me", headers=sari.h, json={"consent_explainback": True})
    r = await client.get(f"/v1/checks/next?team_id={team_id}", headers=sari.h)
    assert r.status_code == 200, r.text
    q = r.json()["question"]
    assert r.json()["selection"]["theta"] == 0.0

    answer = "Tim memilih Supabase untuk auth karena RLS-nya bawaan."
    r = await client.post(f"/v1/checks/{q['id']}/answer", headers={**sari.h, "Idempotency-Key": "k1"},
                          json={"answer": answer})
    assert r.status_code == 202, r.text
    attempt_id = r.json()["attempt_id"]
    dup = await client.post(f"/v1/checks/{q['id']}/answer",
                            headers={**sari.h, "Idempotency-Key": "k1"}, json={"answer": answer})
    assert dup.json()["duplicate"] is True and dup.json()["attempt_id"] == attempt_id
    await worker.drain()

    res = (await client.get(f"/v1/checks/attempts/{attempt_id}", headers=sari.h)).json()
    assert res["status"] == "graded" and res["verdict"] == "paham"
    row = await admin_conn.fetchrow("select * from check_attempts where id = $1",
                                    uuid.UUID(attempt_id))
    assert row["sample_grades"] == [2, 2, 2] and row["lambda_source"] == "heuristic"
    # Penjawab lain tidak bisa melihat attempt Sari
    assert (await client.get(f"/v1/checks/attempts/{attempt_id}", headers=dimas.h)).status_code == 404

    mine = (await client.get(f"/v1/me/understanding?team_id={team_id}", headers=sari.h)).json()
    assert mine["kcs"][0]["p_mastery"] == pytest.approx(0.5735, abs=1e-3)

    # 4. Peta pemahaman: hanya agregat, tanpa P(L) anggota lain
    u = (await client.get(f"/v1/teams/{team_id}/understanding", headers=dimas.h)).json()
    assert "p_mastery" not in str(u)
    assert u["n_critical_kcs"] == 1 and u["bus_factor"] == 0  # belum ada yang >= tau
    # Satu jawaban benar lagi (soal lain) -> Sari >= tau
    r = await client.get(f"/v1/checks/next?team_id={team_id}", headers=sari.h)
    q2 = r.json()["question"]
    assert q2["id"] != q["id"]
    await client.post(f"/v1/checks/{q2['id']}/answer", headers={**sari.h, "Idempotency-Key": "k2"},
                      json={"answer": answer})
    await worker.drain()
    u = (await client.get(f"/v1/teams/{team_id}/understanding", headers=dimas.h)).json()
    cov = {c["kc_id"]: c for c in u["coverage"]}[kc_id]
    assert cov["n_covered"] == 1 and cov["explainers"] == ["Sari"]
    assert u["bus_factor"] == 1
    assert any(p["explainer"] == "Sari" for p in u["pairing"])


async def test_abstain_routes_to_peer_and_updates_mastery(client, worker, make_team, provider):
    team_id, [rani, budi] = await make_team("Rani", "Budi")
    await send(client, team_id, rani, "Sepakat kita pakai FastAPI karena tim sudah paham Python.")
    await worker.drain()
    item = (await client.get(f"/v1/teams/{team_id}/brain", headers=rani.h)).json()["items"][0]
    await client.post(f"/v1/memory/{item['id']}/confirm", headers=budi.h, json={"action": "confirm"})
    await worker.drain()
    await client.patch("/v1/me", headers=budi.h, json={"consent_explainback": True})
    q = (await client.get(f"/v1/checks/next?team_id={team_id}", headers=budi.h)).json()["question"]

    flip = iter([2, 0, 1])
    provider.handlers["grade"] = lambda p, t, i: {"grade": next(flip), "feedback": "-"}
    try:
        r = await client.post(f"/v1/checks/{q['id']}/answer",
                              headers={**budi.h, "Idempotency-Key": "a1"}, json={"answer": "entah"})
        await worker.drain()
    finally:
        from app.gateway.fake import heuristic_grade
        provider.handlers["grade"] = heuristic_grade
    res = (await client.get(f"/v1/checks/attempts/{r.json()['attempt_id']}", headers=budi.h)).json()
    assert res["status"] == "abstained" and res["peer_request_id"]

    # Rani (pemilik keputusan) diminta menjelaskan & menilai
    reqs = (await client.get("/v1/peer-requests", headers=rani.h)).json()["items"]
    assert len(reqs) == 1 and reqs[0]["answer"] == "entah"
    assert (await client.get("/v1/peer-requests", headers=budi.h)).json()["items"] == []
    r = await client.post(f"/v1/peer-requests/{reqs[0]['id']}/grade", headers=budi.h, json={"grade": 2})
    assert r.status_code == 404  # learner tidak boleh menilai dirinya sendiri
    r = await client.post(f"/v1/peer-requests/{reqs[0]['id']}/grade", headers=rani.h, json={"grade": 0})
    assert r.status_code == 200
    mine = (await client.get(f"/v1/me/understanding?team_id={team_id}", headers=budi.h)).json()
    assert mine["kcs"][0]["p_mastery"] == pytest.approx(0.1742, abs=1e-3)


async def test_edit_confirmed_creates_superseding_version(client, worker, make_team):
    team_id, [rani, dimas] = await make_team("Rani", "Dimas")
    await send(client, team_id, rani, "Fix kita pakai Vite untuk frontend karena build-nya cepat.")
    await worker.drain()
    item = (await client.get(f"/v1/teams/{team_id}/brain", headers=rani.h)).json()["items"][0]
    await client.post(f"/v1/memory/{item['id']}/confirm", headers=rani.h, json={"action": "confirm"})
    content = {**item["content"], "chosen_option": "Next.js"}
    r = await client.post(f"/v1/memory/{item['id']}/confirm", headers=dimas.h,
                          json={"action": "edit", "content": content})
    assert r.status_code == 200, r.text
    new_id = r.json()["item"]["id"]
    assert new_id != item["id"]
    items = {i["id"]: i for i in (await client.get(f"/v1/teams/{team_id}/brain",
                                                   headers=rani.h)).json()["items"]}
    assert items[item["id"]]["status"] == "superseded" and items[item["id"]]["valid_to"]
    assert any(e["kind"] == "supersedes" and e["dst_item_id"] == item["id"]
               for e in items[new_id]["edges"])
    # as_of setelah versi lama tercatat tetapi sebelum revisi -> hanya versi lama.
    # (as_of = valid_from pesan sumber akan kosong: item belum tercatat saat itu.)
    old_t = items[item["id"]]["recorded_at"]
    early = (await client.get(f"/v1/teams/{team_id}/brain", params={"as_of": items[item["id"]]["valid_from"]},
                              headers=rani.h)).json()["items"]
    assert early == []
    then = (await client.get(f"/v1/teams/{team_id}/brain", params={"as_of": old_t},
                             headers=rani.h)).json()["items"]
    assert [i["id"] for i in then] == [item["id"]]
    now = (await client.get(f"/v1/teams/{team_id}/brain", params={"as_of": items[new_id]["recorded_at"]},
                            headers=rani.h)).json()["items"]
    assert [i["id"] for i in now] == [new_id]


async def test_agents_cite_and_team_agent_abstains(client, worker, make_team):
    team_id, [rani, dimas] = await make_team("Rani", "Dimas")
    await send(client, team_id, rani, "Oke kita pakai pgvector untuk pencarian karena satu database.")
    await worker.drain()
    item = (await client.get(f"/v1/teams/{team_id}/brain", headers=rani.h)).json()["items"][0]
    await client.post(f"/v1/memory/{item['id']}/confirm", headers=dimas.h, json={"action": "confirm"})
    await worker.drain()
    r = await client.post("/v1/agents/team/ask", headers=dimas.h,
                          json={"team_id": team_id, "question": "kenapa pakai pgvector untuk pencarian?"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["citations"][0]["item_id"] == item["id"] and body["taint"] == "none"
    assert body["citations"][0]["quotes"]
    r = await client.post("/v1/agents/team/ask", headers=dimas.h,
                          json={"team_id": team_id, "question": "resep rendang?"})
    assert r.json()["abstained"] is True
    post = await client.post(f"/v1/agents/answers/{body['id']}/post", headers=dimas.h)
    assert post.status_code == 201
    br = await client.post("/v1/briefing/turn", headers=dimas.h,
                           json={"team_id": team_id, "message": "pgvector pencarian"})
    assert br.status_code == 200 and br.json()["cited_item_ids"]


async def test_passport_masks_and_blocks_residual_pii(client, worker, make_team):
    team_id, [rani, dimas] = await make_team("Rani", "Dimas")
    note = await client.post(f"/v1/teams/{team_id}/notes", headers=rani.h,
                             json={"title": "Kontak dosen", "text": "WA dosen 081234567890, rapat Senin"})
    pv = await client.post("/v1/passport/preview", headers=rani.h,
                           json={"team_id": team_id, "source_item_id": note.json()["item"]["id"]})
    assert pv.status_code == 200 and "[TELEPON]" in pv.json()["masked_text"]
    # Dimas tidak bisa mempratinjau catatan Rani
    pv2 = await client.post("/v1/passport/preview", headers=dimas.h,
                            json={"team_id": team_id, "source_item_id": note.json()["item"]["id"]})
    assert pv2.status_code == 404
    bad = await client.post("/v1/passport/share", headers=rani.h,
                            json={"team_id": team_id, "title": "x", "masked_text": "WA 081234567890"})
    assert bad.status_code == 403
    ok = await client.post("/v1/passport/share", headers=rani.h,
                           json={"team_id": team_id, "title": "Rapat", "masked_text": pv.json()["masked_text"],
                                 "source_item_id": note.json()["item"]["id"]})
    assert ok.status_code == 201 and ok.json()["shared_item"]["status"] == "proposed"
    brain = (await client.get(f"/v1/teams/{team_id}/brain", headers=dimas.h)).json()["items"]
    assert any("[TELEPON]" in (i["content"].get("text") or "") for i in brain)


async def test_credits_preauth_flow(client, make_team, admin_conn, worker):
    team_id, [rani, dimas] = await make_team("Rani", "Dimas")
    await admin_conn.execute("update teams set tier = 'pro' where id = $1", uuid.UUID(team_id))
    await admin_conn.execute(
        """insert into model_prices (version, provider, model, price_in_usd_per_mtok,
           price_out_usd_per_mtok, usd_idr, fx_buffer, margin, f_call_idr, effective_from)
           values (1, 'fake', 'fake', 0.30, 2.50, 16500, 1.05, 0.30, 1, now() - interval '1 day')
           on conflict do nothing""")
    # Saldo 0 -> panggilan Pro ditolak 402
    r = await client.post("/v1/agents/team/ask", headers=rani.h,
                          json={"team_id": team_id, "question": "apa keputusan kita?"})
    assert r.status_code == 402, r.text
    assert (await client.post(f"/v1/teams/{team_id}/credits/topup", headers={**dimas.h, "Idempotency-Key": "d"},
                              json={"amount_idr": 50000})).status_code == 403
    for _ in range(2):  # idempoten
        r = await client.post(f"/v1/teams/{team_id}/credits/topup",
                              headers={**rani.h, "Idempotency-Key": "t1"}, json={"amount_idr": 50000})
    assert r.json()["balance_idr"] == 50000
    r = await client.post("/v1/agents/team/ask", headers=rani.h,
                          json={"team_id": team_id, "question": "apa keputusan kita?"})
    assert r.status_code == 200, r.text
    cr = (await client.get(f"/v1/teams/{team_id}/credits", headers=rani.h)).json()
    s = cr["summary"]
    assert s["hold"] == -s["release"] and s["charge"] < 0
    assert cr["balance_idr"] == 50000 + s["charge"]
    assert (await client.get(f"/v1/teams/{team_id}/credits", headers=dimas.h)).status_code == 403


async def test_account_erasure_keeps_team_memory(client, worker, make_team, admin_conn):
    team_id, [rani, dimas] = await make_team("Rani", "Dimas")
    await send(client, team_id, rani, "Deal kita pakai Docker karena deploy jadi seragam.")
    await send(client, team_id, rani, "draf pribadi", room="private")
    await client.post(f"/v1/teams/{team_id}/notes", headers=rani.h, json={"title": "n", "text": "rahasia"})
    await worker.drain()
    item = (await client.get(f"/v1/teams/{team_id}/brain", headers=dimas.h)).json()["items"][0]
    await client.post(f"/v1/memory/{item['id']}/confirm", headers=rani.h, json={"action": "confirm"})
    await worker.drain()
    await admin_conn.execute("delete from auth.users where id = $1", rani.id)  # 07-review A1/A2
    tid = uuid.UUID(team_id)
    assert await admin_conn.fetchval(
        "select count(*) from memory_items where team_id = $1 and scope = 'private'", tid) == 0
    assert await admin_conn.fetchval(
        "select count(*) from messages where team_id = $1 and room = 'private'", tid) == 0
    kept = await admin_conn.fetchrow("select owner_id, confirmed_by, status from memory_items where id = $1",
                                     uuid.UUID(item["id"]))
    assert kept["status"] == "confirmed" and kept["owner_id"] is None and kept["confirmed_by"] is None
    assert await admin_conn.fetchval(
        "select count(*) from audit_log where actor_user_id = $1", rani.id) > 0
