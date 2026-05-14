# BakeVault

A full-stack storefront for BakeVault, a wholesale baking supplies business in Lagos, Nigeria. Customers can browse products, add items to a cart, and send order enquiries directly via WhatsApp. The application includes a complete admin panel for managing products, categories, enquiries, testimonials, and store settings.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Features:** Google Gemini 2.5 Flash via a Supabase Edge Function (Deno)
- **Routing:** React Router v7
- **Charts:** Recharts (admin analytics dashboard)

## Project Structure

```text
src/
  components/
    admin/           # Admin-only form and upload components
    sections/        # Page sections (Hero, Footer, About, Testimonials)
    ui/              # Shared UI primitives (BrandLogo, SectionHeading)
  hooks/             # Data-fetching hooks (useProducts, useCategories, etc.)
  lib/
    api.ts           # All Supabase data access functions
    analytics.ts     # Client-side event tracking
    cart-context.tsx # Cart state with localStorage persistence
    database.types.ts
    image.ts         # Image URL utilities and fallback handling
    supabase.ts      # Supabase client initialisation
    utils.ts         # DB-to-UI model mapping
  views/
    admin/           # Admin pages (Dashboard, Products, Categories, etc.)
    *Page.tsx        # Public pages (Home, Catalog, FAQ, Product, Delivery, etc.)
  constants.ts       # Categories, product seed data, WhatsApp config
  index.css          # Global styles and Tailwind theme tokens

supabase/
  functions/
    ai-assistant/    # Deno edge function for Gemini chat and image analysis
    
public/
  sitemap.xml        # XML sitemap for SEO indexing
  robots.txt         # Search engine crawler instructions
```

## Features

### Public Storefront

- **Hero slider** cycles through featured products with a 5-second interval and manual dot navigation.
- **Catalog & Product Pages**: Full product grid with real-time search, category filtering, and standalone product detail pages (`/products/:slug`) for improved sharing and deep-linking.
- **Shopping cart** persists to localStorage with quantity controls. Checkout sends an order summary to WhatsApp via `wa.me`.
- **Product AI assistant** is a per-product chat widget powered by Google Gemini, helping customers with specific product/usage queries.
- **Informational Pages**: Dedicated routing for FAQ, How to Order, Delivery Info, Contact, Privacy, and Terms & Conditions.
- **SEO Optimized**: Fully integrated with Open Graph tags, Twitter Cards, `application/ld+json` structured local business data, `sitemap.xml`, and `robots.txt` mapped to the `bakevault.com.ng` domain.
- **Product requests** allow customers to submit a form requesting products not currently in the catalog.
- **Testimonials** are displayed in an auto-rotating carousel sourced from the database.

### Admin Panel

Located at `/admin`, protected by Supabase Auth. Admin role is resolved via an `admins` table with a fallback to a comma-separated email allowlist in `.env`.

- **Dashboard** shows store statistics alongside a visitor analytics panel with a configurable date range (7/14/30 days), a line chart of activity over time, top products by cart additions, and CSV export.
- **Products** supports full CRUD with image upload to Supabase Storage, up to 5 images per product, availability and featured toggles, display order, and AI-powered name/description generation from an uploaded image.
- **Categories** supports inline create, rename, and delete.
- **Enquiries** shows all WhatsApp order enquiries logged from the storefront with status management (sent / responded / fulfilled).
- **Product Requests** lets admins review and action customer product requests, including any contact info provided.
- **Testimonials** supports adding, editing, toggling visibility, and deleting customer testimonials.
- **Settings** manages WhatsApp number, Instagram handle, and contact email via a key-value settings table in the database.

### AI Edge Function

Located at `supabase/functions/ai-assistant`, written in Deno. Handles two modes:

- **`chat`** runs multi-turn product Q&A using a system prompt scoped to the current product context.
- **`analyze`** fetches a product image URL server-side (with SSRF protection), sends it to Gemini vision, and returns a structured `{ name, description }` object for pre-filling the product form.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
VITE_WHATSAPP_NUMBER=      # Full number with country code, no + or spaces
VITE_INSTAGRAM_HANDLE=
VITE_CONTACT_EMAIL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAILS=         # Comma-separated fallback admin email list
VITE_GEMINI_API_KEY=       # Not used client-side; set as a Supabase secret
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=
VITE_PUBLIC_POSTHOG_HOST=
```

The Gemini API key is consumed only by the edge function. Set it as a Supabase secret:

```bash
supabase secrets set GEMINI_API_KEY=your-key
```

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`.

```bash
npm run build    # Production build
npm run preview  # Preview the production build locally
```

## Analytics (PostHog)

This project integrates PostHog for client-side analytics. The app is wrapped with `PostHogProvider` at the root (`src/main.tsx`). To enable tracking, set the following environment variables in your `.env.local`:

```env
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=  # Public project token
VITE_PUBLIC_POSTHOG_HOST=           # e.g. https://app.posthog.com or your host
```

Usage options:
- Use `usePostHog()` from `@posthog/react` to access the PostHog instance directly.
- Or use the small helper hook exported from [src/hooks/useTrack.ts](src/hooks/useTrack.ts) which wraps `usePostHog()` and performs a safe no-op when PostHog is not configured.

Example:

```tsx
import { useTrack } from '@/hooks'

function MyComponent() {
  const track = useTrack()
  return <button onClick={() => track('button_clicked', { button_name: 'signup' })}>Sign up</button>
}
```

Helper files:
- [src/lib/posthog.ts](src/lib/posthog.ts) — safe wrappers around `window.posthog`
- [src/hooks/useTrack.ts](src/hooks/useTrack.ts) — convenience hook for tracking events

Install the client packages if you haven't already:

```bash
npm install posthog-js @posthog/react
```


## Database

The application expects the following tables in Supabase:

- `products`
- `categories`
- `enquiries`
- `testimonials`
- `settings`
- `product_requests`
- `analytics_events`
- `admins`

This repository does not include Supabase SQL migrations. Create the database schema in your Supabase project (see the expected tables listed above), or import migrations from the original project if you have them.

Product images are stored in a Supabase Storage bucket named `bakevault-images` under a `products/` prefix.

> **Note on image optimisation:** Supabase image transformation (`/render/image/`) requires the Pro plan. The current configuration returns original URLs unchanged and relies on browser-native lazy loading. To enable resizing, see the commented block in `src/lib/image.ts`.

## Deploying the Edge Function

```bash
supabase functions deploy ai-assistant --no-verify-jwt
```

The `--no-verify-jwt` flag is required because the function is called from the browser using the public anon key.