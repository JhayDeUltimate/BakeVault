# BakeVault Secrets Inventory

| Secret Name | Environment | Storage Location | Provider | Purpose | Rotation Schedule |
|---|---|---|---|---|---|
| VITE_SUPABASE_URL | all | GitHub Actions, Vercel | Supabase | Database URL | On project migration |
| VITE_SUPABASE_ANON_KEY | all | GitHub Actions, Vercel | Supabase | Public API key | On key rotation |
| SUPABASE_SERVICE_ROLE_KEY | edge functions | Supabase Secrets | Supabase | Privileged DB access | Quarterly |
| SENTRY_AUTH_TOKEN | CI | GitHub Actions | Sentry | Source map upload | Annual |
| VERCEL_TOKEN | CI | GitHub Actions | Vercel | Deploy trigger | Annual |
| RESEND_API_KEY | edge functions | Supabase Secrets | Resend | Admin email | Annual |
| GEMINI_API_KEY | edge functions | Supabase Secrets | Google | AI assistant | Quarterly |
| TAVILY_API_KEY | edge functions | Supabase Secrets | Tavily | Web search | Quarterly |
| ADMIN_EMAIL | edge functions | Supabase Secrets | — | Notification recipient | On staff change |