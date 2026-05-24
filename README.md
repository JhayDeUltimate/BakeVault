# BakeVault

BakeVault is a full-stack React storefront for a Lagos-based baking supplies business. Customers browse product categories, open product details, add items to an order bag, and send quote requests through WhatsApp. The same app includes a Supabase-backed admin panel for catalog management, enquiries, product requests, testimonials, store settings, analytics, and admin activity logs.

## Stack

- React 19, TypeScript, Vite 6, React Router 7
- Tailwind CSS v4 through `@tailwindcss/postcss`
- Supabase Auth, Postgres, Storage, and Edge Functions
- Google Gemini plus Tavily search in the Supabase `ai-assistant` function
- Recharts for admin analytics
- PostHog helper integration and first-party Supabase analytics events
- Sentry browser error monitoring and session replay when configured

## App Map

```text
src/
  App.tsx                         # Route tree for public and admin pages
  main.tsx                        # React root, Helmet, Sentry, PostHog, auth providers
  index.css                       # Tailwind import, theme tokens, global overflow guards
  constants.ts                    # Categories and WhatsApp runtime config
  components/
    Header.tsx                    # Fixed public header
    PublicLayout.tsx              # Public shell, cart/category drawers, footer, consent, toast
    Cart.tsx                      # Order drawer and WhatsApp quote checkout
    CategoryMenu.tsx              # Mobile navigation/category drawer
    ProductCard.tsx
    ProductModal.tsx
    ProductAssistant.tsx
    ProductRequestModal.tsx
    RecentlyViewedStrip.tsx
    sections/                     # Hero, About, Testimonials, Footer
    ui/                           # BrandLogo, SectionHeading, skeletons, toast, consent
    admin/                        # Protected route, product form, image uploads
  hooks/                          # Data hooks, tracking hooks, consent, recently viewed
  lib/
    api.ts                        # Supabase reads/writes, storage uploads, analytics summaries
    auth-context.tsx              # Supabase Auth plus admin resolution
    cart-context.tsx              # Local cart state with 7-day localStorage expiry
    analytics.ts                  # Consent-gated first-party event logging
    admin-activity.ts             # Best-effort immutable admin action logging
    image.ts                      # Image fallback, galleries, lightweight proxy optimization
    supabase.ts                   # Typed Supabase client
    database.types.ts             # Local database type definitions
  views/
    *.tsx                         # Public pages
    landing/                      # SEO landing pages
    admin/                        # Admin dashboard and CRUD screens

supabase/functions/ai-assistant/  # Deno Edge Function for AI chat and product-image analysis
scripts/generate-sitemap.mjs      # Build-time sitemap generator
public/                           # Static assets, manifest, robots.txt, generated sitemap
```

## Public Routes

- `/` - home page with featured product hero, about section, featured products, recently viewed products, and testimonials.
- `/catalog` - searchable and filterable catalog. Supports category deep links through `?cat=Category+Name`.
- `/products/:slug` - standalone product page with image gallery, SEO metadata, structured product data, add-to-order CTA, AI assistant, and recently viewed products.
- `/about`, `/faq`, `/how-to-order`, `/delivery`, `/contact` - customer information pages.
- `/terms`, `/privacy` - legal pages, with configurable "last updated" text from settings.
- `/yogurt-starter-lagos`, `/kefir-starter-lagos`, `/bread-improver-lagos` - SEO landing pages for high-intent product categories.
- `*` - public 404 inside the normal public layout.

## Admin Routes

- `/admin/login` - Supabase email/password login, forgot-password email trigger, and non-admin account handling.
- `/admin/reset-password` - Supabase password recovery completion page.
- `/admin/dashboard` - store stats, recent enquiries, analytics cards, activity chart, top added-to-cart products, and CSV export.
- `/admin/products` - paginated product management with search, sorting, availability toggle, hero/featured flag, display order, image gallery, storage deletion, and AI product analysis.
- `/admin/categories` - category create, rename, delete, and ordering support.
- `/admin/enquiries` - WhatsApp quote enquiries with status filters and status transitions.
- `/admin/requests` - customer product requests with contact details and workflow statuses.
- `/admin/activity` - recent admin activity log with filtering.
- `/admin/testimonials` - testimonial create, edit, hide/show, and delete.
- `/admin/settings` - WhatsApp number, Instagram handle, contact email, business hours, and legal-page dates.

Admin routes are protected by `ProtectedRoute`. Users are created in Supabase Authentication, then promoted by inserting their auth user id into the public `admins` table. `VITE_ADMIN_EMAILS` exists as a local fallback, but it is intentionally warned against in production because it exposes admin emails in the client bundle.

## Main Features

- Mobile-first storefront with fixed header, slide-out category menu, cart drawer, and floating WhatsApp CTA.
- Product catalog backed by Supabase with category filtering, debounced search, loading skeletons, and SEO metadata per category.
- Product pages and modals with multi-image galleries, similar products, recently viewed products, and product-specific Gemini chat.
- Order bag stored in `localStorage` under `bakevault:cart`, with a 7-day expiry.
- WhatsApp checkout that formats quote requests and logs enquiries to Supabase without blocking the user.
- Product request form for out-of-stock or missing products.
- Cookie/analytics consent banner. First-party analytics events are only inserted after consent is accepted.
- Admin product image upload to Supabase Storage with JPEG/PNG/WebP validation and a 5 MB limit.
- Best-effort admin activity logging for product, category, enquiry, testimonial, setting, image, and auth actions.
- SEO support through `react-helmet-async`, Open Graph/Twitter tags, JSON-LD, `robots.txt`, manifest metadata, and a build-time sitemap.

## Environment Variables

Create `.env.local` from `env.local.example`.

```env
VITE_SENTRY_DSN=
VITE_WHATSAPP_NUMBER=
VITE_INSTAGRAM_HANDLE=
VITE_CONTACT_EMAIL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=
VITE_PUBLIC_POSTHOG_HOST=
```

Additional optional client variables used by the code:

```env
VITE_WHATSAPP_CTA_LABEL=
VITE_WHATSAPP_CTA_PREFILL=
VITE_APP_VERSION=
VITE_ADMIN_EMAILS=
```

`VITE_ADMIN_EMAILS` should only be used for local fallback access. Prefer the `admins` table for production authorization.

## Supabase Requirements

The runtime app expects these public Postgres tables:

- `admins` - maps Supabase Auth user ids to admin access.
- `categories`
- `products`
- `enquiries`
- `testimonials`
- `settings`
- `product_requests`
- `analytics_events`
- `admin_activity_logs`

No `profiles` table is required by the current backend flow. Admin access is resolved from Supabase Auth plus the `admins` table only.

The repository does not currently include SQL migrations. The expected runtime table shapes are reflected in `src/lib/database.types.ts`, though that generated type file may contain legacy entries that are no longer used by the app.

Storage requirement:

- Bucket: `bakevault-images`
- Product upload prefix: `products/`
- Accepted upload types: JPEG, PNG, WebP
- Max client-side upload size: 5 MB

## AI Edge Function

The Supabase Edge Function lives at `supabase/functions/ai-assistant/index.ts`.

It supports two modes:

- `chat` - customer product Q&A from product pages and product modals.
- `analyze` - admin product-image analysis that suggests a product name and structured description.

The function uses:

- Gemini models in fallback order: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`
- Tavily search for current product context
- CORS allowlisting from `ALLOWED_ORIGINS`
- Session-keyed IP rate limiting for chat mode (30 messages per minute per IP)
- SSRF checks for image analysis URLs
- 25-second fetch timeouts and an 8 MB image fetch limit

Set function secrets:

```bash
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase secrets set TAVILY_API_KEY=your-tavily-key
supabase secrets set ALLOWED_ORIGINS="https://bakevault.com.ng,https://www.bakevault.com.ng"
```

Deploy:

```bash
supabase functions deploy ai-assistant --no-verify-jwt
```

`--no-verify-jwt` is required because the browser calls the function with the public anon key.

## Development

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

The configured dev server runs at:

```text
http://localhost:3000
```

On Windows PowerShell, if script execution blocks `npm`, use:

```bash
npm.cmd run dev
```

Build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Available npm scripts:

- `npm run dev` - start Vite.
- `npm run sitemap` - generate `public/sitemap.xml`.
- `npm run build` - run sitemap generation, then `vite build`.
- `npm run preview` - serve the production build locally.

There is no dedicated test script in `package.json` at the moment.

## Sitemap and SEO

`npm run build` runs `scripts/generate-sitemap.mjs` before Vite builds. The script:

- Writes static public routes.
- Fetches available product slugs from Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present.
- Falls back to a static-only sitemap if Supabase config is missing or the fetch fails.
- Writes to `public/sitemap.xml`, so production builds can modify that file.

Static SEO assets:

- `index.html` contains site-wide meta, Open Graph/Twitter tags, JSON-LD LocalBusiness data, fonts, favicon, and manifest links.
- `public/robots.txt` allows public crawling and disallows `/admin/`.
- `public/manifest.json` declares BakeVault Lagos as an installable-style web app.
- `public/404.html` is a static-host fallback.

## Analytics and Monitoring

First-party analytics:

- Implemented in `src/lib/analytics.ts`.
- Stored in `analytics_events`.
- Gated by `bakevault:cookie_consent` in localStorage.
- Tracks page views, product views, add-to-cart, checkout, cart clear, product requests, search, and WhatsApp clicks.

PostHog:

- `PostHogProvider` is mounted in `src/main.tsx`.
- `useTrack()` wraps `usePostHog()` and no-ops when PostHog is unavailable.

Sentry:

- Enabled only when `VITE_SENTRY_DSN` is set.
- Uses browser tracing and replay.
- Samples all traces in development, 10% in production.
- Replays all errored sessions and 5% of production sessions.
- Strips cookies and authorization headers before events are sent.

## Operational Notes

- Product images use original URLs or `images.weserv.nl` for lightweight resizing. Supabase Storage transforms are not used because they require a paid Supabase plan.
- `CartProvider` locks body scroll while the cart or category drawer is open.
- Public settings are fetched once in `PublicLayout` and shared through `SettingsContext`.
- The mobile WhatsApp CTA is dismissible per session with `sessionStorage`.
- Recently viewed products are stored in `localStorage` under `bakevault:recently_viewed`, capped at 10 items, and synced across tabs.
- Admin activity writes to `admin_activity_logs` and falls back to `analytics_events` when the dedicated table insert fails.
- Product slugs are generated during creation and frozen on subsequent updates, ensuring that renaming a product doesn't break its original URL.
