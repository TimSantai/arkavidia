# Project Engineering Standards (ECC)
- Core project requirements, problem brief, and technical architecture for **BERSAMA**: see [CONTEXT.md](CONTEXT.md).
- UI, 4-tier chromatic surface ladder, Ramps WCAG AA tokens, 2-voice typography (`Allo` Variable >= 20px + `Geist Variable` >= 12px), `<AgentStickerAvatar />` (`boopface`), and component architecture guidelines (`@kibo-ui/*` + `@ai-elements/*`): see [DESIGN.md](DESIGN.md).
- Always follow core engineering standards in `.agents/rules/`.
- For Python (`.py`, `.pyi`) and FastAPI backend services, follow the Python rules in `.agents/rules/` and apply the `python-patterns` skill.
- For TypeScript and React/Next.js (`.ts`, `.tsx`, `.js`, `.jsx`), follow the TypeScript rules in `.agents/rules/` and apply the `typescript-patterns` and `frontend-patterns` skills.

## Never-Ship Governance Gate (Frontend UI)
Every frontend change must pass these non-negotiable checks before merge:
- **ZERO `Geist Mono` or `font-mono`** anywhere in UI chrome (no `@fontsource-variable/geist-mono` import). Use `Allo` Variable (`>= 20px`) only for Display/Hero/H1/H2/KPI hero numbers (`tabular-nums`, optical sizing `"opsz" 32, "ROND" 75`) and `Geist Variable` (`>= 12px` floor everywhere) for all UI, body, badges, and timestamps.
- **ZERO text below `12px`** (`text-[10px]` / `text-[11px]` banned; mobile form inputs use `text-base sm:text-sm`).
- **ZERO `transition-all`** (specify exact transition properties).
- **ZERO `Sparkles` icon**, **ZERO decorative emojis**, **ZERO UI em-dashes (`—`)** (use colon, comma, or middot `·`).
- **ZERO clickable `<div>` or `<span>`** (use semantic `<button>`, `<a href>`, `<Link>`, or `<NavLink>`).
- **Single-edge depth & WCAG AA (`>= 4.5:1`):** No double `ring-1` + `border`; enforce `--text-secondary: #bec0c5` on raised dark overlays (`#3d3f44`).
- **Avatars:** Real human portraits (`USER_AVATAR_MAP`) for people; `<AgentStickerAvatar />` (`boopface`) for AI agents.
