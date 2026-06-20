# BakeVault Production Readiness Audit And Implementation Plan

Audit date: 2026-06-20

Scope: checklist in the Codex attachment, checked against the current local repository at `C:\Users\oweni\Documents\bakevault`.

This is a repository audit, not a live production audit. Items that depend on hosted settings, Supabase dashboard configuration, Vercel project settings, DNS, real emails, real phones, real browser/device checks, or production data are marked as external verification.

## Current Verification

The following checks were run locally and passed:

- `npx.cmd tsc --noEmit`
- `npm.cmd run test:run` - 5 test files, 20 tests passed.
- `npm.cmd run build`

Current working tree had existing uncommitted changes before this plan was created:

- `.github/workflows/health-check.yml`
- `README.md`
- `public/404.html`
- `src/components/ProductAssistant.tsx`
- `src/index.css`
- `src/lib/image.ts`
- `supabase/functions/cleanup-orphaned-images/index.ts`
- `supabase/functions/delete-product-image/index.ts`
- `supabase/functions/notify-admin/index.ts`
- `vercel.json`
- `public/404.css` untracked

This plan file is the only intentional new file from this audit task.

## Executive Summary

BakeVault is already past the basic prototype stage. It has real Supabase Auth, RLS migrations, admin route protection, Supabase Edge Functions, Vercel headers, CI, a README, legal pages, Sentry/PostHog integrations, health checks, and an operations runbook.

The main remaining work is not "build the whole app". It is production hardening:

- Move unclear or externally configured checklist items into a verifiable production launch checklist.
- Fix a small number of clear code gaps: direct production console usage, incomplete offline states, weak pasted-image URL validation, product fetch error UX, missing lint wiring, and analytics consent mismatch.
- Expand tests from utility/unit coverage into critical user-flow and authorization coverage.
- Verify production infrastructure: Supabase Auth settings, email reset, backups/PITR, secrets, Vercel custom domain, health checks, Sentry/PostHog, DNS, and rollback.
- Run manual QA on real devices, browsers, slow networks, and production data.

## Status Legend

- Done: supported by code/config in the repo.
- Partial: implemented, but incomplete or has a known tradeoff.
- Gap: not implemented or clearly missing.
- External verification: cannot be proven from repo files alone.
- Not applicable: no evidence this app needs it now.

## Checklist Audit

### 1. Authentication And Access Control

Status: Partial

Done:

- Real authentication uses Supabase Auth in `src/lib/auth-context.tsx`.
- No hardcoded admin login or fake user was found.
- Admin routes are protected by `src/components/admin/ProtectedRoute.tsx`.
- Admin role is resolved from the `admins` table.
- Supabase RLS policies restrict admin reads/writes in migrations.
- Forgot-password UI exists at `/admin/login` and reset completion exists at `/admin/reset-password`.
- Admin-only Edge Functions check the caller's JWT and admin table membership.

Partial or gap:

- Browser Supabase Auth uses default client-side session persistence, which normally stores tokens in browser storage, not HTTP-only cookies.
- Login/signup rate limiting is not implemented in app code. Supabase dashboard settings may cover this, but that needs verification.
- Failed login errors are surfaced from Supabase directly, so wording may reveal details depending on provider response.
- Admin login navigates to dashboard immediately after `signIn`, before admin status is fully resolved. `ProtectedRoute` should block non-admins, but the flow should be tested and possibly tightened.
- Two-factor authentication is not implemented in app code.

External verification:

- Supabase Auth password hashing, token expiration, refresh-token lifetime, email verification settings, recovery-link expiry, SMTP settings, and any auth-provider brute-force protections.
- Real reset email delivery.
- Authorization testing by trying to access another user's/admin-only data.

### 2. Secrets And Environment Variables

Status: Partial

Done:

- Runtime env variables are documented in `README.md` and `env.local.example`.
- `.env`, `.env.local`, `*.local`, `.vercel`, `node_modules`, and `dist` are ignored.
- `git log --all --full-history -- .env` returned no commits.
- Repo scan found variable names and placeholders, not obvious live secrets.
- CI uses Gitleaks.

Partial or gap:

- There is no dedicated secrets inventory document with owner, storage location, environment, permissions, and rotation date.
- Repo history was not fully scanned with a dedicated historical secret scanner locally; CI has Gitleaks, but current run status is external.
- Third-party key scopes and revoked-unused-secret status are external.

External verification:

- Vercel/GitHub/Supabase secrets are configured in the provider dashboards.
- Development, staging, and production use separate keys/databases.
- Any previously exposed key has been rotated.

### 3. Data And Database

Status: Partial

Done:

- Versioned Supabase migrations exist.
- RLS is enabled for app tables.
- Admin-only RLS policies exist for sensitive tables.
- Public reads are restricted where needed, for example only available products and visible testimonials.
- Public inserts have constraints and throttling policies.
- Required fields, defaults, unique constraints, indexes, FK behavior, and check constraints exist across migrations.
- Admin analytics uses summary views/RPCs instead of reading all raw rows for dashboard charts.
- FAQ seed data exists and appears to be site content, not test accounts.

Partial or gap:

- Storage bucket creation is documented but commented out in the initial migration, so a new project needs manual bucket setup unless another process handles it.
- Throttle key fallback to `x-bakevault-session-id` improves mobile support but is weaker than a purely server-derived key.
- There is no automated RLS regression test suite in the repo.
- No local proof that production has no test data.

External verification:

- Production database instance, connection pooling, network restrictions, backups/PITR, restore drills, encryption at rest, and disaster-response timing.
- GDPR deletion process if serving European users.

### 4. Error Handling And Screen States

Status: Partial

Done:

- Many screens have loading, empty, error, and success states.
- Public catalog uses skeleton loading and empty search guidance.
- Forms use disabled submit states to reduce double submissions.
- Product request and review forms validate required fields and preserve user input after failures.
- File uploads validate MIME type and size for uploaded files.
- Friendly error mapping exists in `src/lib/error-messages.ts`.
- React error boundaries exist.

Partial or gap:

- Offline is not a first-class screen state across the app.
- Product detail load failure redirects to `/catalog` rather than showing a page-specific error/retry state.
- Some operations have explicit timeouts, but many Supabase reads/writes rely on default browser/network behavior.
- Direct `console.*` calls remain in production paths.
- `AdminDashboard` uses `alert()` for CSV errors.
- Pasted image URLs are lightly validated and can be external; uploaded files are better controlled than URL inputs.

### 5. Hosting And Deployment

Status: Partial

Done:

- Vercel config exists with caching and security headers.
- CI deploy jobs exist for `develop` staging and `main` production.
- Health-check workflow exists and runs every 30 minutes when configured.
- Static `/health.json` exists.
- Supabase backend health Edge Function exists.
- Operations runbook documents CDN, scaling, and recovery.

Partial or gap:

- `README.md` says `npm run build` calls the sitemap generator, but `package.json` only runs sitemap in `build:full`.
- Build passes locally, but production deploy status is not verified.
- `ci.yml` deploy comments still say "Replace with your actual deployment command", even though Vercel commands are present.

External verification:

- Custom domain, HTTPS certificate, DNS redirects, production Vercel env vars, hosting plan, server region, rollback drill, deployed health URLs, and live performance.

### 6. Version Control And Code Quality

Status: Partial

Done:

- Git repo exists with GitHub remote.
- Current branch is `develop`; `main` also exists.
- Recent commit messages are readable.
- `.gitignore` covers env files, dependencies, build output, and OS/local files.
- README is extensive.
- TypeScript strict mode is enabled.
- Current TypeScript check passes.
- Small public image assets are tracked; no large binary media files were found.

Partial or gap:

- ESLint config exists, but there is no `lint` script.
- ESLint config references plugins that are not installed as top-level dev dependencies.
- CI does not run lint.
- Direct `console.*` calls remain.
- Some stale comments reference old migration names.
- Current repo has uncommitted changes that should be intentionally reviewed before batching implementation.

External verification:

- Branch protection, PR requirements, stale branch cleanup, rollback practice, and no direct commits to `main`.

### 7. Testing And QA

Status: Partial

Done:

- Vitest exists and passes.
- Current tests cover cart persistence, product display order, FAQ mapping, product-description parsing, and one `useProducts` behavior.

Gap:

- No end-to-end test suite for signup/login/admin/product/category/enquiry/review/order flows.
- No automated tests for protected route redirects.
- No RLS authorization regression tests.
- No upload edge-case tests.
- No browser/device/slow-network/manual QA record.

External verification:

- Real mobile device, two browsers, Slow 3G, real email reset, production protected page behavior, URL manipulation, and another-person usability test.

### 8. Performance And Optimization

Status: Partial

Done:

- Route-level lazy loading is implemented.
- Admin views are lazy loaded away from storefront routes.
- Vercel cache headers exist.
- Product/admin list APIs have pagination.
- Product search has trigram DB index.
- Images are lazy-loaded in many places.
- `src/lib/image.ts` and README describe image proxy optimization.
- Production build passes.

Partial or gap:

- No Lighthouse/PageSpeed artifacts in repo.
- Build output shows large vendor chunks: React, charts, analytics, Supabase, and Sentry.
- Vercel Analytics and Speed Insights add client overhead.
- Product image dimensions/modern formats cannot be fully verified from code.
- Need realistic-data performance test with 100+ products.

External verification:

- Real live page load times, LCP/CLS/INP, CDN behavior, and production image performance.

### 9. Maintenance And Monitoring

Status: Partial

Done:

- Sentry dependency and browser initialization exist.
- Sentry source-map upload is configured when `SENTRY_AUTH_TOKEN` is present.
- PostHog integration exists and is gated by consent.
- Vercel Analytics and Speed Insights are mounted.
- First-party analytics events exist.
- Health-check workflow exists.
- Operations runbook exists.
- `npm audit --audit-level=high` runs in CI.

Partial or gap:

- No Dependabot/Renovate config exists.
- No incident template or recurring maintenance checklist file beyond the runbook.
- Sentry replay config uses `maskAllText: false` and `blockAllMedia: false`; privacy review needed.
- Logs are partly in Sentry/Supabase but app-wide log retention/access is not documented.

External verification:

- Sentry project, alert rules, uptime monitor secrets, PostHog/Vercel analytics dashboards, dependency update process, and recurring calendar reminder.

### 10. Legal And Compliance

Status: Partial

Done:

- Privacy page exists.
- Terms page exists.
- Consent banner exists.
- Privacy page mentions data deletion requests.
- Payment flow uses bank transfer and does not store card numbers.
- AI assistant includes an in-app accuracy disclaimer.

Partial or gap:

- Consent banner gates PostHog and first-party Supabase analytics, but Vercel Analytics is mounted unconditionally.
- Privacy page says no tracking cookies, but the app uses localStorage analytics consent, first-party analytics, PostHog when accepted, Vercel Analytics, and visitor/session identifiers. Wording should be reviewed.
- No copyright/inappropriate-content process for user-submitted reviews beyond moderation.
- No trademark/domain review evidence.

Not applicable unless business scope changes:

- COPPA/children under 13.
- PCI obligations beyond using no card storage, unless card/payment processor is added.

## Implementation Plan By Batch

### Batch 0: Freeze Current State And Production Access Checklist

Purpose: make sure every future batch starts from a known baseline.

Tasks:

- Review and commit or shelve current uncommitted changes.
- Create a production verification checklist for external items:
  - Vercel custom domain, SSL, DNS redirect, env vars, deployment history, rollback.
  - Supabase Auth settings: email confirmation, recovery expiry, token/session expiry, SMTP, rate limits, MFA availability.
  - Supabase database: Pro/PITR/backups, restore drill date, connection pooling, storage bucket config.
  - GitHub repository: branch protection, required checks, secrets, environments.
  - Sentry/PostHog/Vercel analytics dashboards and alert rules.
- Decide whether this project needs HTTP-only auth cookies. For a pure Vite/Supabase SPA, this is a larger architecture change.

Acceptance criteria:

- A signed-off launch checklist exists.
- Current dirty working tree is intentionally resolved.
- External unknowns have owners and due dates.

### Batch 1: Security, Auth, Secrets, And Access Control Hardening

Purpose: close the highest-risk checklist gaps first.

Tasks:

- Normalize auth error messages so failed login does not expose provider-specific details.
- Tighten admin login navigation so dashboard routing waits for admin resolution or fails closed with a clear non-admin state.
- Document Supabase Auth configuration with screenshots or exact dashboard values.
- Add a `docs/secrets-inventory.md` with secret name, environment, storage location, provider, purpose, required permissions, and rotation date.
- Add RLS/authorization smoke tests or scripts:
  - anonymous cannot read admin-only tables.
  - non-admin authenticated user cannot read/write admin tables.
  - admin can perform expected reads/writes.
  - public can only insert allowed public records.
- Review whether `notify-admin` should require a stricter caller path or idempotency guard beyond CORS and row lookup.
- Decide whether the session-token storage checklist item is acceptable with Supabase SPA defaults or requires a server/auth proxy architecture.

Acceptance criteria:

- Non-admin cannot reach admin data via UI or direct Supabase client calls.
- Login failures use generic user-facing wording.
- Secrets inventory exists.
- Auth dashboard settings are verified and documented.

### Batch 2: App Reliability, Error States, And Form Hardening

Purpose: improve user-visible failure behavior before adding more features.

Tasks:

- Replace direct production `console.*` calls with `logger` or structured Edge Function logging where appropriate.
- Add app-level online/offline detection and reusable offline banner/state.
- Add page-specific product detail error UI with retry instead of silent redirect to catalog.
- Replace `alert()` in admin CSV export with inline error UI.
- Add explicit timeout handling around key Supabase operations that currently can spin indefinitely.
- Validate pasted image URLs more strictly:
  - required protocol.
  - max URL length.
  - optional allowed host/prefix rules for admin AI analyze and storage deletion.
  - visible error for invalid external image URLs.
- Ensure all destructive admin actions keep state and show inline failure messages.

Acceptance criteria:

- No direct `console.*` in production browser code outside the logger module or build scripts.
- Offline state is visible on major public/admin workflows.
- Product detail failures are recoverable.
- Pasted image URLs are validated consistently.

### Batch 3: CI, Code Quality, And Automated Tests

Purpose: make regressions harder to ship.

Tasks:

- Decide ESLint approach:
  - either install missing ESLint plugins and add `npm run lint`, or remove stale `.eslintrc.cjs` and use a current flat config.
- Add `lint` to CI.
- Fix README/package mismatch around sitemap generation:
  - either make `build` run sitemap, or update README to say production deploys must use `build:full`.
- Add tests for:
  - `ProtectedRoute` logged-out redirect.
  - non-admin admin access handling.
  - admin login generic error wording.
  - product request validation and duplicate-submit prevention.
  - review validation and honeypot behavior.
  - image upload MIME/size rejection.
  - friendly error mapping for RLS, duplicate, timeout, and check constraints.
- Add optional Playwright E2E for:
  - catalog search/filter.
  - add to cart to WhatsApp quote.
  - admin login redirect behavior.
  - product creation/edit happy path using test Supabase/local mocks if feasible.

Acceptance criteria:

- CI runs secret scan, audit, type check, tests, lint, and build.
- Critical user flows have automated coverage.
- Documentation matches package scripts.

### Batch 4: Performance And Frontend Optimization

Purpose: reduce load time and validate live performance.

Tasks:

- Run Lighthouse on `/`, `/catalog`, and one product page on production or preview.
- Add bundle analysis for Vite chunks.
- Review whether Recharts can remain fully admin-lazy-loaded and not affect storefront.
- Review Vercel Analytics, Speed Insights, Sentry replay, and PostHog payload impact.
- Add image-dimension and format review:
  - public assets are already small.
  - verify product images are right-sized and not broken.
  - define recommended upload dimensions and compression.
- Test catalog/admin list performance with 100+ products and many enquiries/events.
- Add performance budgets to CI if practical.

Acceptance criteria:

- Lighthouse targets are documented.
- LCP target for key pages is agreed, ideally under 2.5s on 4G.
- Bundle-size risks are visible in CI or release notes.
- Product images have documented size/format guidance.

### Batch 5: Monitoring, Maintenance, And Operations

Purpose: make failures observable and recovery practical.

Tasks:

- Verify Sentry project, DSN, source maps, alert rules, and privacy settings.
- Revisit Sentry replay settings, especially `maskAllText` and `blockAllMedia`.
- Verify health-check workflow secrets and that both web and Supabase health endpoints pass.
- Add Dependabot or Renovate config.
- Add `docs/incident-response.md` or extend the runbook with:
  - severity levels.
  - who is notified.
  - rollback steps.
  - customer communication.
  - post-incident review.
- Document where logs live:
  - Vercel deploy logs.
  - Supabase Edge Function logs.
  - Sentry errors/replays.
  - GitHub health-check history.
- Schedule recurring dependency/security/monitoring review.

Acceptance criteria:

- Errors and downtime generate alerts without relying on user reports.
- Dependency updates are automated or scheduled.
- Rollback and restore drills are documented with dates.

### Batch 6: Legal, Privacy, And Compliance Cleanup

Purpose: align actual behavior with public policy text.

Tasks:

- Review privacy policy wording against actual analytics/storage behavior:
  - localStorage cart.
  - localStorage consent.
  - localStorage recently viewed.
  - localStorage caches.
  - first-party analytics events.
  - PostHog when accepted.
  - Vercel Analytics and Speed Insights.
  - Sentry error reporting/replay.
- Decide whether Vercel Analytics must be consent-gated or disclosed differently.
- Add a data deletion request SOP:
  - what identifiers are needed.
  - which Supabase tables are searched.
  - response window.
  - deletion/anonymization steps.
- Add user-content moderation/copyright process for reviews and uploads if uploads become public-user-facing.
- Confirm trademark/domain review for BakeVault and bakevault.com.ng.
- Confirm no children-under-13 targeting.

Acceptance criteria:

- Privacy and consent behavior match what the app actually does.
- Data deletion requests have an operational process.
- Legal pages are reviewed by the business owner or counsel.

## Suggested Batch Order

1. Batch 0: Freeze state and external verification checklist.
2. Batch 1: Security/auth/secrets/access control.
3. Batch 2: Reliability and user-facing failure states.
4. Batch 3: CI, linting, and tests.
5. Batch 5: Monitoring and operations.
6. Batch 4: Performance optimization.
7. Batch 6: Legal/privacy cleanup.

Security and reliability should happen before performance polish. Performance should still happen before final launch or marketing push.

## Immediate High-Value Fixes

These are small enough to do early:

- Add `lint` script and CI lint job, or remove stale ESLint config.
- Replace production browser direct console calls.
- Fix README/package mismatch around `build` vs `build:full`.
- Add product detail error/retry UI.
- Gate or document Vercel Analytics consent behavior.
- Add `docs/secrets-inventory.md`.
- Add `docs/production-launch-checklist.md` for external verification.

## Items That Should Not Be Treated As Code Tasks

These require dashboard/business verification:

- Supabase Pro/PITR and restore test.
- Production database has no test data.
- Real password reset email arrives and expires.
- Real custom domain and HTTPS.
- Real DNS www/non-www redirect.
- Hosting plan traffic capacity.
- Real mobile/two-browser/slow-network QA.
- Another-person usability test.
- Trademark/domain review.

