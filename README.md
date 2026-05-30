# mBlox

mBlox is a lightweight, dependency-free JavaScript library that enables dynamic, Elementor/Gutentor-like content blocks. It can fetch and display content from various sources like **Blogger**, **WordPress**, and any **RSS feed** (including YouTube) in a variety of customizable layouts.

It can be deployed on **any website** to display content from any supported feed type.

Note: The initial version of this tool was created in the pre-GenAI era. Starting October 2025, modern AI tools are being used to refactor and harden the library.

## Features

*   **Dynamic Content**: Fetch recent posts, posts by label, or recent comments.
*   **Highly Customizable**: A wide range of `data-*` attributes to control layout, style, and content.
*   **Variety of Layouts**: Includes showcases, carousels, grids, lists, and more.
*   **Lazy Loading**: Content blocks are lazy-loaded on scroll for better performance.
*   **Responsive Design**: Built with Bootstrap 5.3+ to be mobile-first and responsive.
*   **Style Isolation**: CSS is isolated using `@layer mblox` to prevent conflicts with host websites.
*   **Easy Integration**: Add a `section` or `div` with the right class and data attributes, and the script does the rest.

## Directory Structure

```text
mBlox/
├── mBloxScript.js       # Core library logic
├── mBloxCall.js         # Entry point & lazy-loading helper
├── dist/                # Production-ready assets
│   └── mBloxBS.css      # Minimized/Purged CSS bundle
├── config/              # Build configuration
│   └── classes.yaml     # Manifest of all used Bootstrap classes
├── assets/              # Static resources
│   ├── mCustom.css      # Custom overrides
│   ├── noImg.js         # Placeholder image script
│   └── vendor/          # Third-party dependencies (Bootstrap)
├── scripts/             # Build pipeline (Node.js)
└── demo/                # Sample implementations
```

## How to Use

1.  Include the necessary CSS and JS files in your website's `<head>` section.

    ```html
    <!-- 1. Include the mBlox Initializer (Configure paths inside this file) -->
    <script src='mBloxCall.js' defer></script>
    ```

    **Note on Configuration:**
    Open `mBloxCall.js` to set the paths for `window.mBloxCssSrc` and `window.mBloxBsJsSrc` if your site does not already use Bootstrap 5.

    **Note on Scripts:**
    *   `mBloxCall.js`: The lightweight entry point. It detects `mBlock` elements and triggers the main library.
    *   `mBloxScript.js`: The core library loaded automatically by `mBloxCall.js`. No manual inclusion needed.

2.  Add an element to your HTML where you want the block to appear.
3.  Give it the class `mBlock` (standard) or `mBlockL` (lazy-loaded).
4.  Add `data-*` attributes to configure the block.

### Example

```html
<section
    class='mBlockL'
    data-contenttype='recent'
    data-posts="6"
    data-type="s-ih"
    data-title="Featured Articles"
    data-theme="dark"
    data-isCarousel="true"
    data-feed='https://your-blog.blogspot.com/'
    >
</section>
```

## Development & Build Pipeline

mBlox uses a specialized build pipeline to ensure the CSS bundle only contains the Bootstrap utilities actually used by the script.

### Requirements
*   Node.js (LTS)
*   NPM

### Build Process
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Update `config/classes.yaml` if you add new Bootstrap classes to your JS logic.
3.  Run the build command:
    ```bash
    npm run build
    ```
This will compile Bootstrap SCSS, purge unused styles based on `classes.yaml`, apply Autoprefixer, and wrap the output in a `@layer mblox` for isolation.

## Configuration

Customize mBlox using the following `data-*` attributes:

| Attribute | Description | Default |
|---|---|---|
| `data-ar` | Aspect ratio (e.g., `16x9`, `4x3`, `1x1`) | `1x1` |
| `data-cols` | Number of columns in the grid. | Varies |
| `data-contenttype` | `recent`, `label`, or `comments`. | `recent` |
| `data-theme` | `light`, `dark`, `primary`, `secondary`, etc. | `light` |
| `data-type` | Visual style code (e.g., `v-ih`, `s-ihs`). | `v-ih` |

*See [spec.md](spec.md) for the full technical breakdown.*
