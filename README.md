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
    api.ts                        # Supabase reads/writes, function calls, storage uploads, analytics summaries
    auth-context.tsx              # Supabase Auth plus admin resolution
    cart-context.tsx              # Local cart state with 7-day localStorage expiry
    analytics.ts                  # Consent-gated first-party event logging
    admin-activity.ts             # Best-effort immutable admin action logging
    faq.ts                        # FAQ fallback content and database mapping
    image.ts                      # Image fallback, galleries, lightweight proxy optimization
    supabase.ts                   # Typed Supabase client
    database.types.ts             # Local database type definitions
  views/
    *.tsx                         # Public pages
    landing/                      # SEO landing pages
    admin/                        # Admin dashboard and CRUD screens

supabase/functions/               # Deno Edge Functions for AI, notifications, and image deletion
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
- `/admin/faq` - FAQ category and question management with ordering and visibility controls.
- `/admin/settings` - WhatsApp number, Instagram handle, contact email, business hours, and legal-page dates.

Admin routes are protected by `ProtectedRoute`. Users are created in Supabase Authentication, then promoted by inserting their auth user id into the public `admins` table.

## Main Features

- Mobile-first storefront with fixed header, slide-out category menu, cart drawer, and floating WhatsApp CTA.
- Product catalog backed by Supabase with category filtering, debounced search, loading skeletons, and SEO metadata per category.
- Product pages and modals with multi-image galleries, similar products, recently viewed products, and product-specific Gemini chat.
- Order bag stored in `localStorage` under `bakevault:cart`, with a 7-day expiry.
- WhatsApp checkout that formats quote requests and logs enquiries to Supabase without blocking the user.
- Product request form for out-of-stock or missing products.
- Database-backed FAQ content with public fallbacks and admin-managed visibility.
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
```

## Supabase Requirements

The runtime app expects these public Postgres tables:

- `admins` - maps Supabase Auth user ids to admin access.
- `profiles`
- `categories`
- `products`
- `enquiries`
- `testimonials`
- `settings`
- `product_requests`
- `faq_categories`
- `faq_items`
- `analytics_events`
- `admin_activity_logs`

### Database Setup

The full schema lives in `supabase/migrations/`. To bootstrap a new project:

```bash
# 1. Link to your Supabase project (or start a local instance)
supabase link --project-ref <your-project-ref>

# 2. Push all migrations in order
supabase db push
```

For a local development environment:

```bash
supabase start          # starts local Docker containers
supabase db reset       # runs all migrations from scratch
```

Migration files (run in lexicographic order):

| File | Purpose |
|------|---------|
| `000001_initial_schema.sql` | Core tables, indices, and RLS policies |
| `202605210001_reviews_and_notifications.sql` | Testimonial rating column, review insert policy |
| `202605220001_analytics_views.sql` | Analytics summary and top products views |
| `202605220002_analytics_totals_fn.sql` | `get_analytics_totals` RPC function |
| `202605220004_image_urls_as_array.sql` | Product gallery image array support |
| `202605250001_admin_rls_policies.sql` | Admin-only SELECT/UPDATE RLS for sensitive tables |
| `202605260001_testimonial_moderation_rls.sql` | Review moderation and public testimonial visibility rules |
| `202605260002_db_guardrails_and_indexes.sql` | Database constraints, indexes, and hardening updates |
| `202605260003_category_seo_metadata.sql` | Category SEO metadata fields |
| `202605260004_admin_write_policies.sql` | Admin write policies and image-deletion guardrails |
| `202605260005_faq_cms.sql` | FAQ categories/items CMS tables, seed data, and RLS policies |

Storage requirement:

- Bucket: `bakevault-images`
- Product upload prefix: `products/`
- Accepted upload types: JPEG, PNG, WebP
- Max client-side upload size: 5 MB

## Supabase Edge Functions

Edge Functions live in `supabase/functions/`.

### `ai-assistant`

`supabase/functions/ai-assistant/index.ts` supports AI chat and product-image analysis.

It supports two modes:

- `chat` - customer product Q&A from product pages and product modals.
- `analyze` - admin product-image analysis that suggests a product name and structured description.

The function uses:

- Gemini models in fallback order: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`
- Tavily search for current product context
- CORS allowlisting from `ALLOWED_ORIGINS`
- Session-keyed IP rate limiting for chat mode (30 messages per minute per IP, via Deno KV)
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

### `notify-admin`

`supabase/functions/notify-admin/index.ts` sends best-effort admin notifications after customer actions such as product requests. Deploy it with the normal Supabase function JWT verification defaults unless the calling flow changes.

Set function secrets:

```bash
supabase secrets set RESEND_API_KEY=your-resend-key
supabase secrets set ADMIN_EMAIL="admin@example.com"
supabase secrets set RESEND_FROM_EMAIL="BakeVault <orders@example.com>"
```

```bash
supabase functions deploy notify-admin
```

### `delete-product-image`

`supabase/functions/delete-product-image/index.ts` deletes product images from Supabase Storage through a server-side guardrail. This keeps privileged storage deletion out of the browser.

The function expects the standard Supabase runtime secrets plus service-role access:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

```bash
supabase functions deploy delete-product-image
```

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

Build and regenerate the sitemap:

```bash
npm run build:full
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

Available npm scripts:

- `npm run dev` - start Vite.
- `npm run sitemap` - generate `public/sitemap.xml`.
- `npm run build` - run `vite build`.
- `npm run build:full` - generate the sitemap, then run `vite build`.
- `npm run preview` - serve the production build locally.
- `npm test` - start Vitest in watch mode.
- `npm run test:run` - run the Vitest suite once.
- `npm run gen:types` - regenerate Supabase TypeScript types into `src/lib/database.types.ts`.

## Sitemap and SEO

`npm run build:full` runs `scripts/generate-sitemap.mjs` before Vite builds. You can also run the sitemap script directly with `npm run sitemap`. The script:

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
- Image deletion validates the URL against the Supabase Storage hostname and public path prefix before attempting removal, safely ignoring external image URLs.
- `CartProvider` locks body scroll while the cart or category drawer is open.
- Public settings are fetched once in `PublicLayout` and shared through `SettingsContext`.
- The mobile WhatsApp CTA is dismissible per session with `sessionStorage`.
- Recently viewed products are stored in `localStorage` under `bakevault:recently_viewed`, capped at 10 items, and synced across tabs.
- Admin activity writes to `admin_activity_logs` and falls back to `analytics_events` when the dedicated table insert fails.
- Product slugs are generated during creation and frozen on subsequent updates, ensuring that renaming a product doesn't break its original URL.
- Customer-submitted reviews default to `is_visible: false` and must be approved by an admin before they appear on the storefront.
- Enquiry logging retries once after a 1-second delay before giving up, since enquiries are business-critical records.
- Chat rate limiting uses Deno KV in the edge function, not the `analytics_events` table, to avoid inflating the analytics table with non-storefront rows.
- Admin analytics summary reads from `analytics_daily_summary` and `analytics_top_products` views when available, reducing raw row scans.
- Admin product listing supports full server-side sorting, including category name sorting via Supabase `referencedTable` ordering.

## Creating an Admin User

Admin access is controlled by the `admins` table. There is no self-registration. To grant admin access:

1. The user must first create an account by logging in at `/admin/login` (they will fail auth, which is expected)
2. Go to [Supabase Dashboard](https://supabase.com/dashboard) -> your project -> **Authentication** -> **Users**
3. Find the user's UUID
4. Go to **Table Editor** -> **admins** table -> **Insert row**
5. Enter the UUID in the `user_id` field -> **Save**
6. The user can now log in at `/admin/login`

### Infrastructure
- [ ] Custom domain is configured and HTTPS certificate is active
- [ ] `VITE_WHATSAPP_NUMBER` is set to the correct production number
- [ ] `VITE_CONTACT_EMAIL`, `VITE_INSTAGRAM_HANDLE` are set
- [ ] Supabase project is on Pro plan (for PITR backup and Storage transforms)
- [ ] GitHub secrets are configured for CI/CD: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### SEO & Content
- [ ] Run `npm run build:full` (not `npm run build`) to generate the sitemap
- [ ] Submit `https://yourdomain.com/sitemap.xml` to Google Search Console
- [ ] Verify `public/robots.txt` disallows `/admin/`
- [ ] At least 5 products are published with images and descriptions
- [ ] All FAQ categories have at least 2 visible questions
- [ ] Business hours are set in Admin -> Settings
- [ ] WhatsApp number in Admin -> Settings matches `VITE_WHATSAPP_NUMBER`

### Testing
- [ ] Place a complete test order end-to-end: add to cart -> request quote -> confirm WhatsApp opens
- [ ] Submit a test product request and verify admin email is received
- [ ] Submit a test review and verify admin can approve it
- [ ] Test admin login, product creation, category creation, and settings save

### Performance
- [ ] Run Lighthouse audit on `/`, `/catalog`, and a product page - target LCP < 2.5s on 4G
- [ ] Verify all product images load (no broken image fallbacks on the live catalog)

## WhatsApp Order Flow (for Store Staff)

1. Customer browses the catalog at `yourdomain.com/catalog`
2. Customer adds products to their bag and taps "Request a Quote on WhatsApp"
3. WhatsApp opens with a pre-filled message listing the items and pricing preferences
4. **Admin receives the WhatsApp message AND an enquiry is logged in Admin -> Enquiries**
5. Admin replies on WhatsApp with pricing, confirms availability
6. Customer confirms the order on WhatsApp
7. Admin shares bank account details
8. Customer transfers payment
9. Admin marks the enquiry as "Responded" in the admin panel, then "Fulfilled" when delivered
10. Delivery is arranged; Lagos orders go same-day if confirmed before 2PM
