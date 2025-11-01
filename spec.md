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
    1.  **YouTube Thumbnail**: If content contains `//www.youtube.com/embed/`, use `entry.media$thumbnail.url` and replace `/default.jpg` with `/maxresdefault.jpg`. This is stored as a separate `videoThumbnail` variable (`iV`).
    2.  **First Image in Content**: If content contains `<img`, parse the content to find the `src` of the first `<img>` tag.
    3.  **No Image Fallback**: If no image is found, a placeholder URL (`noImg` variable) is used.
- **Source (for Comments)**:
    - Use `entry.author[0].gd$image.src`. If the URL contains `blogblog.com`, it's a default avatar, so fall back to the `noImg` placeholder.
- **Image URL Processing (Blogger)**:
    The script generates two distinct image URLs from the source:
    1.  **High-Resolution (`iH`)**: Created by taking the source URL and replacing known size specifiers (e.g., `/s72-c`, `/w640-h424`) with `/s1600`. This version is used for `background-image` styles. If no known specifier is found, `iH` is the same as the source URL.
    2.  **Dynamically-Sized (`iU`)**: This is not a pre-calculated URL. Instead, the script renders a placeholder `<img>` or `<figure>`. At runtime, a function (`_loadOptimalImages`) measures the element's container size (`getBoundingClientRect`) and device pixel ratio, then requests an optimally-sized image from the server by replacing `/s1600` in the high-resolution URL with a calculated size (e.g., `/w400`). This is a more effective, just-in-time optimization.

### 1.7. Image Blur (`isBlur`)
- **Source**: `data-iBlur` attribute.
- **Default Logic**: If the attribute is not explicitly set to `true` or `false`, blur defaults to `true` for types that include a text overlay (`h` modifier) but are **not** one of the following base types: `s`, `l`, `t`, `p`, `q`. This primarily affects the `v` (cover) and `g` (gallery) types.
- **Effect**: If true, a `blur-5` class is added to the image element.

### 1.8. Video ID (`videoID`)
- **Source**: A `videoId` property from a YouTube RSS feed, or by parsing a YouTube thumbnail URL (`img.youtube.com`).
- **Processing**: If the URL contains `/vi/`, the 11 characters following it are extracted as the ID.
- **Default**: If no ID is found, the value is `"regular"`.

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
The parent of the articles is a `div` with `row`, `g-{gutter}`, and responsive column classes (e.g., `row-cols-1 row-cols-md-2 row-cols-lg-3`). Each item is then rendered inside an `<article>` tag. A new row `div` is started at `p=0`, or when a carousel slide wraps, or specifically for the second item (`p=1`) in a `list` type block.

- **Structure**: `<article class="col d-inline-flex ..." role="article">...item...</article>`

### 2.4. Item Rendering (data-type)
The core rendering logic is a series of `switch` statements and string concatenations based on the `data-type` attribute. The generated HTML for each item is a string.

**Base Type `v` (Cover):**
- The `<article>` has an inline style with `height:{iHeight}`.
- The item is an `<a>` tag with classes: `overflow-hidden`, `w-100`, `shadow-sm`, `rounded-0`, `card`, `text-center`, `h-100`.
- An `<img>` or `<figure>` tag is rendered inside the `<a>` tag.
    - If `data-iFix="true"`, a `<figure>` is used with an inline `background-image` style (using `iH`).
    - Otherwise, an `<img>` tag is used with the dynamically-sized URL (`iU`).
- A `<div>` for text content is rendered inside the `<a>` tag with classes: `text-bg-{theme}`, `bg-opacity-75`, `p-4 p-sm-5`, `position-absolute`, `w-75`, `start-50`, `translate-middle`.
- Text Alignment (`data-textVAlign`) adds classes to the text `div`:
    - `top`: `translate-middle-x mt-5`
    - `middle`: `top-50`
    - `bottom`: `translate-middle-x bottom-0 mb-5`
    - `overlay`: `top-50 h-100 w-100`

**Base Type `p` (Pancake):**
- The item is an `<a>` tag with classes: `overflow-hidden`, `w-100`, `shadow-sm`, `{corner}`, `card`, `border-0`.
- An `<img>` tag is rendered with `ratio` classes from `data-ar`.
- A sibling `div` with class `card-body` holds the text content.

**Base Type `t` (Stack):**
- The item is an `<a>` tag with classes: `overflow-hidden`, `w-100`, `shadow-sm`, `{corner}`, `card`, `border-0`, `row`, `g-0`.
- An `<img>` tag is rendered inside with class `col-4`.
- A sibling `div` with class `col-8 h-100` contains a `card-body` div for the text.

**Base Type `s` (Showcase):**
- This is a special case. The first post is rendered differently from the others.
- **First Post (Feature)**: Rendered **only on initial load** before the main grid. It's a `div.feature-image` containing a `<figure>` for the image, a `div.sIframe` for YouTube videos, and an `a` tag wrapping a `div.sContent` for the text overlay.
- **Other Posts (Thumbnails)**: Rendered as `<article>` tags with `data-*` attributes holding all post info (`data-title`, `data-link`, `data-vidid`, etc.). These are interactive; clicking one updates the main "Feature" post.
- **Other Posts (Thumbnails)**: For `p > 0` (all posts after the first):
    - An `<article>` tag is rendered with the classes `col`, `d-inline-flex`, and `sPost`.
    - The `<article>` is populated with `data-*` attributes to store the post's data: `data-title`, `data-link`, `data-summary`, `data-vidid`, and `data-img`.
    - Inside the `<article>`, only an `<img>` tag is rendered. No text content (`h`, `s`, etc.) or `<a>` wrapper is included.
    - The `<img>` tag receives the `w-100`, `img-fluid`, `shadow-sm`, and aspect ratio (e.g., `ratio-1x1`) classes.

**Base Type `l` (List):**
- This is a special case. The first post is rendered as a full item.
- Subsequent posts are rendered as a different type to create a "feature + list" layout. If `showHeader` is true, they render as type `t` (stack); otherwise, they render as type `c` (card).

### 2.5. Conditional Element Rendering (Modifiers)
Within each item's HTML string, the presence of elements is controlled by checking if the data-type string includes() the modifier character.

- **`h` (Heading)**:
    - For `v` type: Renders `<h3 class="display-5 mx-lg-5 {opacityClass}">`.
    - For `q` type: Renders a `<svg>` quote icon and a `<blockquote class="blockquote ...">`.
    - For `m` type: Renders `<span class="d-block my-2">`.
    - For all other types: Renders `<h5 class="card-title fw-normal">`.
- **`s` (Snippet)**: Renders `<summary class="list-unstyled...">`.
- **`s` (Snippet)**: Renders `<summary class="list-unstyled {theme-class} {cover-class} {opacity-class}">`.
- **`a` (Author)**: Renders `<figcaption>` for `q` type, `<span>` for `m` type.
- **`d` (Date)**: Renders `<span class="small fw-lighter">`. If author is also present, it's prepended with `&#8226;`.

### 2.6. CTA Button (`data-CTAText`)
- The CTA is a `<button>` element, not an `<a>` tag.
- For the `m` (comment) type, it is rendered as a `<span>` instead of a `<button>`.
- Its classes and position are highly dependent on the `data-type`:
    - **`v` type**: `p-2 px-4 mx-lg-5 mt-4`
    - **`s` type**: `p-3 px-lg-5 float-end`
    - **`p`, `q` types**: `py-2 px-3 w-100 text-end link-{inverseTheme}` (rendered in a footer-like position).
    - **`c`, `l` types**: `bottom-0 end-0 me-3 mb-3 d-block position-absolute`

### 2.7. Item Wrapper (`<a>` tag)
- The main clickable wrapper for each post item is an `<a>` tag. Its classes are determined by the block type.
- **Base Classes**: `overflow-hidden`, `w-100`, `shadow-sm`, `{cornerStyle}` (e.g., `rounded`), `border-0` (unless `data-iBorder` is true).
- **Type-Specific Classes**:
    - `v` (Cover), `q` (Quote): `card`, `text-center`, `h-100`.
    - `t` (Stack), `m` (Comment): `card`, `row`, `g-0`.
    - `l` (List): `card`, `{aspectRatio}`, `mt-{gutterSize}`.
    - `c` (Card), `g` (Gallery): `card`, `{aspectRatio}`.
    - `m` (Comment): Replaces `card` with `text-bg-{inverseTheme}`.

### 2.7. Fixed Image (`data-iFix="true"`)
- If `data-iFix` is true, the standard `<img>` tag is replaced with a `<figure>` element.
- This `<figure>` is given an inline `style` with `background:url(...) fixed center center;background-size:cover;`.
- The `_loadOptimalImages` function will then apply the image as a `background-image` and add the CSS properties `background-attachment: fixed`, `background-position: center center`, and `background-size: cover`.

## 3. Carousel Logic
If data-isCarousel is true, the generated item HTML strings are not placed directly into the main grid. Instead, they are grouped and wrapped in Bootstrap carousel markup.

- **Carousel Disabling**: The carousel is automatically disabled (hard-coded to `false`) if `data-posts` is `1` or if the `data-type` is `l` (list), regardless of the `data-isCarousel` attribute.
- **Responsive Columns (`aC`)**: The number of visible columns in the carousel is dynamically calculated based on `window.innerWidth` and the `data-cols` setting. This `aC` value is used for chunking, not the raw `data-cols`.
    - `iW < 576`: `bC < 5 ? 1 : (bC == 5 ? 2 : 3)`
    - `iW < 768`: `bC < 4 ? 1 : (bC == 4 ? 2 : (bC == 5 ? 3 : 4))`
    - `iW < 992`: `bC == 3 ? 2 : (bC == 4 ? 3 : 4)`
    - `iW < 1200`: `(bC > 4) && (bC == 5 ? 4 : 5)`
- **Chunking**: Items are chunked into groups of `aC * data-rows`. Each chunk is wrapped in a `<div class="carousel-item">`. The first one gets the `active` class.
- **Indicators**: `<button>` elements are generated and appended to a `.carousel-indicators` container.
- **Pagination (Nav-Mode)**: If there aren't enough items for a full carousel slide, the script enters a "nav" mode.
    - The prev/next buttons get `nav-prev`/`nav-next` classes.
    - These buttons handle pagination by hiding/showing `divs` and re-triggering the main `mBlocks` function to fetch the next "page" of content.

## 4. Block Footer
- A `<nav>` element is rendered after the main content grid.
- It contains a "More" link (`data-moreText`) that points to the feed's alternate link.
- The link has the structure: `<a href="{moreLink}?&max-results=12">...</a>`.
- The footer is omitted if `data-moreText` is empty AND the type is `v`.

## 5. Event Handlers and Special Logic

### 5.1. Showcase (`s`) Type Interaction
- **Thumbnail Click**: A single, delegated event listener is attached to the showcase grid container (`.sFeature`). This is more performant than attaching individual handlers.
- **Action**: When a thumbnail is clicked, it reads the `data-*` attributes from the clicked element.
- **DOM Update**: It updates the main feature element (`.feature-image`) with the new post's data:
-    The text content (`h5` and `summary`) inside `.sContent` is replaced.
-    The link `href` on the main `<a>` tag is updated.
-    If the new post is a video (`data-vidid` is not "regular"), a large YouTube icon SVG is added to the feature image as a visual cue. If it's not a video, any existing icon is faded out. The `iframe` container is hidden.
- **Tooltip Update**: The `title` attribute of the main link and button are updated to the post's title.
- **Video Play**: A separate click handler is attached to the main feature image (`figure`).
    - **Action**: On click, it reads its own `data-vidid` attribute.
    - **DOM Update**: If the ID is not "regular", it hides the `<figure>` and its `.sContent` overlay, then shows the `.sIframe` container. It populates the iframe with the YouTube embed URL, including the `?autoplay=1` parameter.
### 5.2. Pagination (`isNav` mode)
- **Next Button**: A click handler is attached to `.nav-next`.
    - **Action**: It hides the current content stage (`.st{N}`). It increments the `data-s` attribute on the root element.
    - **Logic**: It checks if the next stage (`.st{N+1}`) already exists in the DOM.
        - If yes, it fades in the existing element.
        - If no, it re-invokes the main `mBlocks()` function, which uses the new `data-s` value to fetch and render the next page of posts.
- **Previous Button**: A click handler is attached to `.nav-prev`.
    - **Action**: It hides the current content stage (`.st{N}`). It decrements the `data-s` attribute.
    - **Logic**: It fades in the (always existing) previous stage element (`.st{N-1}`).

### 5.3. Image Rendering Logic
- **Image Sizing (`s` variable)**: The script calculates an optimal image width (`s`) based on `window.innerWidth` and `data-cols`. This `s` value is used to construct the `iU` (dynamically-sized) URL by replacing `/s1600` with `/s{s}`.
- **Base Image Classes**: `w-100`, `img-fluid`.
- **Base Image Style**: `object-fit: cover; height: 100% !important;`
- **Type-Specific Image Logic**:
    - `s` (Showcase):
        - **Feature Image (Post 0)**: A `<figure>` is always used with inline style for background image and height.
        - **Grid Thumbnails**: `<img>` tags get `shadow-sm` and `{aspectRatio}` classes.
    - `p` (Pancake): `<img>` tag gets `{aspectRatio}` classes.
    - `m` (Comment):
        - `<img>` tag gets `rounded-circle`, `m-2`.
        - Inline style is overridden to `height: 3rem !important; width: 3rem;`.
    - `q` (Quote):
        - `<img>` tag gets `rounded-circle`, `mx-auto`, `mt-3`.
        - Inline style is overridden to `height: 6rem !important; width: 6rem;`.

### 5.4. Text Content Rendering Logic (`_renderPostContent`)
- **Wrapper Divs**: The text content is wrapped in one or more `<div>`s whose classes depend on the block type.
    - `m` (Comment): `<div class="col p-2 ps-0">...</div>`
    - `t` (Stack): If an image is shown, content is wrapped in `<div class="col-8 h-100"><div class="card-body...">...</div></div>`. If no image, just `<div class="card-body...">...</div>`.
    - `p` (Pancake), `q` (Quote): `<div class="card-body...">...</div>`.
    - `l` (List): `<div class="text-bg-{theme} bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>` is rendered, followed by the main text `div`.
    - `c` (Card): `<div class="text-bg-{theme} bg-opacity-75 rounded-0 p-5 {valign-class}">...</div>`.
    - `v` (Cover): `<div class="text-bg-{theme} bg-opacity-75 p-4 p-sm-5 position-absolute w-75 {corner-and-valign-classes}">...</div>`.
- **Text Vertical Alignment (`data-textVAlign`)**:
    - For `c` (Card):
        - `top`: `h-auto`
        - `middle`: `h-auto top-50 translate-middle-y`
        - `bottom`: `h-auto bottom-0` with `style="top:auto;"`
        - `overlay`: (no extra class)
    - For `v` (Cover):
        - `top`: `start-50 translate-middle-x mt-5`
        - `middle`: `start-50 translate-middle top-50`
        - `bottom`: `start-50 translate-middle-x bottom-0 mb-5`
        - `overlay`: `start-50 translate-middle top-50 h-100 w-100`
- **Theme/Opacity**:
    - For `p` and `t` (when in a `list` block) types, the `card-body` gets `h-100 bg-opacity-75 text-bg-{theme}` if the theme is not `light`. Otherwise, it gets `text-{inverseTheme}`.
- **CTA Button Placement**:
    - For `p` and `q` types, the CTA button is rendered *outside* and *after* the main `card-body` wrapper.
    - For all other types, it is rendered *inside* the main text wrapper.

### 5.3. No Content Fallback
- If the AJAX call returns successfully but the `feed.entry` array is empty, a fallback message is rendered.
- The message depends on the `data-contentType` attribute:
    - **`recent`**: "Sorry! No recent updates."
    - **`comments`**: "No comments. <br/> Start the conversation!"
    - **default (label)**: "Sorry! No content found for "{labelName}"!"

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
| `data-iHeight` | `100vh` for `v` type, `70vh` for `s` type, `m` (auto) otherwise. | Context-dependent. |
| `data-gutter` | `0` for `v` type, `3` otherwise. | Context-dependent. |
| `data-textVAlign` | `middle` for `v` type, `bottom` for `l` type, `overlay` otherwise. | Context-dependent. |
| `data-cols` | `1` for `v,m,t`; `2` for `l`; `3` for `p`; `4` for `c,q`; `5` for `g`; `6` for `s`. | Context-dependent. |
