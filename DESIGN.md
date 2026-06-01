# Design System Manifest: PsyUI-mBlox (Material 3 Expressive Base)
> This document serves as the single source of truth for the modern, component-driven architecture of the Blogger themes.

This document outlines the visual language and interaction design of the project, strictly enforcing **Material 3 Expressive (M3E)** principles customized with the PsyUI brand tokens via Tailwind v4.

**Design Philosophy:** We explicitly adopt the **M3E Expressive** approach wherever feasible. This means favoring more dynamic typography, larger corner radii, and richer, more flexible layout structures over the strict baseline M3E standard to create a more engaging experience. Additionally, we default to **filled/solid variants** for components (e.g., buttons, text fields, cards) and icons wherever possible to ensure high visibility and a bold, grounded aesthetic.

---

## 1. M3E Token Mapping (Tailwind v4)

To guarantee automatic M3E compliance, we use a strict semantic token mapping in our `src/design/tailwind.css`. 

**Strict Rule:** Arbitrary hex colors (e.g., `bg-[#ff0000]`) and direct/generic Tailwind color classes (e.g., `bg-blue-500`, `text-red-600`) are **strictly forbidden** in the UI. You must *only* use functional Material semantic classes (e.g., `bg-primary`, `text-error`, `bg-surface-variant`).

### Tonal Palette Roles (from `tailwind.css`)
To maintain consistency, colors must be used strictly for their designated semantic roles:

*   **Primary (`primary`, `on-primary`, `primary-container`)**: For prominent, high-emphasis components (Call to Actions, Featured elements, Hero sections). This is where our core brand vibrance lives.
*   **Secondary (`secondary`, `on-secondary`, `secondary-container`)**: Specifically designed to be **lower-chroma/muted** to *de-emphasize* elements. Use for standard tags, secondary buttons, or less important UI elements that need to belong to the brand but fade into the background. **Do not use Secondary to try and make something "vibrant"**.
*   **Tertiary (`tertiary`, `on-tertiary`, `tertiary-container`)**: For accents and highly expressive interactions. In PsyUI, this is our vivid Orange, perfect for drawing attention to specific badges or flashing on hover/focus (the Tertiary Reversal).
*   **Error (`error`, `on-error`, `error-container`)**: Destructive actions (e.g., delete buttons, error messages, invalid inputs).
*   **Surface (`surface`, `on-surface`)**: For pure structural elevation. This is the neutral baseline background color for the page.
*   **Surface Variants (`surface-variant`, `surface-container-*`)**: Gradations of the surface color used to establish mathematical depth without drop shadows. Use for elevated cards, widgets, or distinct visual groupings.
*   **Inverse (`inverse-surface`, `inverse-primary`)**: Highly contrasting surface (usually dark in light mode) used specifically for transient, floating elements like Snackbars or Toasts.
*   **Outline (`outline`, `outline-variant`)**: Used strictly for dividers, structural separation lines, and focus/interactive outlines. We do not use outline/border styles on components (cards, buttons, inputs).
*   **Fixed (`*-fixed`, `*-fixed-dim`)**: Colors that remain constant across Light and Dark modes. Used when a component must maintain a specific color regardless of the active theme (e.g., specific brand badges).

### M3E State Layers
Interactive elements must use strict opacity overlays over the base color:
*   **Hover**: 8% opacity overlay
*   **Focus/Pressed**: 10% opacity overlay
*   *Implementation:* Use Tailwind opacity modifiers (`bg-on-primary/8`) or CSS variables for state layers. State layer uses the content color.

### Elevation & Shadows (Tonal Surfaces)
M3 Expressive deliberately drops heavy drop shadows and outlines in favor of filled tonal surfaces to create depth. Shadows (`shadow-m3e-*`) are formally deprecated.
*   Instead of shadows or outlines, we strictly use filled tonal surfaces (`bg-primary-container-fixed`) to separate cards/widgets from the `bg-surface` background.
*   For floating elements (Dropdowns, Modals), use the `bg-primary-container-fixed` with heavy `backdrop-blur-xl` for distinct z-index layering.
*   **Hover/Pop Effects**: Interactive cards and images must *not* use box-shadow to indicate a hover state. Instead, use a combination of **scale** (`hover:scale-[1.02]`) and **state layers** (tonal shifts, e.g., `hover:bg-surface-variant`) along with expressive easing (`duration-300 ease-[cubic-bezier(0.2,0,0,1)]`) to create an editorial "pop" effect.

---

### 2. Component Architecture (JS Rendering)

To ensure M3E is adhered to during the rendering process, we utilize a modular JavaScript approach.

### 2.1 The Render Pipeline

The application logic is decoupled from styling:
1.  **Core Orchestrator (`src/core/engine.js`):** Fetches data, parses the configuration, and delegates to the active Design System Renderer.
2.  **Design System Renderer (`src/design/ui-m3e.js`):** Takes the raw post data and configuration, and determines which blocks and sections to compose.
3.  **UI Components & Blocks (`src/components/`, `src/blocks/`, `src/sections/`):** Pure functions that receive data and return HTML strings. They are strictly styled with M3E Tailwind tokens. They do not fetch data.

### 2.2 Component Implementation Strategy

#### A. JavaScript Components (Blocks & Sections)
Use pure JS functions returning template literals for all UI elements.
1. **Simple & Multi-use:** (Buttons, Badges, Headers). Define as true components (`src/components/*.js`). They accept data objects and return styled HTML strings.
2. **Complex & Multi-use:** (Carousels, complex post cards). Defined in `src/blocks/*.js`. These act as compositions, injecting micro-components (images, dates) inside their structural layout.

#### B. Tailwind CSS Enforcement
All HTML strings returned by JS components must strictly use Tailwind utility classes mapping to M3E tokens.
*   **No Hardcoded Colors:** Use `bg-surface-variant`, `text-on-surface`, never `bg-[#ccc]` or `bg-blue-500`.
*   **Stateful UI (Zero-JS Preference):** Prefer CSS-only state where possible (e.g., `scroll-snap` for carousels) over heavy JS listeners to keep the renderer lightweight.

### 2.3 Component Nomenclature & Mapping (Legacy to M3E)

To ensure we align with M3E nomenclature, we map our site sections/features to their corresponding M3E components:

*Reusable UI Components (Built for multi-use):*
*   **Buttons / CTA (`src/components/cta.js`):** M3E Buttons (**Filled** / **Filled Tonal**).
*   **Labels / Tags (`src/components/date.js`, `author.js`):** M3E Chips and standard Typography tokens.

*Blocks / Layouts:*
*   **Cover / Showcase Blocks:** M3E Hero sections.
*   **Cards (`src/blocks/card.js`):** Align with M3E Cards. Default to **Filled Cards** (`bg-surface-variant`) for standard content grids. Reserve **Elevated Cards** for active states, hover effects, or floating elements.
*   **List Blocks (`src/blocks/list.js`):** Map to **M3E List Items** (1-line or 2-line). Use consistent hover states and typography.
*   **Carousel (`src/components/carousel.js`):** Align with M3E Carousel guidelines, strictly maintaining the zero-JS CSS scroll-snap implementation.
---

## 3. Premium Aesthetics & Micro-Interactions

### Typography
*   **Headings/UI:**System font stack
*   **Article Prose (`.post-body`):** System Font Stack (`system-ui`) configured with strict typographic rhythm (prose) for optimal long-form readability.
*   **Typography Casing:** Strict adherence to Sentence Case or Title Case for all UI elements (buttons, labels, badges). **All-caps utilities (e.g., `uppercase`) are strictly forbidden** as they violate Material 3 Expressive guidelines and severely reduce readability and scannability.

### Glassmorphism & Depth
*   Use `backdrop-blur-xl` for sticky headers, navigation bars, and overlays to create a premium glassmorphic effect.

### Brand-Tinted Surface Model (Dark Mode)
To avoid a stark, monochrome "white/black" aesthetic, Dark Mode surfaces completely abandon flat greys (`#1a1a1a`, `#2b2b2b`) in favor of deep, rich brand blues strictly from the Primary palette. This creates a cohesive, immersive environment:
*   `surface` & `surface-container`: `#141313` / `#201F1F`
*   `surface-variant` & `surface-container-high`: `#444748` / `#2A2A2A`
*   `surface-container-lowest`: `#0E0E0E`

### Interaction States (Tertiary Reversal Model)
*   **Resting State:** The Tertiary color (Orange) must almost *never* be used for resting UI elements. Its primary purpose is to provide high contrast and indicate interactivity.
*   **Interaction Rule:** To lean into the Expressive aesthetic, everything shifts to Tertiary on interaction. All standard links, icons, text elements, and solid components (like Primary, Secondary, and Tonal buttons) must dynamically swap to the Tertiary tonal scale on hover/focus (e.g., `hover:bg-tertiary` or `hover:text-tertiary`). This creates a highly engaging, consistent interaction language.
*   **Reversal Rule:** In the rare case that a component *is* Tertiary in its resting state, it must embrace the "Reversal" model and shift to the Primary tonal scale on interaction (e.g., `bg-tertiary hover:bg-primary`).

### Loading & Empty States
*   **Zero Spinners:** Use elegant, pulsating M3E Skeleton UI blocks matching the shape of incoming content to prevent Cumulative Layout Shift (CLS).
*   **Zero-JS UI:** Prefer native CSS `scroll-snap-type` for carousels.

---

## 4. Accessibility (a11y)
*   **Focus States:** Every interactive element must have `focus-visible:ring-2` using the primary color.
*   **SVG Sprites:** All injected SVG sprites must include `aria-hidden="true"` if decorative, or a proper accessible `<title>` if semantic.

---

## 5. Brand Color Palette (Material 3)

The design system uses a strict Material 3 tonal palette. Avoid using legacy flat color scales.
* LIGHT:
    primary: #00334D
    surfaceTint: #3B627E
    onPrimary: #FFFFFF
    primaryContainer: #CCDDFF
    onPrimaryContainer: #002233
    secondary: #5C5C5C
    onSecondary: #FFFFFF
    secondaryContainer: #E6e6e6
    onSecondaryContainer: #333333
    tertiary: #CC7000
    onTertiary: #FFFFFF
    tertiaryContainer: #EECC99
    onTertiaryContainer: #332200
    error: #CC3333
    onError: #FFFFFF
    errorContainer: #FFEDEB
    onErrorContainer: #CC1111
    background: #F9F9FB
    onBackground: #1A1C1E
    surface: #FCF8F8
    onSurface: #1C1B1B
    surfaceVariant: #E0E3E3
    onSurfaceVariant: #444748
    outline: #747878
    outlineVariant: #C4C7C7
    shadow: #000000
    scrim: #000000
    inverseSurface: #313030
    inverseOnSurface: #F4F0EF
    inversePrimary: #A4CBEB
    primaryFixed: #CAE6FF
    onPrimaryFixed: #001E2F
    primaryFixedDim: #A4CBEB
    onPrimaryFixedVariant: #214A66
    secondaryFixed: #E3E2E2
    onSecondaryFixed: #1B1C1C
    secondaryFixedDim: #C7C6C6
    onSecondaryFixedVariant: #464747
    tertiaryFixed: #FFDCC2
    onTertiaryFixed: #2E1500
    tertiaryFixedDim: #FFB77C
    onTertiaryFixedVariant: #6D3900
    surfaceDim: #DDD9D9
    surfaceBright: #FCF8F8
    surfaceContainerLowest: #FFFFFF
    surfaceContainerLow: #F7F3F2
    surfaceContainer: #F1EDEC
    surfaceContainerHigh: #EBE7E7
    surfaceContainerHighest: #E5E2E1
* DARK:
    primary: #006699
    surfaceTint: #006699
    onPrimary: #BBDDEE
    primaryContainer: #00334D
    onPrimaryContainer: #BBDDEE
    secondary: #C7C6C6
    onSecondary: #303031
    secondaryContainer: #222222
    onSecondaryContainer: #E6e6e6
    tertiary: #FFB77C
    onTertiary: #4D2700
    tertiaryContainer: #664400
    onTertiaryContainer: #DDCC99
    error: #FFB3AD
    onError: #680009
    errorContainer: #CC3333
    onErrorContainer: #FFEDEB
    background: #121415
    onBackground: #E2E2E5
    surface: #141313
    onSurface: #E5E2E1
    surfaceVariant: #444748
    onSurfaceVariant: #C4C7C7
    outline: #8E9192
    outlineVariant: #444748
    shadow: #000000
    scrim: #000000
    inverseSurface: #E5E2E1
    inverseOnSurface: #313030
    inversePrimary: #3B627E
    primaryFixed: #CAE6FF
    onPrimaryFixed: #001E2F
    primaryFixedDim: #A4CBEB
    onPrimaryFixedVariant: #214A66
    secondaryFixed: #E3E2E2
    onSecondaryFixed: #1B1C1C
    secondaryFixedDim: #C7C6C6
    onSecondaryFixedVariant: #464747
    tertiaryFixed: #FFDCC2
    onTertiaryFixed: #2E1500
    tertiaryFixedDim: #FFB77C
    onTertiaryFixedVariant: #6D3900
    surfaceDim: #141313
    surfaceBright: #3A3939
    surfaceContainerLowest: #0E0E0E
    surfaceContainerLow: #1C1B1B
    surfaceContainer: #201F1F
    surfaceContainerHigh: #2A2A2A
    surfaceContainerHighest: #353434

> [!WARNING]
> **Strict Implementation Rule:** These raw hex codes are exclusively for configuring the semantic tokens in `tailwind.css`. They must **never** be used directly in the XML components as arbitrary inline values (e.g., `text-[#00aaff]`). Always use the mapped M3E token (e.g., `text-primary-container`).

---

## 6. SVG Icon Resources

We source our Material Design Symbols from the following optimized repository:
*   **Material Symbols SVGs:** [marella/material-symbols](https://github.com/marella/material-symbols) (Provides pre-processed, optimized SVGs categorized by weight and style)
* Use filled, 400