# BakeVault Operations Runbook

This runbook defines the production setup for caching/CDN, scaling, monitoring, and recovery.

## Caching and CDN

Vercel is the storefront CDN. Cache behavior is configured in `vercel.json`.

- `/assets/*`: immutable one-year browser and CDN cache for Vite hashed build files.
- Public media such as `.png`, `.jpg`, `.webp`, `.svg`, `.ico`, and `.woff2`: one-day browser cache, seven-day CDN cache, and seven-day stale-while-revalidate.
- `/robots.txt`, `/sitemap.xml`, and `/manifest.json`: five-minute cache so search and metadata assets can update quickly.
- `/health.json`: no-cache/no-store so availability monitoring sees the current Vercel edge response.
- `/`: no-store so the app shell is never stuck behind a stale HTML document after deployment.
- Supabase Storage uploads use `cacheControl: '3600'` from `src/lib/api.ts`.
- Product image resizing uses the public `images.weserv.nl` cache path from `src/lib/image.ts`.

When changing caching rules, keep HTML fresh and only make hashed assets immutable.

## Scaling and Load Balancing

BakeVault is intentionally stateless at the web layer.

- Vercel serves the Vite build from its global edge network and load balances requests at the platform layer.
- Supabase manages Postgres, Auth, Storage, PostgREST, and Edge Function routing.
- Browser state is limited to local cart, consent, recently viewed products, and session identifiers.
- Database reads are paginated for admin lists and use views/RPCs for analytics summaries.
- Public writes are throttled by Postgres RLS policies and by the `ai-assistant` Deno KV chat limiter.
- Heavy AI and storage-deletion work runs in Supabase Edge Functions instead of the browser.

Scale-up triggers:

- Move Supabase to a larger compute size when Postgres CPU, memory, or connection pressure is sustained during business hours.
- Add Supabase read replicas only after product/catalog reads become the bottleneck and query/index tuning is exhausted.
- Keep expensive dashboard queries behind summary views or RPCs; do not read raw analytics rows for normal dashboard charts.
- If Edge Function latency rises, reduce request work first, then split functions by workload or region if needed.

## Health Checks

Two production health endpoints are expected:

- Web/CDN: `https://<domain>/health.json`
- Backend: `https://<project>.supabase.co/functions/v1/health-check`

The backend health check is implemented in `supabase/functions/health-check/index.ts` and verifies:

- Supabase credentials are present in the function runtime.
- Postgres can answer a lightweight `settings` query.
- The `bakevault-images` Storage bucket is available.

GitHub Actions runs `.github/workflows/health-check.yml` every 30 minutes. Configure these repository secrets:

- `PRODUCTION_HEALTH_URL`
- `SUPABASE_HEALTH_URL`

Deploy the backend health check:

```bash
supabase functions deploy health-check --no-verify-jwt
```

## Availability and Recovery

Minimum production recovery controls:

- Supabase Pro should be enabled for point-in-time recovery.
- Vercel production deploys must remain reproducible from `main`.
- GitHub repository secrets must include all production deployment and health-check URLs.
- Critical Edge Function secrets must be stored in Supabase secrets, not in the repo.
- `public/sitemap.xml` can be regenerated with `npm run build:full`.

Recovery order:

1. Check GitHub Actions health-check failure details and Sentry for the first failing dependency.
2. If Vercel is down or serving bad assets, roll back to the previous successful Vercel deployment.
3. If Supabase is degraded, check Supabase project status, Edge Function logs, and database health.
4. If a migration caused data or policy breakage, stop new deploys, restore from Supabase PITR, then replay only verified migrations.
5. If Storage is affected, verify the `bakevault-images` bucket and product image URLs before reopening admin uploads.
6. After recovery, submit a test product request and review, then verify admin notifications and dashboard visibility.

Recovery drills:

- Quarterly: restore a Supabase backup into a non-production project and run the app against it.
- Monthly: run `npm run build:full`, `npm run test:run`, and the production health-check workflow manually.
- After every RLS or rate-limit migration: run `supabase db lint --linked` and test public inserts plus admin reads.
