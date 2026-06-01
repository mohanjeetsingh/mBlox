This file tracks the next set of refactoring and feature implementation tasks for the mBlox project.

1. Youtube Embed error
2. List - smaller Stack items - last row height
3. Showcase - thumbnails - when in nav mode (not carousel mode):
    - padding not applied
    - when right indicator is clicked: - to go to the next set of images the images don't have the correct aspect ratio/height; also the indicators seem to become inactive

## Design & UI System Improvements (M3 Expressive & Compatibility)
4. **Dual Palette System:** 
    - Implement Light and Dark themes.
    - Create two modes: **Neutral** (default slate/grayscale surfaces) and **Colorful** (opt-in PsyUI brand with deep blues/oranges).
5. **Remove Contrast Feature:** Clean up and completely remove the broken high-contrast execution feature to simplify architecture.
6. **Integration Modes:**
    - **Mode 1 (Default - JSON & CSS Variable Fallbacks):** Ensure the codebase strictly uses M3E Tailwind variables (e.g., `--color-primary`). To guarantee the host user's CSS takes precedence, do not aggressively define these in the global `:root`. Instead, rely on CSS fallback values (e.g., `var(--color-primary, <default-hex>)`) or lowest-specificity `@layer` so host site definitions seamlessly override mBlox defaults.
    - **Mode 2 (Fully Customizable):** Provide a Tailwind class list for users integrating mBlox into their own Tailwind compilation process.
7. **Typography Flexibility:** Allow inheriting the host site's `font-family` by default to prevent font clashes, while using fluid typography scaling (`clamp()`/container queries) for headings.
8. **Shape Families:** Utilize standard Tailwind utility classes (e.g., `rounded-3xl` mapped to `--radius-3xl`) for border radii defaults instead of custom prefixes, ensuring seamless compatibility if a user provides their own CSS.
9. **Standardized Interactions:** 
    - **Neutral Mode:** Use predictable M3 state layers (standard opacity overlays for hover/focus).
    - **Colorful Mode:** Preserve the expressive "Tertiary Reversal" model (shifting to vivid orange on interaction).
10. **Motion System:** Define and implement M3 CSS transition easing curves (Emphasized, Standard) for fluid animations, respecting `prefers-reduced-motion`.