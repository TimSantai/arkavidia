# Backend audit (authentication slice)

## Findings and fixes

- `app/features/auth/jwt.py` already verified Supabase JWTs, but it was not an
  OAuth flow and used a raw `Authorization` header dependency. It now uses
  `HTTPBearer`, validates required claims/audience/issuer/algorithm, and emits
  OpenAPI bearer security metadata.
- There was no OAuth initiation, callback code exchange, state validation, or
  Auth-to-application profile synchronization. These now live in
  `app/features/auth/{router,service,repository}.py`.
- The application profile schema is correctly keyed by the Supabase Auth UUID.
  The canonical migration has the Auth trigger and RLS policies. The separate
  `supabase/migrations/Arkavidia.sql` export lacks those runtime objects and
  must not be used alone for deployment; this is documented in `docs/auth.md`.
- Several migrated feature modules imported deleted legacy modules (`app.auth`
  and `app.billing`), causing unit-test collection failures. Compatibility
  modules now re-export the new feature packages without duplicating logic.
- Routers in the existing feature set still contain direct SQL and business
  logic. This auth change does not silently refactor all domain features; the
  new auth slice follows the required router -> service -> repository boundary.
  A full vertical-slice migration is a separate change because it affects every
  existing endpoint and worker transaction.
- The existing `teams.update_me` path can return a null row if the profile is
  absent. Auth callback synchronization now guarantees the profile before a
  user reaches protected application flows; a future domain refactor should
  map that case to a 404 explicitly.

## Current schema/code mapping

| Application concept | Database object |
| --- | --- |
| Auth identity | `auth.users.id` |
| Application profile | `public.users.id = auth.users.id` |
| Team membership | `public.memberships.user_id` |
| Authenticated RLS identity | `request.jwt.claims.sub` / `auth.uid()` |
| API token validation | Supabase JWKS or legacy JWT secret |
