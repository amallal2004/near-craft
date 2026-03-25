# Design System Strategy: The Kinetic Atelier

## 1. Overview & Creative North Star
This design system is built upon the **"Kinetic Atelier"**—a creative North Star that balances the high-velocity nature of gig work with the sophisticated precision of a high-end studio. While traditional marketplaces often feel cluttered and transactional, this system uses an **Editorial Fluidity** approach. 

We break the "template" look through intentional asymmetry, massive typographic contrast, and layered surfaces. The goal is to move beyond the "standard" SaaS aesthetic and create a workspace that feels like a premium, custom-tailored tool for professionals. We prioritize breathing room over density and tonal shifts over rigid structural lines.

---

## 2. Colors & The Tonal Architecture
The palette is rooted in high-contrast energy. The Primary Red (`#E63946`) provides urgency, while the Secondary Navy (`#1D3557`) anchors the experience in trust.

### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are strictly prohibited for sectioning or containment.** 
Boundaries must be defined through background color shifts. Use `surface-container-low` to define a section sitting on a `surface` background. If you need a card, use `surface-container-lowest` to create a "lift" through color rather than a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
- **Layer 0 (Base):** `surface` (#f9f9ff).
- **Layer 1 (Sections):** `surface-container-low` (#f0f3ff).
- **Layer 2 (Interactive Elements/Cards):** `surface-container-lowest` (#ffffff).
- **Layer 3 (Modals/Overlays):** Glassmorphism using semi-transparent `surface-bright` with a 12px-16px backdrop-blur.

### Signature Textures
Main CTAs should not be flat. Use a subtle linear gradient from `primary` (#b7102a) to `primary-container` (#db313f) at a 135-degree angle. This provides a "visual soul" and depth that feels intentional, not out-of-the-box.

---

## 3. Typography: The Editorial Scale
We pair the geometric confidence of **Poppins** (Headings) with the clinical readability of **Inter** (Body).

- **Display (Plus Jakarta Sans/Poppins):** Use `display-lg` (3.5rem) for hero statements. Tighten the letter spacing (-0.02em) to create a high-fashion, high-impact look.
- **Headline (Plus Jakarta Sans/Poppins):** Use `headline-lg` (2rem) for section titles. Ensure these have significant margin-bottom (Spacing 10 or 12) to allow the "Atelier" feel to breathe.
- **Body (Inter):** Use `body-md` (0.875rem) as the workhorse. It provides a technical, trustworthy contrast to the energetic headlines.
- **Labels (Inter Bold):** All caps, spaced out (+0.05em), using `label-sm`. This conveys authority and organization.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a relic. We use **Tonal Layering** to convey hierarchy.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift. 
- **Ambient Shadows:** For floating elements (like a navigation bar or a sticky action button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 27, 60, 0.06);`. The shadow color must be a tinted version of `on-surface` (#001b3c), never pure black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility in form fields, use `outline-variant` (#e4bebc) at 20% opacity. 100% opaque borders are forbidden.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), `on-primary` text. Roundedness: `md` (0.75rem).
- **Secondary:** `secondary-container` (#bbd3fd) background with `on-secondary-container` (#445a7f) text. No border.
- **Tertiary (Ghost):** No background. Text in `primary`. Interaction state uses a subtle `surface-container-high` hover fill.

### Cards (Service, Category, Freelancer)
- **Rule:** No dividers. Use Spacing 4 or 6 to separate internal elements.
- **Styling:** Use `surface-container-lowest` on a `surface-container-low` background. 
- **The "Interactive Pop":** On hover, a card should not get a shadow; it should shift its background to `surface-bright` and transition the `primary` accent bar from 0px height to 4px at the top edge.

### Form Inputs
- **Field:** `surface-container-lowest` background.
- **Label:** `label-md` using `on-surface-variant`.
- **Focus State:** 2px "Ghost Border" using `tertiary` (#8b4c11) at 40% opacity. Never use a solid red focus ring; it denotes an error state.

### Specialized Components
- **The "Status Aura":** For Success/Active states, instead of a solid pill, use a tiny 8px dot of `success` (#2A9D8F) with a soft glow (box-shadow) of the same color at 30% opacity.
- **Glass Filters:** Use `surface-variant` with 60% opacity and `backdrop-filter: blur(8px)` for category filter chips.

---

## 6. Do's and Don'ts

### Do
- **Use White Space as a Separator:** Leverage the Spacing Scale (specifically 10, 12, and 16) to define major layout shifts.
- **Embrace Asymmetry:** Place high-energy primary elements (like a "Hire" button) slightly offset from the central axis to create a "Kinetic" feel.
- **Layer for Importance:** The most important information should be on the "Highest" surface container.

### Don't
- **Don't use 1px dividers:** Dividers are a sign of a weak layout. Use background shifts.
- **Don't use pure black text:** Always use `on-surface` (#001b3c) to maintain the Navy/Red brand sophistication.
- **Don't use default corner radii:** Stick strictly to the Roundedness Scale—primarily `md` (0.75rem) for UI components and `lg` (1rem) for large containers.