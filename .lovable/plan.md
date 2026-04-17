
## Plan: Hero Mobile Refinement + Directions Fix

### 1. Mobile Hero Background
The current `hero-barbershop.jpg` is a 3-image composition — on narrow screens `object-cover` crops out the side images. Fix without touching desktop:

- Keep desktop `<img>` as-is (visible at `md:` and up).
- On mobile (`<md`), swap to a stacked 3-image strip using existing assets:
  - top: `shop-center.jpg`
  - middle: `gallery-barber-action.jpg`
  - bottom: `shop-ialyssos.jpg`
- Render via two background layers controlled by `hidden md:block` / `md:hidden` so desktop markup is untouched.
- Keep the dark gradient overlay on both for legibility.
- Result: mobile hero shows all 3 visuals (storefront → action → storefront), preserving the cinematic B&W feel; desktop unchanged.

### 2. Fix "Get Directions" Button
The button currently links to `Amarantou+24` (wrong address). Replace with a small location-picker:

- Convert the `<a>` into a `<DropdownMenu>` trigger styled identically (same classes, same icon, same label).
- Two menu items, both `target="_blank"`:
  - **Street Barbers Center** → `https://www.google.com/maps/dir/?api=1&destination=Amerikis+40,+Rodos+851+00,+Greece`
  - **Street Barbers Ialyssos** → `https://www.google.com/maps/dir/?api=1&destination=Leoforos+Iraklidon,+Ialysos,+Rhodes,+Greece`
- Reuses existing `src/components/ui/dropdown-menu.tsx`. URLs match the ones already in `ContactSection.tsx` for consistency.

### Files Changed
- `src/components/HeroSection.tsx` — add mobile-only stacked background, replace Directions anchor with dropdown menu of two locations.

### Out of Scope
- No changes to desktop layout, typography, spacing, copy, or the Call Now button.
- No new assets created — reuses existing `shop-center.jpg`, `shop-ialyssos.jpg`, `gallery-barber-action.jpg`.
