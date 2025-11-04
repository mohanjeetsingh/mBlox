# mBlox Technical & Rendering Specification

This document details the specific data processing and HTML rendering logic of the **current `mBlox` script**. It serves as the canonical reference for the script's behavior.

## High-Level Architecture
The current implementation is a significant modernization of the original script.

*   **Dependency-Free:** The script is written in modern, vanilla JavaScript, using features like `fetch`, `async/await`, and `Promise`. It has no external dependencies like jQuery.
*   **Provider Model:** Data fetching is abstracted into a provider model (`BloggerProvider`, `WordPressProvider`, `RssProvider`) with corresponding data mapping functions. This allows the script to be data-source agnostic.
*   **Modular Structure:** The code is organized into small, single-purpose helper functions, promoting readability and maintainability over the original's monolithic structure.

---
## 1. Data Extraction and Normalization

The script must normalize data from various feed sources into a consistent internal object structure for each post.

### 1.1. Title (`title`)
- **Source**: `entry.title.$t` (Blogger), `item.title` (WP/RSS).
- **Processing**: No special processing. Direct assignment.

### 1.2. URL (`url`)
- **Source**: Loop through `entry.link` array (Blogger). Find the object where `rel === "alternate"`. The URL is the `href` property of that object. For WP/RSS, it's `item.link`.
- **Processing**: Direct assignment.

### 1.3. Author (`author`)
- **Source**: `entry.author[0].name.$t` (Blogger), `item.author` (WP/RSS).
- **Processing**: Direct assignment.

### 1.4. Date (`date`)
- **Source**: `entry.published.$t` (Blogger), `item.pubDate` (WP/RSS).
- **Processing**: The raw date string is parsed into a `Date` object and formatted to `Mon Day, Year` (e.g., "Jan 01, 2025") using the modern, built-in `Intl.DateTimeFormat` API.

### 1.5. Snippet (`snippet`)
- **Source**: `entry.content.$t` or `entry.summary.$t` (Blogger), `item.description` (WP/RSS).
- **Processing**:
    1. The raw HTML content string is parsed using `new DOMParser()`. The `.textContent` of the resulting document body is extracted to safely strip all HTML tags.
    2. If the stripped text's length is greater than 70, it is truncated to the length specified by `data-snippetSize` (default `150`).
    3. If truncation occurred, `"..."` is appended.

### 1.6. Image (`image`)
- **Source Priority (for Posts)**:
    1.  **YouTube RSS Feed**: For YouTube feeds, the script directly uses the URL from the `<media:thumbnail>` tag within each `<entry>`. This is the most reliable source.
    1.  **First Image in Content (Blogger)**: Parse the post's HTML content to find the `src` of the first `<img>` tag. The `media$thumbnail` property is intentionally ignored to favor the higher-quality, un-cropped image from the post body.
    2.  **Thumbnail URL (WordPress/Generic RSS)**: Use `post.thumbnailUrl` if available (from `wp:featuredmedia` in WordPress or `<media:thumbnail>` in RSS). If not, parse the content for the first `<img>` tag.
    3.  **No Image Fallback**: If no image is found, a placeholder URL is used.
- **Source (for Comments)**:
    - Use `post.authorImage` (from `entry.author[0].gd$image.src`). If the URL contains `blogblog.com`, it's considered a default avatar, and the script falls back to the `noImg` placeholder.
- **Image URL Processing**:
    The script uses a multi-step process to generate and load the most optimal image for the context.
    1.  **Standard URL (`imageURL`)**: This is the default, lightweight URL, typically sourced from `post.thumbnailUrl` or a parsed image from the content. It's assigned to the `data-featuredImgSrc` attribute for standard blocks to ensure a fast initial load.
    2.  **High-Resolution URL (`highResImageURL`)**: This is a full-quality version of the URL.
        - **For YouTube videos**: It replaces the thumbnail filename (e.g., `hqdefault.jpg`) with `maxresdefault.jpg`.
        - **For Blogger images**: It replaces size specifiers (e.g., `/s72-c`) with `/s1600`.
        - This URL is assigned to `data-img-high` for fixed-background images and Showcase thumbnails to ensure a crisp display when they become the main feature.
    3.  **Runtime Sizing (`_loadOptimalImages`)**: An `IntersectionObserver` lazy-loads images. When an image enters the viewport, it calculates the required dimension based on the container size and device pixel ratio. If the URL is a resizable Blogger URL (containing `/s1600`), it requests a dynamically-sized version (e.g., `/s500`). Otherwise, it loads the high-resolution URL directly.

### 1.7. Image Blur (`config.blurImage`)
- **Source**: `data-iBlur` attribute.
- **Default Logic**: If the attribute is not explicitly set to `true` or `false`, blur defaults to `true` for types that include a text overlay (`h` modifier) but are **not** one of the following base types: `BLOCK_SHOWCASE` (s), `BLOCK_LIST` (l), `BLOCK_STACK` (t), `BLOCK_PANCAKE` (p), or `BLOCK_QUOTE` (q). This primarily affects the `BLOCK_COVER` (v) and `BLOCK_GALLERY` (g) types.
- **Effect**: If true, a `blur-5` class is added to the image element.

### 1.8. Video ID (`videoId`)
- **Source Priority**: The script uses a prioritized approach to find the ID:
    1.  **Direct Property**: Use `post.videoId` if it's provided directly by the data source (e.g., a YouTube RSS feed).
    2.  **Thumbnail URL**: If `post.thumbnailUrl` is a YouTube thumbnail URL, the script extracts the video ID from the path segment that follows `/vi/`.
    3.  **Content Fallback**: As a last resort, parse `post.content` for a `youtube.com/embed/` URL and extract the ID from there.
- **Default**: If no ID is found, the value is `"noVideo"`.
- **Usage**: The presence of a `videoId` other than `"noVideo"` is the canonical way the script identifies a post as a video post, which influences rendering logic (e.g., in the Showcase block).

## 2. HTML Structure and Rendering Logic

The script generates HTML strings and injects them into the DOM using jQuery's `.append()` and `.before()`. The structure is determined by `data-type` and other attributes.

### 2.1. Main Container
- The root element is a `div` with a generated `id` (e.g., `mWidgetID`).
- **Classes**: `overflow-hidden`, `bg-{theme}`, and conditional classes:
    - `sFeature` if `data-type` starts with `s`.
    - `carousel`, `carousel-fade` if `data-isCarousel="true"`.

### 2.2. Block Header
- Rendered only on the **initial load** of the block, and only if `data-title` is not empty. It is not re-rendered during pagination.
- Structure:
  ```html
  <div class="text-center m-0 bg-{theme} py-5">
      <h4 class="display-5 fw-bold text-{inverseTheme} py-3 m-0 {opacityClass}">${title}</h4>
      <span class="pb-3 text-black-50">${description}</span>
  </div>
  ```
- {opacityClass} is opacity-50 if data-lowContrast="true".

### 2.3. Item Wrapper
The parent of the articles is a `div` with `row`, `g-{gutter}`, and responsive column classes (e.g., `row-cols-1 row-cols-md-2 row-cols-lg-3`). Each item is then rendered inside an `<article>` tag. A new row `div` is started at `postID=0`, or when a carousel slide wraps, or specifically for the second item (`postID=1`) in a `list` type block.
The row `div` receives responsive horizontal padding (`px-2 px-sm-3 ...`) for most block types, but receives `px-0` for the `BLOCK_LIST` type to ensure list items are flush with the container edges.
- **Structure**: `<article class="col d-inline-flex ..." role="article">...item...</article>`

### 2.4. Item Rendering (data-type)
The core rendering logic is a series of `switch` statements and string concatenations based on the `data-type` attribute. The generated HTML for each item is a string.

**Base Type `v` (Cover) (`BLOCK_COVER`):**
- The `<article>` has an inline style with `height:{sectionHeight}`.
- The item is an `<a>` tag with classes: `overflow-hidden`, `w-100`, `shadow-sm`, `rounded-0`, `card`, `text-center`, `h-100`.
- An `<img>` or `<figure>` tag is rendered inside the `<a>` tag.
    - If `data-iFix="true"`, a `<figure>` is used with an inline `background-image` style (using `highResImageURL`).
    - Otherwise, an `<img>` tag is used with the dynamically-sized URL (`finalUrl`).
- A `<div>` for text content is rendered inside the `<a>` tag with classes: `text-bg-{theme}`, `bg-opacity-75`, `p-4 p-sm-5`, `position-absolute`, `w-75`, `start-50`, `translate-middle`.
- Text Alignment (`data-textVAlign`) adds classes to the text `div`:
    - `top`: `translate-middle-x mt-5`
    - `middle`: `top-50` (default)
    - `bottom`: `translate-middle-x bottom-0 mb-5`
    - `overlay`: `top-50 h-100 w-100`

**Base Type `p` (Pancake) (`BLOCK_PANCAKE`):**
- The item is an `<a>` tag with classes: `overflow-hidden`, `w-100`, `shadow-sm`, `{corner}`, `card`, `border-0`.
- An `<img>` tag is rendered with `ratio` classes from `data-ar`.
- A sibling `div` with class `card-body` holds the text content.

**Base Type `t` (Stack) (`BLOCK_STACK`):**
- The item is an `<a>` tag with classes: `overflow-hidden`, `w-100`, `shadow-sm`, `{corner}`, `card`, `border-0`, `row`, `g-0`.
- An `<img>` tag is rendered inside with class `col-4`.
- A sibling `div` with class `col-8 h-100` contains a `card-body` div for the text.

**Base Type `s` (Showcase) (`BLOCK_SHOWCASE`):**
- This is a complex block with two simple blocks/parts: `feature` and `thumbnails` to create a "feature + thumbnails" layout
- **Feature**: A static element rendered from the first post's data (`posts[0]`). It's a `div.feature-image` containing a `<figure>` for the image, a `div.sIframe` for YouTube videos, and an `a` tag wrapping a `div.sContent` for the text overlay.
- **Thumbnails**: An interactive grid of thumbnails is rendered for **all** posts in the feed, including the first one. Clicking a thumbnail updates the content of the static Feature element.
- **Container**: All thumbnail `<article>` elements are wrapped within a `<div class="row ...">`. This `div` receives the appropriate gutter and responsive column classes.
- **Carousel Behavior**: If `data-isCarousel` is true, the thumbnail grid is chunked into slides based on `data-cols` and `data-rows`. The static Feature element is not part of the carousel.
- **Item Structure**: Each thumbnail is an `<article>` tag with the class `sPost`. It is populated with `data-*` attributes to store the post's data.
- **Item Content**: Inside the `<article>`, a `<figure>` wraps an `<img>` tag. The `<figure>` receives the aspect ratio classes, and the `<img>` is styled to fill it. No text content or `<a>` wrapper is included.

**Base Type `l` (List) (`BLOCK_LIST`):**
- This is a special case. The first post is rendered as a full item.
- Subsequent posts are rendered as a different type to create a "feature + list" layout. If `showHeader` is true, they render as type `BLOCK_STACK`; otherwise, they render as type `BLOCK_CARD`.

### 2.5. Conditional Element Rendering (Modifiers)
Within each item's HTML string, the presence of elements is controlled by checking if the data-type string includes() the modifier character.

- **`h` (Heading)**:
    - For `BLOCK_COVER` type: Renders `<h3 class="display-5 mx-lg-5 {opacityClass}">`.
    - For `BLOCK_QUOTE` type: Renders a `<svg>` quote icon and a `<blockquote class="blockquote ...">`.
    - For `BLOCK_COMMENT` type: Renders `<span class="d-block my-2">`.
    - For all other types: Renders `<h5 class="card-title fw-normal">`.
- **`s` (Snippet)**: Renders `<summary class="list-unstyled {theme-class} {cover-class} {opacity-class}">`.
- **`a` (Author)**: Renders `<figcaption>` for `BLOCK_QUOTE` type, `<span>` for `BLOCK_COMMENT` type.
- **`d` (Date)**: Renders `<span class="small fw-lighter">`. If author is also present, it's prepended with `&#8226;`.

### 2.6. CTA Button (`data-CTAText`)
- The CTA is a `<button>` element, not an `<a>` tag.
- For the `BLOCK_COMMENT` type, it is rendered as a `<span>` instead of a `<button>`.
- Its classes and position are highly dependent on the `data-type`:
    - **`BLOCK_COVER` type**: `p-2 px-4 mx-lg-5 mt-4`
    - **`BLOCK_SHOWCASE` type**: `p-3 px-lg-5 float-end`
    - **`BLOCK_PANCAKE`, `BLOCK_QUOTE` types**: `py-2 px-3 w-100 text-end link-{inverseTheme}` (rendered in a footer-like position).
    - **`BLOCK_CARD`, `BLOCK_LIST` types**: `bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto`

### 2.8. Item Wrapper (`<a>` tag)
- The main clickable wrapper for each post item is an `<a>` tag. Its classes are determined by the block type.
- **Base Classes**: `overflow-hidden`, `w-100`, `shadow-sm`, `{cornerStyle}` (e.g., `rounded`), `border-0` (unless `data-iBorder` is true).
- **Type-Specific Classes**:
    - `BLOCK_COVER`, `BLOCK_QUOTE`: `card`, `text-center`, `h-100`.
    - `BLOCK_STACK`, `BLOCK_COMMENT`: `card`, `row`, `g-0`.
    - `BLOCK_LIST`: `card`, `{aspectRatio}`, `mt-{gutterSize}`.
    - `BLOCK_CARD`, `BLOCK_GALLERY`: `card`, `{aspectRatio}`.
    - `BLOCK_COMMENT`: Replaces `card` with `text-bg-{inverseTheme}`.

### 2.9. Fixed Image (`data-iFix="true"`)
- If `data-iFix` is true, the standard `<img>` tag is replaced with a `<figure>` element.
- The `<figure>` is rendered with a `data-bg-src` attribute pointing to the `highResImageURL`. This ensures the highest quality image is used as the base.
- At runtime, the `_loadOptimalImages` function detects the `data-is-fixed="true"` attribute. It then:
    - Calculates the optimal image size based on the **viewport dimensions**, not the element's container.
    - Applies the dynamically-sized image as a `background-image` and adds the necessary CSS properties: `background-attachment: fixed`, `background-position: center center`, and `background-size: cover`.

## 3. Carousel Logic
If `data-isCarousel` is true, the generated item HTML strings are not placed directly into the main grid. Instead, they are grouped and wrapped in Bootstrap carousel markup.

- **Carousel Disabling**: The carousel is automatically disabled if `data-posts` is `1` or if the `data-type` is `BLOCK_LIST`, regardless of the `data-isCarousel` attribute.
- **Responsive Columns (`actualColumnCount`)**: The number of visible columns in the carousel is dynamically calculated based on `window.innerWidth` and the `data-cols` setting. This `actualColumnCount` value is used for chunking, not the raw `data-cols`. The logic uses a map (`RESPONSIVE_COLUMN_MAP`) to determine the column count for `xs, sm, md, lg, xl` breakpoints.
    - `width < 576` (xs)
    - `width < 768` (sm)
    - `width < 992` (md)
    - `width < 1200` (lg)
- **Chunking**: Items are chunked into groups of `actualColumnCount * data-rows`. Each chunk is wrapped in a `<div class="carousel-item">`. The first one gets the `active` class.
- **Indicators**: `<button>` elements are generated and appended to a `.carousel-indicators` container.
- **Pagination (Nav-Mode)**: If there aren't enough items for a full carousel slide, the script enters a "nav" mode.
    - The prev/next buttons get `nav-prev`/`nav-next` classes.
    - These buttons handle pagination by hiding/showing `divs` and re-triggering the main `mBlocks` function to fetch the next "page" of content.

## 4. Block Footer
- A `<nav>` element is rendered after the main content grid.
- It contains a "More" link (`data-moreText`) that points to the feed's alternate link.
- The link has the structure: `<a href="{moreLink}?&max-results=12">...</a>`.
- The footer is omitted if `data-moreText` is empty AND the type is `BLOCK_COVER`.

## 5. Event Handlers and Special Logic

### 5.1. Showcase (`s`) Type Interaction
- **Thumbnail Click**: A single, delegated event listener is attached to the showcase grid container (`.sFeature`). This is more performant than attaching individual handlers.
- **Action**: When a thumbnail is clicked, it reads the `data-*` attributes from the clicked element.
- **DOM Update**: It updates the main feature element (`.feature-image`) with the new post's data:
-    The text content (`h5` and `summary`) inside `.sContent` is replaced.
-    The link `href` on the main `<a>` tag is updated.
-    If the new post is a video (`data-vidid` is not `"noVideo"`), a large YouTube icon SVG is added to the feature image as a visual cue. If it's not a video, any existing icon is faded out. The `iframe` container is hidden.
- **Tooltip Update**: The `title` attribute of the main link and button are updated to the post's title.
- **Video Play**: A separate click handler is attached to the main feature image (`figure`).
    - **Action**: On click, it reads its own `data-vidid` attribute.
    - **DOM Update**: If the ID is not `"noVideo"`, it hides the `<figure>` and its `.sContent` overlay, then shows the `.sIframe` container. It populates the iframe with the YouTube embed URL, including the `?autoplay=1` parameter.

### 5.2. Pagination (`isNav` mode)
- **Next Button**: A click handler is attached to `.nav-next`.
-    - **Action**: It fades out the current content (`div.st{N}`). It increments the `data-s` attribute on the root element.
    - **Logic**: It checks if the next stage (`.st{N+1}`) already exists in the DOM.
-        - If yes, it fades out the current footer (`nav.st{N}`) and fades in the existing next stage content and footer (`div.st{N+1}` and `nav.st{N+1}`).
-        - If no, it **removes** the current stage's footer (`nav.st{N}`) from the DOM and then re-invokes the main `mBlocks()` function to fetch and render the next page. This prevents duplicate footers.
- **Previous Button**: A click handler is attached to `.nav-prev`.
-    - **Action**: It fades out the current content and footer (`div.st{N}` and `nav.st{N}`). It decrements the `data-s` attribute.
-    - **Logic**: It fades in the (assumed to be existing) previous stage's content and footer (`div.st{N-1}` and `nav.st{N-1}`).

### 5.4. Image Rendering Logic
The script uses a multi-step process to determine the correct image URL for each context, optimizing for performance.

#### 5.4.1. URL Generation (`_renderImage` & `_renderShowcaseThumbnail`)
1.  **Standard URL (`imageURL`)**: This is the default, lightweight URL.
    - It's sourced from `post.thumbnailUrl` (from the feed) if available.
    - For comments, it falls back to the author's avatar, unless it's a default Blogger avatar (containing `blogblog.com`).
    - If no URL is found, it falls back to a placeholder (`noImg`).
2.  **High-Resolution URL (`highResImageURL`)**: This is a full-quality version of the URL.
    - **For YouTube videos**: It replaces the thumbnail filename (e.g., `hqdefault.jpg`) with `maxresdefault.jpg`.
    - **For Blogger images**: It replaces size specifiers (e.g., `/s72-c`) with `/s1600`.
    - **For other images**: It remains the same as the standard URL.

#### 5.4.2. HTML Attribute Assignment
The script assigns different URLs to different `data-*` attributes to control what gets loaded.

- **Standard Blocks (Card, Pancake, etc.)**:
    - The `src` attribute of the `<img>` tag is set directly to the standard `imageURL`. This ensures these blocks load lightweight images by default without relying on a placeholder.
    - The only exception is for fixed-background images (`data-iFix="true"`), where `data-img-high` is set to the `highResImageURL` to ensure a crisp parallax effect.
- **Showcase Block (`_renderShowcaseThumbnail`)**:
    - The `src` attribute of the `<img>` tag is populated directly with the standard `thumbnailUrl`. This ensures the small grid items load a lightweight image by default, leveraging the browser's native `loading="lazy"`.
    - The `<img>` tag also receives the `m-blox-image-to-load` class, allowing the `_loadOptimalImages` function to apply dynamic resizing if it's a Blogger image.
    - The `highResImageURL` is stored in the `data-img-high` attribute on the parent `<article>` element. The click event handler reads from this attribute to update the main featured image.

#### 5.4.3. Runtime Sizing (`_loadOptimalImages`)
- This function uses an `IntersectionObserver` to lazy-load images.
- When an image placeholder enters the viewport, it reads the `src` (for standard images and showcase thumbnails) or `data-img-high` (for backgrounds).
- It calculates the required image dimension based on the device pixel ratio and:
    - The **viewport's larger dimension** (`Math.max(window.innerWidth, window.innerHeight)`) if the image has `data-is-fixed="true"`. This behavior applies to **all** feed types.
    - The element's container width for all other images.
- **If the URL is a resizable Blogger URL** (contains `/s1600`), it replaces `/s1600` with the optimal calculated size (e.g., `/s500`) and loads the new URL.
- **If the URL is not a resizable Blogger URL** (e.g., YouTube's `maxresdefault.jpg`), the resizing logic is skipped, and the original high-resolution URL from the `data-` attribute is loaded. This is the correct and safe fallback behavior.

### 5.5. Text Content Rendering Logic (`_renderPostContent`)
- **Wrapper Divs**: The text content is wrapped in one or more `<div>`s whose classes depend on the block type.
    - `BLOCK_COMMENT`: `<div class="col p-2 ps-0">...</div>`
    - `BLOCK_STACK`: If an image is shown, content is wrapped in `<div class="col-8 h-100"><div class="card-body...">...</div></div>`. If no image, just `<div class="card-body...">...</div>`.
    - `BLOCK_PANCAKE`, `BLOCK_QUOTE`: `<div class="card-body...">...</div>`.
    - `BLOCK_LIST`: `<div class="text-bg-{theme} bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>` is rendered, followed by the main text `div`.
    - `BLOCK_CARD`: `<div class="text-bg-{theme} bg-opacity-75 rounded-0 p-5 {valign-class}">...</div>`.
    - `BLOCK_COVER`: `<div class="text-bg-{theme} bg-opacity-75 p-4 p-sm-5 position-absolute w-75 {corner-and-valign-classes}">...</div>`.
- **Text Vertical Alignment (`data-textVAlign`)**:
    - For `BLOCK_CARD`:
        - `top`: `h-auto`
        - `middle`: `h-auto top-50 translate-middle-y`
        - `bottom`: `h-auto bottom-0` with `style="top:auto;"`
        - `overlay`: (no extra class)
    - For `BLOCK_COVER`:
        - `top`: `start-50 translate-middle-x mt-5`
        - `middle`: `start-50 translate-middle top-50`
        - `bottom`: `start-50 translate-middle-x bottom-0 mb-5`
        - `overlay`: `start-50 translate-middle top-50 h-100 w-100`
- **Theme/Opacity**:
    - For `BLOCK_PANCAKE` and `BLOCK_STACK` (when in a `list` block) types, the `card-body` gets `h-100 bg-opacity-75 text-bg-{theme}` if the theme is not `light`. Otherwise, it gets `text-{inverseTheme}`.
- **CTA Button Placement**:
    - For `BLOCK_PANCAKE` and `BLOCK_QUOTE` types, the CTA button is rendered *outside* and *after* the main `card-body` wrapper.
    - For all other types, it is rendered *inside* the main text wrapper.

### 5.7. No Content Fallback
- If the data fetch returns no posts, a fallback message is rendered. The message is context-aware based on the data provider.
    - **Blogger Feeds**:
        - `data-contentType="recent"`: "Sorry! No recent updates."
        - `data-contentType="comments"`: "No comments. <br/> Start the conversation!"
        - `data-contentType="label"`: "Sorry! No content found for "{labelName}"!"
    - **Non-Blogger Feeds (WordPress, RSS, etc.)**:
        - A generic message is shown: "Sorry! No content found."

## 6. Default Attribute Values

If `data-*` attributes are not provided in the HTML, the script applies the following default values.

The implementation uses a two-stage process for defaults. First, attributes are read. Then, a separate function (`_applyDefaultConfig`) applies context-dependent defaults (e.g., `data-iHeight` depends on `blockType`). This is a more robust approach than a single lookup table.

The effective defaults are as follows:

| Attribute | Default Value | Notes |
|---|---|---|
| `data-label` | `"Label Name missing"` | |
| `data-contentType` | `"recent"` | |
| `data-feed` | `"/"` | |
| `data-title` | `""` (empty string) | |
| `data-description` | `""` (empty string) | |
| `data-type` | `"v-ih"` | Cover type with Image and Heading. |
| `data-theme` | `"light"` | |
| `data-posts` | `3` | |
| `data-rows` | `1` | |
| `data-snippetSize` | `150` | |
| `data-corner` | `"rounded"` | The alternative is `"sharp"`. |
| `data-ar` | `"1x1"` | Aspect Ratio. |
| `data-CTAText` | `""` (empty string) | |
| `data-moreText` | `""` (empty string) | |
| `data-iHeight` | `100vh` for `BLOCK_COVER`, `70vh` for `BLOCK_SHOWCASE`, `m` (auto) otherwise. | Context-dependent. |
| `data-gutter` | `0` for `BLOCK_COVER`, `3` otherwise. | Context-dependent. |
| `data-textVAlign` | `middle` for `BLOCK_COVER`, `bottom` for `BLOCK_LIST`, `overlay` otherwise. | Context-dependent. |
| `data-cols` | `1` for `v,m,t`; `2` for `l`; `3` for `p`; `4` for `c,q`; `5` for `g`; `6` for `s`. | This uses the single-character identifiers as it refers to the `DEFAULT_COLUMN_COUNTS` map keys in the code. |
