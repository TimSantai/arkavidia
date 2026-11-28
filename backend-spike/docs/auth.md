# Supabase OAuth authentication

The API delegates identity and OAuth provider configuration to Supabase Auth. The
API never stores passwords, provider tokens, or OAuth identity data in
`public.users`; that table is an application profile keyed by the same UUID as
`auth.users`.

## Required environment variables

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<publishable-anon-key>
SUPABASE_OAUTH_REDIRECT_URL=http://localhost:8000/v1/auth/callback
SUPABASE_OAUTH_STATE_SECRET=<random-32-byte-secret>
SUPABASE_OAUTH_PROVIDERS=google,github
```

Configure the exact redirect URL in Supabase Dashboard -> Authentication -> URL
Configuration and configure each provider in Authentication -> Providers.
`SUPABASE_OAUTH_STATE_SECRET` signs a short-lived state value and must be the
same across API instances. Do not use the service-role key in the API.

Token verification also requires either:

```dotenv
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
# or, for legacy HS256 projects:
SUPABASE_JWT_SECRET=<legacy-jwt-secret>
SUPABASE_JWT_AUDIENCE=authenticated
SUPABASE_JWT_ISSUER=https://<project-ref>.supabase.co/auth/v1
```

Prefer JWKS for projects using asymmetric signing keys. Access tokens are sent
as `Authorization: Bearer <access-token>`.

## Endpoints

- `GET /v1/auth/oauth/{provider}` starts OAuth and returns an authorization URL
  plus a signed state value.
- `GET /v1/auth/callback?code=...&state=...` exchanges the authorization code,
  verifies the returned Supabase access token, idempotently synchronizes
  `public.users`, and returns the access/refresh token pair.
- `GET /v1/auth/me` verifies the bearer token and returns the application
  profile. It is protected and is the recommended session verification probe.

The callback returns tokens because this backend is the OAuth callback target.
For a browser-only flow, prefer a frontend callback and keep refresh tokens in
its secure storage rather than exposing them to unrelated clients.

## Database alignment

The canonical migration `supabase/migrations/20261125000000_init.sql` creates
`public.users`, links its UUID to `auth.users` through the
`on_auth_user_created` trigger, and applies RLS. The repository upsert is an
idempotent fallback for deployments where the Auth trigger has not yet fired.
`supabase/migrations/Arkavidia.sql` is an export/reference schema and is not the
runnable migration for this API: it does not include the Auth trigger, RLS
policies, or Supabase's `auth` schema.
