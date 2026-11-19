# Darjeeling Hair Company — Website & Super Admin

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · MongoDB (data + images via GridFS) · Firebase Auth.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## Environment (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas connection string (with the real password) |
| `MONGODB_DB` | Database name (default `darjeeling_hair_company`) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (public by design) |
| `SUPER_ADMIN_EMAILS` | Comma-separated emails allowed into `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Live URL, used for SEO metadata |

`.env*` files are git-ignored. `.env.example` lists every variable.

## Super Admin setup (one time)

1. Firebase Console → **Authentication → Sign-in method**: enable **Email/Password** (and optionally **Google**).
2. **Authentication → Users → Add user**: `pranaychettri04@gmail.com` + a strong password.
3. **Authentication → Settings → User actions**: turn **off** "Enable create (sign-up)" so nobody else can register.
4. Open `/admin/login` and sign in.

The server checks every admin request by verifying the Firebase ID token against Google's public keys, and only accepts emails listed in `SUPER_ADMIN_EMAILS`.

## What the admin manages

- **Bookings**: appointment requests from the Contact page; set status, call or WhatsApp the client.
- **Hero Slider**: home page banner slides (image, headline, button).
- **Services**: add/edit/delete, photo, price, category, featured on home, show/hide. "Import starter services" loads the salon's menu.
- **Gallery**: multi-photo upload with categories and captions.
- **Contact & Settings**: phone, WhatsApp, email, address, maps, opening hours, social links, announcement bar.

Uploads are resized/converted to WebP in the browser, then stored in MongoDB GridFS and served from `/api/images/:id`.

## Built-in sample content

Until the salon uploads its own content, the site shows bundled samples from `public/images/`:
3 hero slides, a photo for each starter service (matched by service name), and 18 gallery photos.
Uploading real content replaces them automatically. **Replace the samples with the salon's real work as soon as possible.**

### Photo credits

Sample photos are from [Unsplash](https://unsplash.com) under the free Unsplash License (commercial use allowed, no attribution required).
The logo (`public/images/brand/logo.png`, favicon `src/app/icon.png`) is generated from `public/Darjeeling Hair Company logo.png`.

## Design system

Defined in `src/app/globals.css`.

- **Public website**: warm light theme with `canvas`/`sand`/`card` backgrounds, `espresso` headings, `body` text,
  `accent` (terracotta rose-gold) and `forest` (deep emerald). Headings use Fraunces, body text uses Inter.
  Site utilities: `h-serif`, `eyebrow`, `s-btn-accent`, `s-btn-outline`, `s-card`, `s-field`, `s-chip`.
- **Admin panel**: dark "Emerald & Rose Gold" theme (`ink`, `rose`, `emerald`, `champagne`, `blush`).

Editable marketing copy (FAQ, process steps, "why us") lives in `src/lib/content.ts`.
