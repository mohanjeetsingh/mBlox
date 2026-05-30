# mBlox Technical & Rendering Specification

This document details the data processing, HTML rendering logic, and build architecture of the **mBlox** library.

## High-Level Architecture
mBlox is designed as a decoupled, configuration-driven library.

*   **Dependency-Free:** Core logic is written in vanilla ES6+ JavaScript.
*   **Provider Model:** Abstracted data fetching (`BloggerProvider`, `WordPressProvider`, `RssProvider`).
*   **CSS Isolation:** Uses CSS Cascading Layers (`@layer mblox`) to ensure the library's styles never leak or conflict with the host environment.
*   **Intelligent Loading:** Automatically detects if Bootstrap 5 is present on the host site. It only loads its custom `mBloxBS.css` and `mBloxBS.js` bundles if they are needed and paths are provided via `window.mBloxCssSrc` and `window.mBloxBsJsSrc`.
*   **Build Pipeline:** Uses a Node.js-based pipeline for CSS purging (BScssClasses.yaml) and JS bundling (BSjsComponents.yaml).

---

## 1. Directory Structure

- `/dist`: Contains the production-ready `mBloxBS.css`.
- `/assets`: Contains static resources and third-party vendor files.
- `/config`: Contains `classes.yaml`, the source of truth for all CSS classes used by the library.
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
- Truncation length is controlled by `data-snippetSize` (default: 150).

---

## 3. Rendering Logic

### 3.1. Layer-Based Styling
The entire CSS bundle is wrapped in `@layer mblox`. 
- **Isolation**: Styles inside the layer have lower precedence than un-layered styles on the host site, ensuring host overrides work naturally.
- **Utility Support**: Standard Bootstrap utility classes are extracted and hardened with `!important` flags in the build step to ensure structural integrity across different environments.

### 3.2. Base Types (data-type)
The `data-type` attribute determines the rendering strategy:
- `v` (Cover): Hero-style block with text overlay.
- `s` (Showcase): Featured item with interactive thumbnail grid.
- `l` (List): Featured item followed by a list of smaller items.
- `c` (Card): Standard Bootstrap cards.
- `p` (Pancake): Vertically stacked image and content.
- `t` (Stack): Horizontal image and content layout.

---

## 4. Build Pipeline (`build-css.js`)

The CSS bundle is generated dynamically:
1.  **Sass Compilation**: Compiles Bootstrap 5.3.x SCSS.
2.  **YAML Manifest**: Reads `config/classes.yaml` to identify exactly which classes are required.
3.  **PurgeCSS**: Strips all unused Bootstrap code, keeping only the manifest classes and specified regex patterns.
4.  **Autoprefixer**: Ensures cross-browser compatibility.
5.  **Layer Wrapping**: Wraps the final output in `@layer mblox { ... }`.

### 4.1. Updating Styles
If new features are added to `mBloxScript.js` that require new Bootstrap utilities, they must be added to `config/classes.yaml` and the build script re-run:
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

*Refer to the source code of `mBloxScript.js` for detailed responsive breakpoint mappings.*
