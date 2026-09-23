# Hotel Otavalo — Redesign Concept

High-fidelity frontend concept for a new Hotel Otavalo homepage.

## Direction

The redesign reframes the property from a generic luxury-hotel presentation into a **heritage-and-culture destination brand** organized around four pillars:

- **Patrimonio:** the 1930 building and its restoration.
- **Arte:** the hotel as a living gallery.
- **Cultura viva:** weaving, ancestral gastronomy and Andean music.
- **Lugar:** Otavalo, Imbabura and the rooftop view toward Taita Imbabura.

## Run locally

No build step is required. Serve the repository through HTTP because the homepage loads its sections as static partials.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `index.html` — lightweight homepage entry point.
- `loader.js` — assembles the static HTML partials and then starts interactions.
- `partials/` — hero, heritage, rooms, experiences, gastronomy, itinerary and footer markup.
- `styles.css` — complete responsive visual system.
- `script.js` — navigation, reveal motion and booking date defaults.
- `DESIGN.md` — design tokens, principles and implementation notes.
- `vercel.json` — static Vercel configuration and security headers.

## Prototype note

The concept uses image URLs from the current Hotel Otavalo website so the redesign can be evaluated with the property's real visual material. For production, approved originals should be copied into the new asset pipeline, rights verified, and responsive AVIF/WebP variants served locally or through a media CDN.

The direct-booking CTA currently points to the booking engine used by the existing website. The prototype does not submit selected date/guest values into that engine because its query parameter contract has not yet been validated.

## Suggested production migration

- Next.js App Router + TypeScript
- Tailwind CSS v4 / extracted design tokens
- `next/image` + Cloudinary or equivalent
- Sanity / Payload / WordPress headless
- ES/EN via `next-intl`
- GA4 + GTM + Search Console
- Hotel / HotelRoom / Restaurant / Breadcrumb structured data
- accessibility and reduced-motion review
