# mBlox Technical & Rendering Specification

This document details the data processing, HTML rendering logic, and build architecture of the **mBlox** library.

## High-Level Architecture
mBlox is designed as a decoupled, configuration-driven library.

*   **Dependency-Free:** Core logic is written in vanilla ES6+ JavaScript.
*   **Provider Model:** Abstracted data fetching (`BloggerProvider`, `WordPressProvider`, `RssProvider`).
*   **CSS Isolation:** Uses CSS Cascading Layers (`@layer mblox`) to ensure the library's styles never leak or conflict with the host environment.
*   **Design System:** Uses Tailwind CSS v4 to enforce Material 3 Expressive (M3E) principles.
*   **Build Pipeline:** Uses a Node.js-based pipeline with `@tailwindcss/cli` and `esbuild` for generating isolated CSS (`mBloxM3E.css`) and bundled JS (`mBloxM3E.js`).

---

## 1. Directory Structure

- `/dist`: Contains the production-ready `mBloxM3E.css` and `mBloxM3E.js`.
- `/assets`: Contains static resources and SVG icons.
- `/scripts`: Build automation logic.
- `/demo`: Sample implementations for testing and documentation.

---

## 2. Data Extraction and Normalization

The script normalizes data from various feed sources into a consistent internal object structure.

### 2.1. Image Handling
- **Source Priority**: YouTube RSS `<media:thumbnail>` > First `<img>` in content > `post.thumbnailUrl` > Placeholder.
- **Dynamic Resizing**: For Blogger sources, the script automatically generates optimal `/s{size}` parameters based on the container width and device pixel ratio.
- **Fixed Backgrounds**: If `data-iFix="true"`, the script uses `background-attachment: fixed` and loads high-resolution versions of images.

### 2.2. Snippet Processing
- Raw HTML is stripped using `DOMParser().textContent`.
- Truncation length is controlled by `data-snippetLines` (default: 3).

---

## 3. Rendering Logic

### 3.1. Layer-Based Styling
The entire CSS bundle is wrapped in `@layer mblox`. 
- **Isolation**: Styles inside the layer have lower precedence than un-layered styles on the host site, ensuring host overrides work naturally.
- **Utility Support**: Standard Tailwind utility classes are used for styling and structurally isolated by the layer to prevent conflicts.

### 3.2. Base Types (data-type)
The `data-type` attribute determines the rendering strategy:
- `v` (Cover): Hero-style block with text overlay.
- `s` (Showcase): Featured item with interactive thumbnail grid.
- `l` (List): Featured item followed by a list of smaller items.
- `c` (Card): Standard M3E semantic cards.
- `p` (Pancake): Vertically stacked image and content.
- `t` (Stack): Horizontal image and content layout.

---

## 4. Build Pipeline

The CSS and JS bundles are generated dynamically using npm scripts:
1.  **CSS Build**: `npx @tailwindcss/cli` compiles the M3E semantic Tailwind setup into `/dist/mBloxM3E.css`.
2.  **Icons Build**: Extracts and optimizes SVG icons via `scripts/build-icons.js`.
3.  **JS Build**: Uses `esbuild` to bundle the core engine, design system, and components into `/dist/mBloxM3E.js` via `scripts/build-js.js`.

### 4.1. Updating Styles
If new Tailwind classes are used in the components, simply run the build script to update the CSS bundle:
```bash
npm run build
```

---

## 5. Default Configuration

| Attribute | Default |
|---|---|
| `data-type` | `v-ih` |
| `data-theme` | `light` |
| `data-posts` | `3` |
| `data-cols` | Dynamic (based on type and viewport) |
| `data-ar` | `1x1` |
| `data-corner` | `rounded` |

*Refer to the source code of `mBloxM3E.js` for detailed responsive breakpoint mappings.*
