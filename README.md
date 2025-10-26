# mBlox

mBlox is a lightweight JavaScript library that enables dynamic, Elementor/Gutentor-like content blocks for **Blogger**. It fetches posts or comments from any Blogger/BlogSpot blog and displays them in a variety of customizable layouts.

While originally intended for Blogger, it can be deployed on **any website** to display content from a Blogger feed.

## Features

*   **Dynamic Content**: Fetch recent posts, posts by label, or recent comments.
*   **Highly Customizable**: A wide range of `data-*` attributes to control layout, style, and content.
*   **Variety of Layouts**: Includes showcases, carousels, grids, lists, and more.
*   **Lazy Loading**: Content blocks can be lazy-loaded on scroll for better performance.
*   **Responsive Design**: Built with Bootstrap 5 to be mobile-first and responsive.
*   **Easy Integration**: Add a `section` or `div` with the right class and data attributes, and the script does the rest.

## Dependencies

mBlox relies on the following libraries:

*   **Bootstrap 5**: For styling and layout components like grids and carousels.

## How to Use

1.  Include the necessary CSS and JS files in your Blogger template or website's `<head>` section.

    ```html
    <link href='path/to/bootstrap.min.css' rel='stylesheet'/>
    <link href='path/to/mCustom.css' rel='stylesheet'/>
    <script src='path/to/bootstrap.bundle.min.js'></script>
    <script src='path/to/mBloxCall.js'></script>
    <script src='path/to/noImg.js'></script> <!-- Optional: for a placeholder image -->
    ```

2.  Add an element (like `<section>` or `<div>`) to your HTML where you want the block to appear.

3.  Give the element the class `mBlock` for standard loading or `mBlockL` for lazy loading.

4.  Add `data-*` attributes to configure the block.

### Example

```html
<section
    class='mBlockL'
    data-contenttype='label'
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
| `data-theme` | The color scheme for the block. Options: `light`, `dark`, `primary`, `secondary`. | `light` | `dark` |
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

## Collaboration

The intent is to also create a WordPress version of this tool that would use the WP-JSON API. If you have knowledge and interest in collaborating on this or improving the current version, please get in touch!

I'm a hobbyist designer and developer, so any guidance, suggestions, or feedback is heartily welcome. :)