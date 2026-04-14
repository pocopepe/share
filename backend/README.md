## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Run local worker:

```bash
bun run dev
```

The worker runs on `http://127.0.0.1:8787` by default.

## Production Setup

1. Configure secrets in Wrangler/Cloudflare:
- R2 is accessed directly via the `MY_BUCKET` binding in `wrangler.toml`.
- Set `LOGIN_PASSWORD` and `AUTH_TOKEN_SECRET` with `wrangler secret put`.

2. Deploy:

```bash
bun run deploy
```

## Retention Rules

- Guest uploads: 3 days
- Logged-in uploads: 60 days

Expired files are removed by:
- Scheduled cron cleanup (configured in `wrangler.toml`)
- On-access checks when downloading/retrieving
