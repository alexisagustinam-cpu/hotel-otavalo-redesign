# Design system — Hotel Otavalo concept

## Design read

Heritage boutique hotel for culture-led national and international travelers. The visual language is **Andean heritage, contemporary editorial**: architectural, quiet, tactile, asymmetric and image-led.

Design variance: 7/10  
Motion intensity: 5/10  
Visual density: 3/10

## Principles

1. **The building is the interface.** Arches, brick, stone, wood and vertical rhythm inform composition more than generic hotel UI patterns.
2. **One memorable statement at a time.** The hero and large editorial statements carry the drama. Supporting sections stay disciplined.
3. **No card kit.** Content hierarchy is expressed with scale, image proportion, whitespace and rules rather than identical rounded boxes.
4. **Culture is specific.** Experiences are named through actions (Tejer, Cocinar, Escuchar) and then grounded in real local partners/places.
5. **Movement explains.** Reveal motion exposes content, hover motion confirms interactivity, and all nonessential animation is disabled for reduced-motion users.
6. **Booking remains obvious.** Commercial intent is present in the header, booking strip and closing CTA without turning every section into a sales surface.

## Palette

- Night — `#13272B`
- Ink — `#182326`
- Mineral — `#F1EFE8`
- Paper — `#F8F7F2`
- Stone — `#C9C2B5`
- Wood — `#5B4134`
- Indigo — `#315D67`

## Typography

Prototype system fonts:

- Display: Iowan Old Style / Baskerville
- UI/body: Avenir Next / Helvetica Neue

Production should self-host one brand-appropriate display serif and one restrained sans family after licensing review.

## Layout

- Max editorial width: 1440 px
- Strong left alignment
- Deliberate asymmetry in statement, room and art sections
- No global border radius
- Section padding scales from ~90 px to ~180 px on desktop
- Mobile simplifies to a single reading column without losing content hierarchy

## Motion

- Header transitions after initial scroll
- Hero image settles once on page load
- Editorial blocks reveal once with ~850 ms strong ease-out
- Image reveals use clip-path rather than repetitive fade-up on every asset
- Hover scale is restrained (1.018–1.025)
- Buttons use 0.97 active scale for immediate press feedback
- `prefers-reduced-motion` removes nonessential animation
