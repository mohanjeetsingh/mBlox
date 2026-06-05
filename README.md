# mBlox

mBlox is a lightweight, dependency-free JavaScript library that enables dynamic, Elementor/Gutentor-like content blocks. It can fetch and display content from various sources like **Blogger**, **WordPress**, and any **RSS feed** (including YouTube) in a variety of customizable layouts.

It can be deployed on **any website** to display content from any supported feed type.

Note: The initial version of this tool was created in the pre-GenAI era. Starting October 2025, modern AI tools are being used to refactor and harden the library.

## Features

*   **Dynamic Content**: Fetch recent posts, posts by label, or recent comments. Automatically extracts hashtags from content to use as labels.
*   **Highly Customizable**: A wide range of `data-*` attributes to control layout, style, and content.
*   **Variety of Layouts**: Includes showcases, carousels, grids, lists, and more.
*   **Lazy Loading**: Content blocks are lazy-loaded on scroll for better performance.
*   **Responsive Design**: Built with modern Tailwind CSS to be mobile-first and fully responsive.
*   **Style Isolation**: CSS is isolated using `@layer mblox` to prevent conflicts with host websites.
*   **Easy Integration**: Add a `section` or `div` with the right class and data attributes, and the script does the rest.

## Directory Structure

```text
mBlox/
├── mBloxCall.js         # Lightweight entry point & initializer
├── dist/                # Production-ready assets
│   ├── mBloxM3E.js      # Unified JS bundle (Engine + Blocks)
│   └── mBloxM3E.css     # Tailwind CSS bundle
├── assets/              # Static resources
│   ├── tailwind.css     # Tailwind configuration and base styles
│   ├── noImg.js         # Placeholder image script
│   └── vendor/          # Third-party vendor dependencies
├── scripts/             # Build pipeline (Node.js)
└── demo/                # Sample implementations
```

## How to Use

1.  Include the necessary CSS and JS files in your website's `<head>` section.

    ```html
    <!-- 1. Include the mBlox Initializer (Configure paths inside this file) -->
    <!-- For best performance, it is recommended to inline the contents of mBloxCall.js directly into your HTML -->
    <script src='mBloxCall.js' defer></script>
    ```

    **Note on Configuration:**
    Open `mBloxCall.js` to configure any custom paths for `window.mBloxCssSrc` if necessary.

    **Note on Scripts:**
    *   `mBloxCall.js`: The lightweight entry point. It detects `mBlock` elements and dynamically injects the unified `mBloxM3E.js` library and CSS. No manual inclusion of the main bundle is needed.

2.  Add an element to your HTML where you want the block to appear.
3.  Give it the class `mBlock` (standard) or `mBlockL` (lazy-loaded).
4.  Add `data-*` attributes to configure the block.

### Examples

#### 1. Data Attributes Configuration (Full Settings)

You can configure mBlox directly using `data-*` attributes on the block element. Here is an example showing all available settings:

```html
<section
    class='mBlockL'
    data-contenttype="recent"
    data-feed="https://your-blog.blogspot.com/"
    data-type="v-ihsda"
    data-title="Featured Articles"
    data-description="Check out our latest news and updates."
    data-label="Technology"
    data-posts="6"
    data-cols="3"
    data-rows="2"
    data-theme="auto"
    data-palette="surface"
    data-ar="16x9"
    data-isCarousel="true"
    data-iHeight="m"
    data-iBlur="false"
    data-iFix="false"
    data-iBorder="true"
    data-corner="rounded"
    data-gutter="3"
    data-textVAlign="bottom"
    data-textHAlign="left"
    data-ctaAlign="right"
    data-CTAText="Read More"
    data-moreText="View All"
    data-snippetSize="150"
    data-overlay-items="vcasb"
    data-s="1"
    >
</section>
```

#### 2. JSON Configuration (Recommended for Complex Setups)

Alternatively, you can configure the block using an embedded JSON script. This approach is cleaner when you have many settings or dynamic configurations. Simply place a `<script type="application/json">` tag inside the block element.

```html
<section class="mBlockL">
    <script type="application/json">
        {
            "contentType": "recent",
            "feed": "https://your-blog.blogspot.com/",
            "type": "v-ihsda",
            "title": "Featured Articles",
            "description": "Check out our latest news and updates.",
            "label": "Technology",
            "posts": 6,
            "cols": 3,
            "rows": 2,
            "theme": "auto",
            "palette": "surface",
            "ar": "16x9",
            "isCarousel": true,
            "iHeight": "m",
            "iBlur": false,
            "iFix": false,
            "iBorder": true,
            "corner": "rounded",
            "gutter": 3,
            "textVAlign": "bottom",
            "textHAlign": "left",
            "ctaAlign": "right",
            "CTAText": "Read More",
            "moreText": "View All",
            "snippetSize": 150,
            "overlayItems": "vcasb",
            "s": 1
        }
    </script>
</section>
```
*Note: JSON keys use camelCase (e.g., `overlayItems` instead of `overlay-items`) and values maintain their native data types (booleans, numbers).*

## Development & Build Pipeline

mBlox uses a specialized build pipeline to ensure the CSS bundle only contains the Tailwind utilities actually used by the script.

### Requirements
*   Node.js (LTS)
*   NPM

### Build Process
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the build command:
    ```bash
    npm run build
    ```
This will compile Tailwind CSS based on your template files and generate the unified JS bundle in `/dist`.

## Configuration

Customize mBlox using `data-*` attributes or embedded JSON. The core attributes include:

| Attribute | JSON Key | Description | Default |
|---|---|---|---|
| `data-feed` | `feed` | Source URL of the blog or feed. | `/` |
| `data-contenttype` | `contentType` | `recent`, `label`, or `comments`. | `recent` |
| `data-type` | `type` | Visual style and component layout (e.g., `v-ih`). | `v-ih` |
| `data-posts` | `posts` | Number of posts to fetch/display. | `3` |
| `data-cols` | `cols` | Number of columns in the grid. | Varies |
| `data-theme` | `theme` | `light`, `dark`, or `auto`. | `auto` |
| `data-palette` | `palette` | Color palette (e.g., `surface`, `colorful`). | `surface` |
| `data-ar` | `ar` | Aspect ratio (e.g., `16x9`, `4x3`, `1x1`). | `1x1` |
| `data-isCarousel` | `isCarousel` | Enables carousel navigation. | `false` |

*See [spec.md](spec.md) for the full technical breakdown.*
