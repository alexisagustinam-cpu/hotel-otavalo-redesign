# Hotel Otavalo — Redesign Concept

A high-fidelity frontend concept for a new Hotel Otavalo homepage.

## Direction

The redesign reframes the property from a generic luxury-hotel presentation into a **heritage-and-culture destination brand**. The page is organized around four pillars:

- Patrimonio: the 1930 building and its restoration.
- Arte: the hotel as a living gallery.
- Cultura viva: weaving, ancestral gastronomy and Andean music.
- Lugar: Otavalo, Imbabura and the rooftop view toward Taita Imbabura.

## Run locally

No build step is required.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Files

- `index.html` — semantic homepage structure.
- `styles.css` — complete responsive visual system.
- `script.js` — navigation, reveal motion and booking date defaults.
- `DESIGN.md` — design tokens, principles and implementation notes.

## Important prototype note

The concept uses image URLs from the current Hotel Otavalo website so the redesign can be evaluated with the property's real visual material. For production, copy approved originals into the new asset pipeline (Cloudinary or a local optimized media library), verify image rights, and serve AVIF/WebP variants with responsive sizes.

The direct-booking CTA currently points to the booking engine used by the existing website. The prototype does not submit date/guest values into that external engine because its query parameter contract has not been validated.

## Suggested production migration

For the production build:

- Next.js App Router + TypeScript
- Tailwind CSS v4 or extracted design tokens from this concept
- next/image + Cloudinary
- Sanity / Payload / WordPress headless for editable content
- ES/EN via next-intl
- GA4 + GTM + Search Console
- Hotel / HotelRoom / Restaurant / Breadcrumb structured data
- accessible reduced-motion behavior and image alt review
