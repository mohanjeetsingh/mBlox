# mBlox

mBlox is a lightweight, dependency-free JavaScript library that enables dynamic, Elementor/Gutentor-like content blocks. It can fetch and display content from various sources like **Blogger**, **WordPress**, and any **RSS feed** (including YouTube) in a variety of customizable layouts.

It can be deployed on **any website** to display content from any supported feed type.

## Features

*   **Dynamic Content**: Fetch recent posts, posts by label, or recent comments.
*   **Highly Customizable**: A wide range of `data-*` attributes to control layout, style, and content.
*   **Variety of Layouts**: Includes showcases, carousels, grids, lists, and more.
*   **Lazy Loading**: Content blocks can be lazy-loaded on scroll for better performance.
*   **Responsive Design**: Built with Bootstrap 5 to be mobile-first and responsive.
*   **Multi-Platform**: Supports Blogger, WordPress (REST API), and standard RSS/Atom feeds out of the box.
*   **Easy Integration**: Add a `section` or `div` with the right class and data attributes, and the script does the rest.

## Dependencies

mBlox relies on the following libraries:

*   **Bootstrap 5**: For styling and layout components like grids and carousels.

## How to Use

1.  Include the necessary CSS and JS files in your Blogger template or website's `<head>` section.

    ```html
    <!-- Required: Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Required: mBlox CSS -->
    <link href='path/to/mBlox.css' rel='stylesheet'/>
    
    <!-- Required: mBlox Initializer -->
    <script src='path/to/mBloxCall.js' defer></script>
    ```
    **Note on Scripts:**
    *   `mBloxCall.js`: This is the lightweight entry point. Its sole purpose is to find `mBlock` (eager) and `mBlockL` (lazy-loaded) elements on the page and trigger the main `mBlox` library. It contains the `IntersectionObserver` for lazy loading and is designed to be kept simple.
    *   `mBloxScript.js`: This is the core library that `mBloxCall.js` loads automatically. It contains all the logic for fetching data, rendering blocks, and handling interactivity. You do not need to include this script in your HTML manually.


2.  Add an element (like `<section>` or `<div>`) to your HTML where you want the block to appear.

3.  Give the element the class `mBlock` for standard loading or `mBlockL` for lazy loading.

4.  Add `data-*` attributes to configure the block.

### Example

```html
<section
    class='mBlockL'
    data-contenttype='recent'
    data-label="Articles"
    data-feed='https://your-blog.blogspot.com/'
    data-posts="6"
    data-type="s-ih"
    data-title="Featured Articles"
    data-theme="dark"
    data-isCarousel="true"
    data-CTAText="Read More"
    >
</section>
```

## Configuration

Customize mBlox using the following `data-*` attributes on your placeholder element:

| Attribute | Description | Default | Example |
|---|---|---|---|
| `data-ar` | Aspect ratio for images/cards. E.g., `1x1`, `16x9`, `4x3`. | `1x1` | `16x9` |
| `data-cols` | Number of columns in the grid. Defaults vary by `data-type`. | Varies | `4` |
| `data-contenttype` | Type of content to fetch. Options: `recent`, `label`, `comments`. | `recent` | `label` |
| `data-corner` | Corner style. Options: `rounded` (default), `sharp`. | `rounded` | `sharp` |
| `data-CTAText` | Text for a call-to-action button on each post item. | `""` | `Read More` |
| `data-description` | A subtitle or description for the block header. | `""` | `Check out our recent updates.` |
| `data-feed` | The full URL of the Blogger blog to fetch from. | `/` (current site) | `https://mohanjeet.blogspot.com/` |
| `data-gutter` | Gutter spacing between grid items (Bootstrap gutter value 0-5). | Varies | `3` |
| `data-iBlur` | Set to `true` to apply a blur filter to images. | Varies by type | `true` |
| `data-iBorder` | Set to `true` to add a border around post items. | `false` | `true` |
| `data-iFix` | Set to `true` to use images as fixed backgrounds (`background-attachment: fixed`). | `false` | `true` |
| `data-iHeight` | Sets a fixed height for images/blocks. Accepts any CSS height value. | Varies by type | `70vh` |
| `data-isCarousel` | Set to `true` to display posts in a carousel. | `false` | `true` |
| `data-label` | The label name to fetch posts from. Required if `data-contenttype` is `label`. | `Label Name missing` | `Articles` |
| `data-lowContrast` | Set to `true` to reduce the opacity of some text elements for a lower contrast look. | `false` | `true` |
| `data-moreText` | Text for a link to the original blog/label page. If empty, no link is shown. | `""` | `View All` |
| `data-posts` | Number of posts to fetch per block/page. | `3` | `6` |
| `data-rows` | Number of rows per carousel slide. | `1` | `2` |
| `data-snippetSize` | The maximum number of characters for the post snippet. | `150` | `100` |
| `data-textVAlign` | Vertical alignment of text on cards. Options: `top`, `middle`, `bottom`, `overlay`. | Varies by type | `bottom` |
| `data-theme` | The color scheme for the block. Options: `light`, `dark`, `primary`, `secondary`, etc. | `light` | `dark` |
| `data-title` | A title for the block, displayed in a header section. | `""` | `Latest News` |
| `data-type` | Defines the visual style. A combination of a base type and modifiers (e.g., `s-ihs`). See **Types** below. | `v-ih` | `s-ihs` |

### `data-type` Explained

The `data-type` attribute is a powerful way to control the appearance of each post item. It's a string composed of a **base type** character followed by one or more **modifier** characters.

*   **Format**: `[base]-[modifiers]` (e.g., `s-ihs`)

**Base Types (first character):**
*   `v`: co**V**er
*   `s`: **S**howcase
*   `l`: **L**ist
*   `c`: **C**ard
*   `g`: **G**allery
*   `p`: **P**ancake (stacked)
*   `t`: s**T**ack (horizontal)
*   `q`: **Q**uote
*   `m`: co**M**ment

**Modifiers (characters after `-`):**
*   `i`: Show **I**mage
*   `h`: Show **H**eading (Title)
*   `s`: Show **S**nippet
*   `a`: Show **A**uthor
*   `d`: Show **D**ate

## 4. Content Fetching

The library must support fetching and parsing data from multiple sources.

### 4.1. Blogger

*   **Method**: Use the public JSON-in-script feeds.
*   **Endpoints**:
    *   Recent Posts: `/feeds/posts/default?alt=json-in-script&max-results={n}`
    *   Posts by Label: `/feeds/posts/default/-/{label}?alt=json-in-script&max-results={n}`
    *   Recent Comments: `/feeds/comments/default?alt=json-in-script&max-results={n}`
*   **Parsing**: The response is a JSON object passed to a callback function. The script should dynamically create a `<script>` tag and define a global callback to handle the data.

### 4.2. WordPress

*   **Method**: Use the public REST API.
*   **Endpoints**:
    *   Recent Posts: `/wp-json/wp/v2/posts?per_page={n}`
    *   Posts by Category: Requires finding category ID first, then `/wp-json/wp/v2/posts?categories={id}&per_page={n}`
*   **Parsing**: Standard JSON response from a `fetch` call.

### 4.3. RSS/Atom

*   **Method**: Fetch the public XML feed.
*   **Endpoints**: Any valid RSS/Atom feed URL (e.g., YouTube, Pinterest, Substack).
*   **Parsing**: Requires using `DOMParser` to parse the XML string into a DOM object, then traversing it to extract item data (title, link, description, etc.).

## 5. Rendering Logic

The rendering process should follow these steps:

1.  **Fetch Data**: Based on `data-feed` and `data-contenttype`, call the appropriate data fetcher.
2.  **Parse Data**: Normalize the data from the source (Blogger, WP, RSS) into a consistent internal format (e.g., an array of post objects with `title`, `url`, `image`, `snippet`, `author`, `date` properties).
3.  **Generate Header**: If `data-title` is present, create the block's header section.
4.  **Iterate and Render Items**: Loop through the normalized post objects. For each post:
    *   Create the main wrapper for the item (e.g., `<div class="col">...</div>`).
    *   Apply styles based on `data-type`, `data-ar`, `data-corner`, etc.
    *   Conditionally build the inner HTML of the item based on the modifiers in `data-type` (`i`, `h`, `s`, `a`, `d`).
5.  **Wrap in Carousel**: If `data-isCarousel="true"`, wrap the rendered items in the necessary Bootstrap 5 carousel markup.
6.  **Inject into DOM**: Append the generated HTML into the placeholder element.
7.  **Initialize Carousel**: If a carousel was created, initialize the Bootstrap carousel component on the new element.
