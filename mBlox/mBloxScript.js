/*!
 * mBlox for Blogger
 * Demo @ https://mBloxForBlogger.blogspot.com/
 * Agency @ https://CIA.RealHappinessCenter.com
 * @version 1.0.0
 * Copyright (c) 2022-2024, Mohanjeet Singh (https://Mohanjeet.blogspot.com/)
 * Released under the MIT license
 */

// Guard clause to prevent re-initialization if the script is loaded multiple times.
if (typeof window.mBloxInitialized === 'undefined') {
    window.mBloxInitialized = true;

const // Constants for block types, improving readability over single-character strings.
    BLOCK_COVER = 'v',
    BLOCK_SHOWCASE = 's',
    BLOCK_LIST = 'l',
    BLOCK_CARD = 'c',
    BLOCK_GALLERY = 'g',
    BLOCK_PANCAKE = 'p',
    BLOCK_STACK = 't',
    BLOCK_QUOTE = 'q',
    BLOCK_COMMENT = 'm';





/**
 * Fetches data from a URL using the JSONP technique.
 * This is a lightweight, native replacement for jQuery's $.ajax with dataType: 'jsonp'.
 * @param {string} url The URL to request, which should support a JSONP callback.
 * @param {object} options Configuration for the request.
 * @returns {Promise<object>} A promise that resolves with the JSON data or rejects on error.
 */
window.fetchJSONP = function(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
        const script = document.createElement('script');

        // The URL already has query params, so we append the callback.
        script.src = `${url}&callback=${callbackName}`;

        window[callbackName] = function(data) {
            // Cleanup the script and global callback function
            delete window[callbackName];
            document.head.removeChild(script);

            // Resolve the promise with the data
            resolve(data);
        };

        // Basic error handling
        script.onerror = function() {
            delete window[callbackName];
            document.head.removeChild(script);
            
            // Reject the promise on error
            const errorMsg = `JSONP request to ${url} failed.`;
            console.error(errorMsg);
            reject(new Error(errorMsg));
        };

        document.head.appendChild(script);
    });
}



const DEFAULT_COLUMN_COUNTS = {
    [BLOCK_COVER]: 1,
    [BLOCK_COMMENT]: 1,
    [BLOCK_STACK]: 1,
    [BLOCK_PANCAKE]: 3,
    [BLOCK_CARD]: 4,
    [BLOCK_QUOTE]: 4,
    [BLOCK_GALLERY]: 5,
    [BLOCK_LIST]: 2,
    [BLOCK_SHOWCASE]: 6
};

const RESPONSIVE_GRID_CLASSES = {
    1: 'row-cols-1',
    2: 'row-cols-1 row-cols-sm-1 row-cols-md-2',
    3: 'row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3',
    4: 'row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4',
    5: 'row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5',
    6: 'row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6'
};

/**
 * Maps the raw response from the WordPress REST API to a standardized internal format.
 * @param {Array<object>} wpResponse The raw JSON array from the WordPress API.
 * @param {object} headers The response headers from the fetch call.
 * @returns {{posts: Array<object>, totalResults: number}} A standardized data object.
 */
window._mapWordPressResponseToStandardFormat = function(wpResponse, headers) {
    if (!Array.isArray(wpResponse)) {
        return { posts: [], totalResults: 0 };
    }

    const standardPosts = wpResponse.map(post => ({
        title: post.title.rendered,
        content: post.content.rendered,
        authorName: post._embedded?.author[0]?.name || 'Unknown',
        authorUri: post._embedded?.author[0]?.link || '',
        authorImage: post._embedded?.author[0]?.avatar_urls?.['96'] || '',
        publishedDate: post.date_gmt,
        url: post.link,
        // Find the best available featured image, defaulting to an empty string.
        thumbnailUrl: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url 
                   || post._embedded?.['wp:featuredmedia']?.[0]?.source_url 
                   || ''
    }));

    return { posts: standardPosts, totalResults: parseInt(headers.get('X-WP-Total') || '0', 10) };
}

/**
 * Maps a parsed RSS/XML feed to a standardized internal format.
 * @param {XMLDocument} xmlDoc The parsed XML document.
 * @returns {{posts: Array<object>, totalResults: number, feedUrl: string}} A standardized data object.
 */
window._mapRssResponseToStandardFormat = function(xmlDoc) {
    // Find all items, supporting both <item> (RSS) and <entry> (Atom) tags.
    const items = xmlDoc.querySelectorAll('item, entry');
    if (!items.length) {
        return { posts: [], totalResults: 0, feedUrl: '' };
    }

    // Check if this is a YouTube feed by looking for a specific tag.
    const isYouTube = xmlDoc.querySelector('yt\\:channelId') !== null;

    const standardPosts = Array.from(items).map(item => {
        const getTagContent = (tagName) => {
            const el = item.querySelector(tagName);
            return el ? el.textContent : '';
        };

        let post;

        if (isYouTube) {
            const videoId = getTagContent('yt\\:videoId');
            // YouTube nests the thumbnail in a media:group. We need to query inside it.
            const mediaGroup = item.querySelector('media\\:group');
            const thumbnailUrl = mediaGroup ? (mediaGroup.querySelector('media\\:thumbnail[url]')?.getAttribute('url') || '') : '';
            post = {
                title: getTagContent('title'),
                content: getTagContent('media\\:description') || '',
                authorName: getTagContent('author > name'),
                publishedDate: getTagContent('published'),
                url: item.querySelector('link[rel="alternate"]')?.getAttribute('href') || '',
                thumbnailUrl: thumbnailUrl,
                videoId: videoId, // Add videoId to the standard format
                authorUri: getTagContent('author > uri') || '',
                authorImage: ''
            };
        } else {
            // Generic RSS feed parsing logic
            let thumbnailUrl = item.querySelector('media\\:thumbnail[url], thumbnail[url]')?.getAttribute('url') || '';
            if (!thumbnailUrl) {
                const content = getTagContent('description') || getTagContent('content');
                const match = content.match(/<img[^>]+src="([^">]+)"/);
                if (match) thumbnailUrl = match[1];
            }
            post = {
                title: getTagContent('title'),
                content: getTagContent('description') || getTagContent('content'),
                authorName: getTagContent('dc\\:creator, author > name') || 'Unknown',
                publishedDate: getTagContent('pubDate, published'),
                url: getTagContent('link') || item.querySelector('link[href]')?.getAttribute('href') || '',
                thumbnailUrl: thumbnailUrl,
                authorUri: getTagContent('author > uri') || '',
                authorImage: ''
            };
        }
        return post;
    });

    const feedUrl = xmlDoc.querySelector('channel > link, feed > link[rel="alternate"]')?.getAttribute('href') 
                  || xmlDoc.querySelector('channel > link, feed > link[rel="alternate"]')?.textContent 
                  || '';
    return { posts: standardPosts, totalResults: items.length, feedUrl };
}

/**
 * Maps the raw response from the Blogger JSON feed to a standardized internal format.
 * This abstraction allows the rendering functions to be data-source agnostic.
 * @param {object} bloggerResponse The raw JSON object from the Blogger API.
 * @returns {{posts: Array<object>, totalResults: number, feedUrl: string}} A standardized data object.
 */
window._mapBloggerResponseToStandardFormat = function(bloggerResponse) {
    if (!bloggerResponse.feed || !bloggerResponse.feed.entry) {
        return { posts: [], totalResults: 0, feedUrl: '' };
    }

    const standardPosts = bloggerResponse.feed.entry.map(post => ({
        title: post.title.$t,
        content: ("content" in post) ? post.content.$t : (("summary" in post) ? post.summary.$t : ""),
        authorName: post.author[0].name.$t,
        authorUri: (post.author[0].name.$t === "Anonymous" || post.author[0].name.$t === "Unknown") ? '' : post.author[0].uri.$t,
        authorImage: post.author[0].gd$image ? post.author[0].gd$image.src : '',
        publishedDate: post.published.$t,
        url: (post.link.find(l => l.rel === 'alternate') || {}).href || '',
        thumbnailUrl: post.media$thumbnail ? post.media$thumbnail.url : ''
    }));

    const alternateLink = (bloggerResponse.feed.link.find(l => l.rel === 'alternate') || {}).href || '';

    return {
        posts: standardPosts,
        totalResults: bloggerResponse.feed.openSearch$totalResults.$t,
        feedUrl: alternateLink
    };
}


/**
 * Creates the HTML for a single post item.
 * This is a helper function for mBlocks.
 * @param {object} post The post data object from the Blogger feed.
 * @param {number} postID The index of the post in the current feed batch.
 * @param {object} config The configuration object for the block.
 * @returns {{postHTML: string, showcaseHTML: string, carouselIndicator: string}} An object containing the HTML for the post and other related components.
 */
window._createPostHtml = function(post, postID, config) {
    let postHTML = '';
    let showcaseHTML = '';
    let finalType = config.blockType; // Use a local variable for the type to avoid modifying the config object.
    if (config.blockType === BLOCK_LIST && postID > 0) {
        finalType = config.showHeader ? BLOCK_STACK : BLOCK_CARD;
    }

    const videoID = post.videoId || (post.thumbnailUrl && post.thumbnailUrl.includes("img.youtube.com") ? post.thumbnailUrl.substr(post.thumbnailUrl.indexOf("/vi/") + 4, 11) : "regular");
    const postTitle = post.title;
    const postSnippet = (config.showSnippet || config.showImage) && post.content;

    // Prepare all the data and component parts
    const parts = {
        postURL: post.url,
        videoID,
        postTitle,
        authorCode: _renderAuthor(finalType, config, post.authorName, post.authorUri),
        dateCode: _renderDate(config, post.publishedDate),
        ..._renderPostHeader(finalType, config, postTitle),
        ..._renderSnippet(finalType, config, postSnippet),
        ctaButtonCode: _renderCTA(finalType, config, postTitle),
        ..._renderImage(finalType, postID, config, {
            postSnippet, videoID, postTitle,
            thumbnailUrl: post.thumbnailUrl,
            authorImage: post.authorImage
        })
    };

    ({ postHTML, showcaseHTML } = _renderPostByType(finalType, postID, config, parts));

    // --- Carousel Indicators ---
    let carouselIndicator = '';
    if (config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) == 0)) {
        const slideIndex = postID / (config.actualColumnCount * config.blockRows);
        const activeClass = postID === 0 ? ' active' : '';
        const ariaCurrent = postID === 0 ? 'aria-current="true"' : '';
        carouselIndicator = `<button type="button" data-bs-target="#m${config.mBlockID}" data-bs-slide-to="${slideIndex}" class="bg-${config.inverseTheme}${activeClass}" ${ariaCurrent} aria-label="Slide ${slideIndex + 1}"></button>`;
    }

    return { postHTML, showcaseHTML, carouselIndicator };
}

/**
 * Dispatches to the correct block-specific rendering function.
 * @param {string} finalType The final block type.
 * @param {number} postID The index of the post.
 * @param {object} config The block configuration.
 * @param {object} parts An object containing all pre-rendered HTML component strings.
 * @returns {{postHTML: string, showcaseHTML: string}}
 */
function _renderPostByType(finalType, postID, config, parts) {
    if (finalType === BLOCK_SHOWCASE) {
        return _renderShowcasePost(postID, config, parts);
    }
    return { postHTML: _renderStandardPost(finalType, config, parts), showcaseHTML: '' };
}

/**
 * Renders the HTML for a standard post type (card, list, pancake, etc.).
 * @param {string} finalType The final block type.
 * @param {object} config The block configuration.
 * @param {object} parts An object containing all pre-rendered HTML component strings.
 * @returns {string} The complete HTML for the post article.
 */
function _renderStandardPost(finalType, config, parts) {
    const { postURL, postTitle, snippetText, videoID, videoThumbnailURL, highResImageURL, imageCode, ...contentParts } = parts;

    const textContentHTML = _renderPostContent(finalType, config, contentParts);
    const linkClasses = _getLinkWrapperClasses(finalType, config);
    const linkWrapperStart = `<a class="${linkClasses}" href="${postURL}" title="${postTitle}">`;
    const linkWrapperEnd = `</a>`;

    const articleClasses = _getArticleClasses(finalType, { postTitle, postURL, snippetText, videoID, videoThumbnailURL, highResImageURL });
    const articleStyle = finalType === BLOCK_COVER ? ` style="${config.articleHeight}"` : '';

    return `<article class="${articleClasses}"${articleStyle} role="article">
        ${linkWrapperStart}
        ${config.showImage ? imageCode : ''}
        ${textContentHTML}
        ${linkWrapperEnd}
    </article>`;
}

/**
 * Renders the HTML for a small grid item within a showcase block.
 * @param {string} finalType The final block type.
 * @param {object} config The block configuration.
 * @param {object} parts An object containing all pre-rendered HTML component strings.
 * @returns {string} The complete HTML for the post article.
 */
function _renderShowcaseGridPost(finalType, config, parts) {
    const { postURL, postTitle, snippetText, videoID, videoThumbnailURL, highResImageURL, imageCode } = parts;
    const articleClasses = _getArticleClasses(finalType, { postTitle, postURL, snippetText, videoID, videoThumbnailURL, highResImageURL });
    const articleStyle = ` style="${config.articleHeight}"`; // Showcase items can have height

    return `<article class="${articleClasses}"${articleStyle} role="article">${config.showImage ? imageCode : ''}</article>`;
}

/**
 * Renders the HTML for a showcase post.
 * @param {number} postID The index of the post.
 * @param {object} config The block configuration.
 * @param {object} parts An object containing all pre-rendered HTML component strings.
 * @returns {{postHTML: string, showcaseHTML: string}}
 */
function _renderShowcasePost(postID, config, parts) {
    // For showcase, the first post is the large feature item.
    if (postID === 0 && config.firstInstance) {
        const { postURL, postTitle, normalHeaderCode, snippetCode, ctaButtonCode, showcaseImageCode } = parts;
        const showcaseContent = config.showHeader
            ? `<div class="sContent card-img-overlay rounded-0 ${config.cornerStyle === " rounded" ? "rounded-top" : ""} mx-md-5 p-3 px-lg-5 bg-${config.dataTheme} mt-auto" style="height:fit-content;">${normalHeaderCode} ${snippetCode}</div>`
            : '';
        const cta = (config.showImage || config.callToAction !== "") ? ctaButtonCode : "";

        const showcaseHTML = `<div class="feature-image card border-0 text-center bg-${config.dataTheme} overflow-hidden rounded-0"><div class="sIframe" style="display:none;"></div>${showcaseImageCode}<a class="link-${config.inverseTheme}" href="${postURL}" title="${postTitle}">${showcaseContent}${cta}</a></div>`;
        
        // The main feature item doesn't have a separate `postHTML`.
        return { postHTML: '', showcaseHTML };
    }

    // Subsequent posts are the smaller items in the grid.
    return { postHTML: _renderShowcaseGridPost(BLOCK_SHOWCASE, config, parts), showcaseHTML: '' };
}

/**
 * Renders the author information for a post.
 * @param {string} finalType The final block type.
 * @param {object} config The block configuration.
 * @param {string} authorName The name of the author.
 * @param {string} authorUri The URI of the author.
 * @returns {string} The HTML for the author.
 */
function _renderAuthor(finalType, config, authorName, authorUri) {
    if (!config.showAuthor) return '';

    let authorCode = '';
    if (config.contentType !== "comments") {
        const authorURL = (authorName === "Anonymous" || authorName === "Unknown") ? config.siteURL : authorUri;
    }

    switch (finalType) {
        case BLOCK_QUOTE:
            authorCode = `<figcaption class="small fw-lighter">- ${authorName}</figcaption>`;
            break;
        case BLOCK_COMMENT:
            authorCode = `<span class="small text-${config.dataTheme}" rel="author">${authorName}</span>`;
            break;
    }
    return authorCode;
}

/**
 * Renders the formatted date for a post.
 * @param {object} config The block configuration.
 * @param {string} publishedDate The ISO date string.
 * @returns {string} The HTML for the date.
 */
function _renderDate(config, publishedDate) {
    if (!config.showDate) return '';
    const formattedDate = config.dateFormatter.format(new Date(publishedDate));
    return `<span class="small fw-lighter">${config.showAuthor ? ' &#8226; ' : ''} ${formattedDate}</span>`;
}

/**
 * Renders the header/title for a post.
 * @param {string} finalType The final block type.
 * @param {object} config The block configuration.
 * @param {string} postTitle The title of the post.
 * @returns {{displayHeaderCode: string, normalHeaderCode: string, commentHeaderCode: string}}
 */
function _renderPostHeader(finalType, config, postTitle) {
    let displayHeaderCode = "", normalHeaderCode = "", commentHeaderCode = "";
    if (finalType === BLOCK_QUOTE) {
        normalHeaderCode = `<svg class="float-start link-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/></svg><blockquote class="blockquote link-primary text-start mt-2 ms-4">${postTitle}</blockquote>`;
    } else if (config.showHeader) {
        displayHeaderCode = `<h3 class="display-5 mx-lg-5 ${config.lowContrast ? "opacity-50" : "opacity-75"}">${postTitle}</h3>`;
        normalHeaderCode = `<h5 class="card-title fw-normal">${postTitle}</h5>`;
        commentHeaderCode = `<span class="d-block my-2">"${postTitle}"</span>`;
    }
    return { displayHeaderCode, normalHeaderCode, commentHeaderCode };
}

/**
 * Renders the snippet for a post.
 * @param {string} finalType The final block type.
 * @param {object} config The block configuration.
 * @param {string} postSnippet The raw HTML content of the post.
 * @returns {{snippetText: string, snippetCode: string}}
 */
function _renderSnippet(finalType, config, postSnippet) {
    if (!config.showSnippet || !postSnippet) return { snippetText: '', snippetCode: '' };

    const doc = new DOMParser().parseFromString(postSnippet, 'text/html');
    let snippetText = doc.body.textContent || "";
    if (snippetText.length > config.snippetSize) snippetText = snippetText.substring(0, config.snippetSize) + "...";
    
    const snippetCode = `<summary class="list-unstyled ${config.dataTheme == "light" ? 'text-muted' : 'opacity-75'} ${finalType == BLOCK_COVER ? 'py-3 d-block mx-lg-5' : ''} ${config.lowContrast ? 'opacity-75' : ''}">${snippetText}</summary>`;
    return { snippetText, snippetCode };
}

/**
 * Renders the image for a post.
 * @param {string} finalType The final block type.
 * @param {number} postID The index of the post.
 * @param {object} config The block configuration.
 * @param {object} data Post-specific data for images.
 * @returns {{imageCode: string, showcaseImageCode: string, videoThumbnailURL: string, highResImageURL: string}}
 */
function _renderImage(finalType, postID, config, data) {
    if (!config.showImage) return { imageCode: '', showcaseImageCode: '', videoThumbnailURL: '', highResImageURL: '' };

    const { postSnippet, videoID, postTitle, thumbnailUrl, authorImage } = data;
    let videoThumbnailURL = thumbnailUrl || "";
    let imageURL = videoThumbnailURL;

    if (!imageURL) {
        if (config.contentType == 'comments') {
            imageURL = authorImage;
        } else {
            const contentParser = new DOMParser().parseFromString(postSnippet || "", 'text/html');
            const firstImage = contentParser.querySelector("img");
            imageURL = firstImage ? firstImage.getAttribute("src") : noImg;
        }
    }
    if (!videoThumbnailURL) videoThumbnailURL = imageURL;

    let highResImageURL = imageURL.includes('/s72-c') ? imageURL.replace('/s72-c', '/s1600') : imageURL;
    highResImageURL = highResImageURL.includes('/w640-h424') ? highResImageURL.replace('/w640-h424', '/s1600') : highResImageURL;

    let imageCoverStyle = "object-fit:cover;height:100%!important;",
        imageBSClass = ' w-100 img-fluid',
        fixedImageStyle = ` background:url(${highResImageURL}) fixed center center;background-size:cover;`,
        tooltipAttributes = ``;
    let showcaseImageCode = '';

    switch (finalType) {
        case BLOCK_SHOWCASE:
            tooltipAttributes = `" data-toggle="tooltip" data-vidid="${videoID}"`;
            if (postID === 0) {
                showcaseImageCode = `<figure class="m-0${imageBSClass}${config.cornerStyle == " rounded" ? ' rounded-5 rounded-bottom' : config.cornerStyle} m-blox-image-to-load" data-bg-src="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" title="${postTitle}" aria-label="${postTitle} image"${tooltipAttributes}></figure>`;
            }
            imageBSClass += `${config.aspectRatio} shadow-sm`;
            break;
        case BLOCK_PANCAKE: imageBSClass = config.aspectRatio; break;
        case BLOCK_COMMENT:
            imageCoverStyle += ' height:3rem!important;width:3rem;';
            fixedImageStyle += ' height:3rem!important;width:3rem;';
            imageBSClass = ' rounded-circle m-2';
            break;
        case BLOCK_QUOTE:
            imageCoverStyle += ' height:6rem!important;width:6rem;';
            fixedImageStyle += ' height:6rem!important;width:6rem;';
            imageBSClass = ' rounded-circle mx-auto mt-3';
            break;
        case BLOCK_STACK: imageBSClass = " col-4 h-100"; break;
        case BLOCK_COVER: fixedImageStyle += config.articleHeight; break;
    }
    if (config.blurImage && config.contentType !== "comments") imageBSClass += ' blur-5';

    const placeholderSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const imageCode = config.isImageFixed
        ? `<figure class="m-0${imageBSClass} m-blox-image-to-load" data-bg-src="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" aria-label="${postTitle} image"${tooltipAttributes}></figure>`
        : `<img class="${imageBSClass} m-blox-image-to-load" style="${imageCoverStyle}" src="${placeholderSrc}" data-img-src="${highResImageURL}" alt="${postTitle} image" loading="lazy" title="${postTitle}" ${tooltipAttributes}/>`;

    return { imageCode, showcaseImageCode, videoThumbnailURL, highResImageURL };
}

/**
 * Renders the Call To Action button for a post.
 * @param {string} finalType The final block type.
 * @param {object} config The block configuration.
 * @param {string} postTitle The title of the post.
 * @returns {string} The HTML for the CTA button.
 */
function _renderCTA(finalType, config, postTitle) {
    if (config.callToAction === "") return '';

    switch (finalType) {
        case BLOCK_GALLERY: return '';
        case BLOCK_COMMENT: return `<span class="link-${config.dataTheme} small">${config.callToAction}</span>`;
        default:
            let ctaClasses = `btn ${((config.cornerStyle != " rounded" || finalType == BLOCK_PANCAKE || finalType == BLOCK_QUOTE) ? 'rounded-0' : '')} ${(config.lowContrast ? "opacity-50" : "opacity-75")}`;
            switch (finalType) {
                case BLOCK_SHOWCASE: ctaClasses += " p-3 px-lg-5 float-end"; break;
                case BLOCK_COVER: ctaClasses += ' p-2 px-4 mx-lg-5 mt-4'; break;
                case BLOCK_PANCAKE: case BLOCK_QUOTE: ctaClasses += ` py-2 px-3 w-100 text-end link-${config.inverseTheme}`; break;
                case BLOCK_STACK: ctaClasses += ' mt-3'; break;
                case BLOCK_CARD: case BLOCK_LIST: ctaClasses += ' bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto'; break;
            }
            ctaClasses += ` border-0 btn-${config.dataTheme}`;
            return `<button class="${ctaClasses}" role="button" title="${postTitle}">${config.callToAction}</button>`;
    }
}

/**
 * Builds the class string for the main link wrapper of a post.
 * @param {string} finalType The final block type for the post.
 * @param {object} config The configuration object for the block.
 * @returns {string} The complete class string for the link wrapper.
 */
function _getLinkWrapperClasses(finalType, config) {
    const classes = ['overflow-hidden', 'w-100', 'shadow-sm'];

    classes.push(finalType !== BLOCK_COVER ? config.cornerStyle : 'rounded-0');
    classes.push(finalType !== BLOCK_COMMENT ? 'card' : `text-bg-${config.inverseTheme}`);
    classes.push(config.hasRoundedBorder ? `border border-3 border-opacity-75 border-${config.dataTheme}` : 'border-0');

    switch (finalType) {
        case BLOCK_QUOTE:
        case BLOCK_COVER:
            classes.push('text-center', 'h-100');
            break;
        case BLOCK_STACK:
        case BLOCK_COMMENT:
            classes.push('row', 'g-0');
            break;
        case BLOCK_LIST:
            classes.push(config.aspectRatio.trim(), `mt-${config.gutterSize}`);
            break;
        case BLOCK_CARD:
        case BLOCK_GALLERY:
            classes.push(config.aspectRatio.trim());
            break;
    }

    return classes.join(' ');
}

/**
 * Builds the class string for the <article> element.
 * @param {string} finalType The final block type for the post.
 * @param {object} postData An object containing post-specific data for showcase attributes.
 * @returns {string} The complete class string for the article element.
 */
function _getArticleClasses(finalType, postData) {
    if (finalType === BLOCK_SHOWCASE) {
        const { postTitle, postURL, snippetText, videoID, videoThumbnailURL, highResImageURL } = postData;
        return `col d-inline-flex sPost" data-title="${postTitle}" data-link="${postURL}" data-summary="${snippetText}" data-vidid="${videoID}" data-img="${videoThumbnailURL}" data-img-high="${highResImageURL}" data-toggle="tooltip"`;
    }
    return 'col d-inline-flex';
}

/**
 * Renders the inner text content of a post.
 * @param {string} finalType The final block type for the post.
 * @param {object} config The configuration object for the block.
 * @param {object} contentParts An object containing pre-built HTML strings for content.
 * @returns {string} The HTML string for the post's text content.
 */
function _renderPostContent(finalType, config, contentParts) {
    if (!config.showHeader || finalType === BLOCK_SHOWCASE || finalType === BLOCK_GALLERY) {
        return '';
    }

    const { authorCode, dateCode, displayHeaderCode, commentHeaderCode, normalHeaderCode, snippetCode, ctaButtonCode } = contentParts;
    let textContentHTML = '';

    switch (finalType) {
        case BLOCK_COMMENT: textContentHTML += `<div class="col p-2 ps-0">`; break;
        case BLOCK_STACK: config.showImage && (textContentHTML += '<div class="col-8 h-100">');
        case BLOCK_PANCAKE: case BLOCK_QUOTE: textContentHTML += `<div class="card-body${(config.dataTheme != "light" && (finalType == BLOCK_PANCAKE || (config.blockType == BLOCK_LIST && finalType == BLOCK_STACK)) ? ` h-100 bg-opacity-75 text-bg-${config.dataTheme}` : ` text-${config.inverseTheme}`)}">`;
            break;
        case BLOCK_LIST: textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>`;
        case BLOCK_CARD: textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 rounded-0 p-5`;
            switch (config.textVerticalAlign) {
                case "top": textContentHTML += ' h-auto">'; break;
                case "middle": textContentHTML += ' h-auto top-50 translate-middle-y">'; break;
                case "bottom": textContentHTML += ' h-auto bottom-0" style="top:auto;">'; break;
                case "overlay": textContentHTML += '">'; break;
            }
            break;
        case BLOCK_COVER: finalType == BLOCK_COVER && (textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ${((config.cornerStyle == " rounded" && config.textVerticalAlign != "overlay") ? ' rounded-5' : config.cornerStyle)} start-50 translate-middle`);
            switch (config.textVerticalAlign) {
                case "top": textContentHTML += '-x mt-5">'; break;
                case "middle": textContentHTML += ' top-50">'; break;
                case "bottom": textContentHTML += '-x  bottom-0 mb-5">'; break;
                case "overlay": textContentHTML += ' top-50 h-100 w-100">'; break;
            }
    }

    textContentHTML += `${authorCode}${dateCode}`;
    if (finalType === BLOCK_COVER) textContentHTML += displayHeaderCode; else if (finalType === BLOCK_COMMENT) textContentHTML += commentHeaderCode; else textContentHTML += normalHeaderCode;
    textContentHTML += snippetCode;
    if (finalType !== BLOCK_PANCAKE && finalType !== BLOCK_QUOTE) {
        textContentHTML += ctaButtonCode; // CTA
    }
    textContentHTML += `</div>`;
    if (finalType === BLOCK_STACK && config.showImage) textContentHTML += `</div>`;
    if (finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) textContentHTML += ctaButtonCode; // CTA for card-footer style

    return textContentHTML;
}

/**
 * Creates the HTML for the main block header (title and description).
 * @param {object} config The configuration object for the block.
 * @returns {string} The HTML string for the block header, or an empty string if no title is provided.
 */
window._createBlockHeader = function(config) {
    if (!config.dataTitle) {
        return '';
    }

    const descriptionHTML = config.dataDescription ? `<span class="pb-3 text-black-50">${config.dataDescription}</span>` : '';
    const titleClasses = `display-5 fw-bold text-${config.inverseTheme} py-3 m-0 ${config.lowContrast ? "opacity-50" : ""}`;

    return `<div class="text-center m-0 bg-${config.dataTheme} py-5">
                <h4 class="${titleClasses}">${config.dataTitle}</h4>
                ${descriptionHTML}
            </div>`;
}

/**
 * Creates the HTML for the block footer, which typically contains a "View All" link.
 * @param {object} config The configuration object for the block.
 * @param {object} response The JSON response object from the Blogger feed.
 * @returns {string} The HTML string for the block footer.
 */
window._createBlockFooter = function(config, response) {
    if (config.moreText === "" && config.blockType === BLOCK_COVER) {
        return '';
    }

    let moreLinkHTML = '';
    if (config.moreText !== "") {
        if (response.feedUrl) {
            const linkClasses = `text-bg-${config.dataTheme} border-0 ${config.lowContrast ? "opacity-50" : "opacity-75"}`;
            moreLinkHTML = `<a class="${linkClasses}" href="${response.feedUrl}?&max-results=12" title="Click for More">
                                  ${config.moreText} <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
                                </a>`;
        }
    }

    return `<nav aria-label="Page navigation" class="st${config.stageID} w-100 pe-5 py-5 pagination justify-content-end bg-${config.dataTheme}">
                ${moreLinkHTML}
            </nav>`;
}

/**
 * Creates the HTML for carousel control buttons (previous/next).
 * @param {object} config The configuration object for the block.
 * @returns {{prev: string, next: string}} An object containing the HTML for the previous and next buttons.
 */
window._createCarouselControls = function(config) {
    const prevClass = `carousel-control-prev link-secondary${config.containsNavigation ? " nav-prev" : " pb-5"}`;
    const nextClass = `carousel-control-next link-secondary${config.containsNavigation ? " nav-next" : " pb-5"}`;
    const target = `#m${config.mBlockID}`;

    const prev = `<button class="${prevClass}" type="button" title="Click for Previous" data-bs-target="${target}" data-bs-slide="prev" style="width:5%;">
                    <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg>
                    <span class="visually-hidden">Previous</span>
                  </button>`;
    const next = `<button class="${nextClass}" title="Click for Next" type="button" data-bs-target="${target}" data-bs-slide="next" style="width:5%;">
                    <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
                    <span class="visually-hidden">Next</span>
                  </button>`;
    return { prev, next };
}

/**
 * Fades in an element.
 * @param {HTMLElement | null} el The element to fade in.
 */
window.fadeIn = function(el) {
    if (!el) return;
    el.style.opacity = 0;
    // Use a more generic display value; 'block' can break layouts for inline-flex, etc.
    // We assume the element's default display is appropriate.
    el.style.display = ''; 

    (function fade() {
        let val = parseFloat(el.style.opacity);
        // Check if the animation should continue
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

/**
 * Fades out an element.
 * @param {HTMLElement | null} el The element to fade out.
 */
window.fadeOut = function(el) {
    if (!el) return;
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

/**
 * Binds click events for the showcase block type.
 * @param {HTMLElement} rawElement The main block element.
 * @param {object} config The configuration object for the block.
 */
window._bindShowcaseEvents = function(rawElement, config) {
    const featuredImageNode = rawElement.querySelector('.feature-image');
    const contentWrapper = rawElement.querySelector('.sFeature'); // The wrapper for the smaller items

    if (!featuredImageNode) return;

    const figureNode = featuredImageNode.querySelector('figure');
    const iFrameNode = featuredImageNode.querySelector('.sIframe');
    const contentNode = featuredImageNode.querySelector('.sContent');

    // Event listener for the main feature image (to play video)
    if (figureNode) {
        figureNode.addEventListener('click', function() {
            const clickedVideoID = this.getAttribute('data-vidid');
            if (clickedVideoID !== "regular") {
                if (iFrameNode) iFrameNode.innerHTML = `<iframe src="https://www.youtube.com/embed/${clickedVideoID}?autoplay=1" allowfullscreen="" style="${config.articleHeight}width:100%;" frameborder="0"></iframe>`;
                fadeIn(iFrameNode);
                fadeOut(figureNode);
                if (contentNode) fadeOut(contentNode);
            }
        }, { once: true }); // Use 'once' to prevent re-binding if the script runs again
    }

    // Use a single delegated event listener on the container.
    // This is more performant and works correctly with carousel-cloned items.
    if (contentWrapper) {
        contentWrapper.addEventListener('click', function(event) {
            const clickedPost = event.target.closest('.sPost');
            if (!clickedPost) return; // Click was not on a showcase item

            const videoID = clickedPost.getAttribute('data-vidid');
            const postTitle = clickedPost.getAttribute('data-title');
            const postSummary = clickedPost.getAttribute('data-summary');
            const postLink = clickedPost.getAttribute('data-link');
            const highResImg = clickedPost.getAttribute('data-img-high');

            // --- Update the main feature image ---
            if (figureNode) {
                let playIcon = figureNode.querySelector('svg');
                if (videoID && videoID !== 'regular') {
                    if (!playIcon) {
                        figureNode.insertAdjacentHTML('beforeend', `<svg class="position-absolute top-50 start-50 translate-middle" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>`);
                    } else if (playIcon.style.display === 'none') {
                        fadeIn(playIcon);
                    }
                } else if (playIcon) {
                    fadeOut(playIcon);
                }
                figureNode.setAttribute('data-vidid', videoID);
                figureNode.style.backgroundImage = `url(${highResImg})`;
                figureNode.style.backgroundSize = 'cover';
            }

            // --- Reset any playing video and show the figure ---
            fadeOut(iFrameNode);
            fadeIn(figureNode);

            // --- Update the content overlay ---
            if (contentNode) {
                fadeIn(contentNode);
                const h5 = contentNode.querySelector('h5');
                if (h5) h5.textContent = postTitle;
                const summary = contentNode.querySelector('summary');
                if (summary) summary.textContent = postSummary;
            }

            // --- Update the main link and button ---
            const link = featuredImageNode.querySelector('a');
            if (link) {
                link.href = postLink;
                link.title = postTitle;
            }
            const button = featuredImageNode.querySelector('button');
            if (button) button.title = postTitle;
        });
    }
}

/**
 * Binds click events for simple pagination (non-carousel next/previous).
 * @param {HTMLElement} rawElement The main block element.
 */
window._bindPaginationEvents = function(rawElement) {
    const prevButton = rawElement.querySelector(".nav-prev");
    if (prevButton) {
        const prevNav = function() {
            const currentStage = rawElement.getAttribute("data-s");
            rawElement.setAttribute("data-s", +currentStage - 1);
            fadeOut(rawElement.querySelector(".st" + currentStage));
            fadeIn(rawElement.querySelector(".st" + (+currentStage - 1)));
            prevButton.removeEventListener('click', prevNav); // Unbind to prevent multiple clicks
        };
        prevButton.addEventListener('click', prevNav);
    }

    const nextButton = rawElement.querySelector(".nav-next");
    if (nextButton) {
        const nextNav = function() {
            const currentStage = rawElement.getAttribute("data-s");
            rawElement.setAttribute("data-s", +currentStage + 1);
            fadeOut(rawElement.querySelector(".st" + currentStage));
            const nextStageEl = rawElement.querySelector(".st" + (+currentStage + 1));
            if (nextStageEl) {
                fadeIn(nextStageEl);
            } else {
                // If the next stage doesn't exist in the DOM, fetch it.
                mBlocks(rawElement);
            }
            nextButton.removeEventListener('click', nextNav); // Unbind
        };
        nextButton.addEventListener('click', nextNav);
    }
}

/**
 * Loads optimally sized images for all placeholders within a given element.
 * It measures the container and requests an image from Blogger's server
 * that is appropriately sized for the container, saving bandwidth.
 * @param {HTMLElement} rawElement The parent element containing image placeholders.
 */
window._loadOptimalImages = function(rawElement) {
    const imagePlaceholders = rawElement.querySelectorAll('.m-blox-image-to-load');

    imagePlaceholders.forEach(el => {
        const isBg = el.hasAttribute('data-bg-src');
        const isFixed = el.getAttribute('data-is-fixed') === 'true';
        const highResUrl = isBg ? el.getAttribute('data-bg-src') : el.getAttribute('data-img-src');

        if (!highResUrl || !highResUrl.includes('/s1600')) {
            // Not a resizable Blogger image, just load it directly.
            if (isBg) {
                el.style.backgroundImage = `url(${highResUrl})`;
                if (isFixed) {
                    el.style.backgroundAttachment = 'fixed';
                    el.style.backgroundPosition = 'center center';
                    el.style.backgroundSize = 'cover';
                }
            } else {
                el.src = highResUrl;
            }
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        let requiredWidth;

        if (isFixed) {
            // For fixed images, resolution is based on the viewport width.
            requiredWidth = window.innerWidth * dpr;
        } else {
            // For other images, it's based on the container's measured width.
            requiredWidth = el.getBoundingClientRect().width * dpr;
        }

        // Round up to the nearest 100, but not less than 100, and not more than 1600.
        const optimalSize = Math.min(1600, Math.max(100, Math.ceil(requiredWidth / 100) * 100));
        const optimalUrl = highResUrl.replace('/s1600', `/s${optimalSize}`);

        if (isBg) { 
            el.style.backgroundImage = `url(${optimalUrl})`;
            if (isFixed) {
                el.style.backgroundAttachment = 'fixed';
                el.style.backgroundPosition = 'center center';
                el.style.backgroundSize = 'cover';
            }
        }
        else { el.src = optimalUrl; }
    });
}

/**
 * Applies default configuration values based on block type and other settings.
 * This separates default logic from the initial parsing of attributes.
 * @param {object} config The partially parsed configuration object.
 * @returns {object} The configuration object with defaults applied.
 */
function _applyDefaultConfig(config) {
    // Determine the height of the section, with specific defaults for cover and showcase types.
    if (!config.sectionHeight) {
        if (config.blockType === BLOCK_COVER) config.sectionHeight = "100vh";
        else if (config.blockType === BLOCK_SHOWCASE) config.sectionHeight = "70vh";
        else config.sectionHeight = "m";
    }
    config.articleHeight = config.sectionHeight === 'm' ? '' : `height:${config.sectionHeight}!important;`;

    // Determine if the image should be blurred.
    if (config.blurImage === null) {
        // Default behavior: Blur image if header is present, except for specific block types
        const excludedBlurTypes = [BLOCK_SHOWCASE, BLOCK_LIST, BLOCK_STACK, BLOCK_PANCAKE, BLOCK_QUOTE];
        config.blurImage = config.showHeader && !excludedBlurTypes.includes(config.blockType);
    }

    // Determine the vertical alignment of text.
    if (!config.textVerticalAlign) {
        if (config.blockType === 'v') config.textVerticalAlign = "middle";
        else if (config.blockType === 'l') config.textVerticalAlign = "bottom";
        else config.textVerticalAlign = 'overlay';
    }

    // Set default column count if not specified.
    if (config.columnCount === null) {
        config.columnCount = DEFAULT_COLUMN_COUNTS[config.blockType] || 3;
    }

    return config;
}

/**
 * Parses the data attributes of a block element to create a configuration object.
 * @param {HTMLElement} rawElement The block element to parse.
 * @returns {object} A complete configuration object for the block.
 */
window._parseBlockConfig = function(rawElement) {
    const dataLabel = rawElement.getAttribute("data-label") || "Label Name missing", // Blogger label to fetch posts from
        contentType = (rawElement.getAttribute("data-contentType") || "recent").toLowerCase(),// Type of content: 'recent', 'comments', or a specific label
        siteURL = rawElement.getAttribute("data-feed") || "/",// Blogspot site URL (e.g., "https://myblog.blogspot.com/")
        dataTitle = rawElement.getAttribute("data-title") || "", // Optional title for the block
        dataDescription = rawElement.getAttribute("data-description") || "", // Optional description for the block
        dataType = (rawElement.getAttribute("data-type") || "v-ih").toLowerCase(), // Combined type and component string (e.g., "s-ihs")
        blockType = dataType.substring(0, 1), // The base layout type (v, s, l, c, etc.)
        componentList = dataType.substring(1), // The components to display (i, h, s, a, d) 
        dataTheme = (rawElement.getAttribute("data-theme") || "light").toLowerCase(),// Color theme [light, dark, primary, secondary]
        showHeader = componentList.includes("h"), // 'h' for heading/title
        showImage = componentList.includes("i"), // 'i' for image
        showSnippet = componentList.includes("s"), // 's' for snippet
        showAuthor = componentList.includes("a"), // 'a' for author
        showDate = componentList.includes("d"); // 'd' for date

    // --- Pagination and Identity ---
    const stageID = rawElement.getAttribute("data-s") || 1; // For paginated navigation, tracks the current page/stage
    const firstInstance = !rawElement.hasAttribute("data-s"); // Is this the first time the block is being loaded?
    const postsPerBlock = parseInt(rawElement.getAttribute("data-posts") || 3, 10); // Number of posts to fetch

    const inverseTheme = (dataTheme == "light" ? "primary" : "light");// Inverse theme for contrast
    let textVerticalAlign = (rawElement.getAttribute("data-textVAlign") || "").toLowerCase();
    if (!textVerticalAlign) {
        if (blockType === 'v') textVerticalAlign = "middle";
        else if (blockType === 'l') textVerticalAlign = "bottom";
        else textVerticalAlign = 'overlay';
    }

    const dataBlur = (rawElement.getAttribute("data-iBlur") || "").toLowerCase();
    const widget = rawElement.closest(".widget");
    const mBlockID = widget ? widget.getAttribute("ID") : (dataTitle + dataType + dataLabel); // Unique ID for the block, used for carousel targeting.

    // Create the date formatter once, outside the loop, for efficiency.
    const dateFormatter = showDate ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short', // Use 'short' to match original format (e.g., "Oct")
        day: 'numeric'
    }) : null;

    let config = {
        // Base attributes
        dataLabel, contentType, siteURL, dataTitle, dataDescription, blockType, dataTheme,
        // Component visibility
        showHeader, showImage, showSnippet, showAuthor, showDate,
        // Layout & Style
        columnCount: rawElement.getAttribute("data-cols"), // Will be parsed to int later
        blockRows: parseInt(rawElement.getAttribute("data-rows") || "1", 10),
        isCarousel: (rawElement.getAttribute("data-isCarousel") || "").toLowerCase() == "true",
        sectionHeight: rawElement.getAttribute("data-iHeight"),
        articleHeight: '', // Will be set in _applyDefaultConfig
        blurImage: dataBlur === "true" ? true : (dataBlur === "false" ? false : null),
        inverseTheme,
        textVerticalAlign: (rawElement.getAttribute("data-textVAlign") || "").toLowerCase(),
        cornerStyle: ((rawElement.getAttribute("data-corner") || "").toLowerCase() == "sharp") ? " rounded-0" : " rounded",
        aspectRatio: ` ratio ratio-${(rawElement.getAttribute("data-ar") || "1x1").toLowerCase()}`,
        gutterSize: rawElement.getAttribute("data-gutter") || ((blockType == "v") ? 0 : 3),
        isImageFixed: (rawElement.getAttribute("data-iFix") || "").toLowerCase() == "true",
        lowContrast: (rawElement.getAttribute("data-lowContrast") || "").toLowerCase() == "true",
        hasRoundedBorder: (rawElement.getAttribute("data-iBorder") || "").toLowerCase() == "true",
        // Content & Text
        snippetSize: rawElement.getAttribute("data-snippetSize") || 150,
        callToAction: rawElement.getAttribute("data-CTAText") || "",
        moreText: rawElement.getAttribute("data-moreText") || "",
        // State & Identity
        stageID,
        firstInstance,
        postsPerBlock,
        mBlockID,
        dateFormatter,
        // Initial empty/default values
        containsNavigation: false,
        actualColumnCount: 0,
    };

    return _applyDefaultConfig(config);
}

/**
 * Calculates responsive columns and determines carousel/navigation behavior.
 * @param {object} config The block's configuration object.
 * @param {number} postsInFeed The number of posts returned from the feed.
 * @returns {object} The updated configuration object.
 */
window._calculateLayout = function(config, postsInFeed) {
    // Use a mutable copy to avoid directly modifying the original object passed in.
    let newConfig = { ...config };

    newConfig.columnCount = parseInt(newConfig.columnCount, 10);

    // Disable carousel for single-post blocks or list-style blocks
    if (newConfig.postsPerBlock <= 1 || newConfig.blockType === BLOCK_LIST) {
        newConfig.isCarousel = false;
    }

    // Adjusts the number of visible columns in a carousel based on screen width for responsiveness.
    if (newConfig.isCarousel) {
        const windowInnerWidth = window.innerWidth;
        if (windowInnerWidth < 576) { newConfig.actualColumnCount = newConfig.columnCount < 5 ? 1 : (newConfig.columnCount === 5 ? 2 : 3); }
        else if (windowInnerWidth < 768) { newConfig.actualColumnCount = newConfig.columnCount < 4 ? 1 : (newConfig.columnCount === 4 ? 2 : (newConfig.columnCount === 5 ? 3 : 4)); }
        else if (windowInnerWidth < 992) { newConfig.actualColumnCount = newConfig.columnCount === 3 ? 2 : (newConfig.columnCount === 4 ? 3 : 4); }
        else if (windowInnerWidth < 1200) { newConfig.actualColumnCount = newConfig.columnCount > 4 ? (newConfig.columnCount === 5 ? 4 : 5) : newConfig.columnCount; }
        else { newConfig.actualColumnCount = newConfig.columnCount; }

        // If there aren't enough posts to fill a slide, disable the carousel and enable simple next/prev navigation instead.
        if (newConfig.blockRows > Math.ceil(postsInFeed / newConfig.actualColumnCount)) newConfig.blockRows = Math.ceil(postsInFeed / newConfig.actualColumnCount);
        if (postsInFeed <= (newConfig.actualColumnCount * newConfig.blockRows)) {
            newConfig.isCarousel = false;
            newConfig.containsNavigation = true;
        }
    }
    return newConfig;
}

/**
 * Builds the HTML for all posts in the feed.
 * @param {object} response The full response from the data feed.
 * @param {object} config The block's configuration object.
 * @returns {{blockBody: string, carouselIndicators: HTMLElement | null, showcaseHTML: string}}
 */
window._buildBlockBody = function(response, config) {
    let blockBody = '';
    let showcaseHTML = '';
    let carouselIndicators = null;
    const postsInFeed = response.posts.length;
    const isComplexLayout = (config.blockType === BLOCK_LIST || config.blockType === BLOCK_SHOWCASE);
    
    if (config.isCarousel) {
        carouselIndicators = document.createElement("div");
        carouselIndicators.classList.add('carousel-indicators');
        if (config.blockType !== BLOCK_COVER) carouselIndicators.classList.add('position-relative', 'm-0');
    }

    // Handle the main showcase item separately, outside the loop.
    if (config.blockType === BLOCK_SHOWCASE && config.firstInstance && postsInFeed > 0) {
        const { showcaseHTML: singleShowcaseHTML } = window._createPostHtml(response.posts[0], 0, config);
        showcaseHTML = singleShowcaseHTML;
    }

    for (let postID = 0; postID < postsInFeed; postID++) {
        // For showcase, the first post is already handled, so we skip it in the main loop.
        if (config.blockType === BLOCK_SHOWCASE && postID === 0) continue;

        const post = response.posts[postID];
        let currentColumnCount = config.columnCount;

        // Side effect removal: Handle column count change for 'list' type here.
        if (config.blockType === BLOCK_LIST && postID === 1 && config.showHeader) { // This logic is correct as is.
            currentColumnCount--;
        }

        const { postHTML, showcaseHTML: singleShowcaseHTML, carouselIndicator } = window._createPostHtml(post, postID, config);

        if (carouselIndicator && config.isCarousel) {
            // Adjust slide index for showcase since its loop starts from 1
            const adjustedIndicator = config.blockType === BLOCK_SHOWCASE ? carouselIndicator.replace('data-bs-slide-to="0"', 'data-bs-slide-to="1"') : carouselIndicator;
            carouselIndicators.insertAdjacentHTML('beforeend', adjustedIndicator);
        }

        // Creates a new row/carousel-item wrapper when needed.
        const isFirstItemInLoop = (config.blockType === BLOCK_SHOWCASE) ? postID === 1 : postID === 0;
        const startNewRow = isFirstItemInLoop || (config.isCarousel && postID % (config.actualColumnCount * config.blockRows) === 0) || (config.blockType === BLOCK_LIST && postID === 1);

        if (startNewRow) {
            blockBody += `<div class="row g-${config.gutterSize} mx-0`;
            if (config.isCarousel) { blockBody += ' carousel-item' + (postID === 0 ? ' active' : ''); }
            if (isComplexLayout && config.blockType === BLOCK_LIST) { blockBody += ' col flex-grow-1'; }
            if (config.blockType !== BLOCK_COVER) {
                blockBody += ' px-2 px-sm-3 px-md-4 px-lg-5';
            }
            blockBody += ` ${RESPONSIVE_GRID_CLASSES[currentColumnCount] || RESPONSIVE_GRID_CLASSES[6]}">`;
        }

        blockBody += postHTML;
        // Close the row/carousel-item div at the end of a slide or at the last post.
        const isLastItemInSlide = config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) === (config.actualColumnCount * config.blockRows - 1));
        const isLastPostOverall = postID === (postsInFeed - 1);
        if (isLastPostOverall || isLastItemInSlide) {
            blockBody += `</div>`; // close .row
        }
    }

    return { blockBody, carouselIndicators, showcaseHTML };
}

/**
 * Data provider for WordPress REST API feeds.
 */
class WordPressProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Builds the appropriate WordPress REST API URL.
     * @returns {string} The final API URL.
     */
    _buildFeedUrl() {
        // The base URL for the WordPress API endpoint.
        let baseUrl = this.config.siteURL;

        // Ensure the base URL has a trailing slash.
        baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        
        // If the user provides the full path to /posts, don't append it again.
        if (!baseUrl.endsWith('/posts/')) {
            baseUrl += 'wp/v2/posts/';
        }
        let apiUrl = `${baseUrl}?_embed&per_page=${this.config.postsPerBlock}&page=${this.config.stageID}`;

        // In WordPress, 'label' is equivalent to 'category'.
        // This requires an extra fetch to get the category ID from the slug (label name).
        // For simplicity in this implementation, we'll assume the user provides a category ID in data-label.
        if (this.config.contentType === 'label' && !isNaN(parseInt(this.config.dataLabel, 10))) {
            apiUrl += `&categories=${this.config.dataLabel}`;
        }
        
        // Note: WordPress 'comments' are a separate endpoint (`/wp/v2/comments`) and would require
        // different mapping. For now, we only support posts.

        // Prepend a different CORS proxy to the API URL. Some servers block specific proxies,
        // so switching can resolve DNS or 403 Forbidden errors.
        return `https://api.codetabs.com/v1/proxy?quest=${apiUrl}`;
    }

    /**
     * Fetches and transforms data from the WordPress REST API.
     * @returns {Promise<object>} A promise that resolves with the standardized data object.
     */
    async fetch() {
        const url = this._buildFeedUrl();
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`WordPress API request failed: ${response.statusText}`);
        }
        const rawData = await response.json();
        return window._mapWordPressResponseToStandardFormat(rawData, response.headers);
    }
}

/**
 * Data provider for generic RSS/XML feeds.
 */
class RssProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Builds the feed URL, wrapping it in a CORS proxy.
     * @returns {string} The final proxied feed URL.
     */
    _buildFeedUrl() {
        // For RSS, the siteURL is the direct feed URL.
        const feedUrl = this.config.siteURL;
        // Wrap in a CORS proxy.
        return `https://api.codetabs.com/v1/proxy?quest=${feedUrl}`;
    }

    /**
     * Fetches and transforms data from an RSS feed.
     * @returns {Promise<object>} A promise that resolves with the standardized data object.
     */
    async fetch() {
        const url = this._buildFeedUrl();
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`RSS feed request failed: ${response.statusText}`);
        }

        const xmlString = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // Check for parsing errors
        if (xmlDoc.getElementsByTagName("parsererror").length) {
            throw new Error("Failed to parse RSS feed.");
        }
        return window._mapRssResponseToStandardFormat(xmlDoc);
    }
}

/**
 * Data provider for Blogger feeds.
 */
class BloggerProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Builds the appropriate Blogger feed URL based on the block configuration.
     * @returns {string} The final feed URL.
     */
    _buildFeedUrl() {
        let feedURL = this.config.siteURL + "feeds/";
        switch (this.config.contentType) {
            case "recent":
                feedURL += "posts";
                feedURL += this.config.showImage ? "/default" : "/summary";
                break;
            case "comments":
                feedURL += "comments";
                feedURL += this.config.showImage ? "/default" : "/summary";
                break;
            default: // Assumes 'label'
                feedURL += "posts";
                feedURL += this.config.showImage ? "/default" : "/summary";
                feedURL += "/-/" + this.config.dataLabel;
        }
        feedURL += `?alt=json-in-script&start-index=${(this.config.stageID - 1) * this.config.postsPerBlock + 1}&max-results=${this.config.postsPerBlock}`;
        return feedURL;
    }

    /**
     * Fetches and transforms data from the Blogger API.
     * @returns {Promise<object>} A promise that resolves with the standardized data object.
     */
    async fetch() {
        const url = this._buildFeedUrl();
        const rawData = await window.fetchJSONP(url);
        return window._mapBloggerResponseToStandardFormat(rawData);
    }
}

/**
 * Detects the appropriate data provider based on the feed URL.
 * @param {object} config The block's configuration object.
 * @returns {BloggerProvider} An instance of the correct provider.
 */
window._getProvider = function(config) {
    const url = config.siteURL.toLowerCase();

    // Check for WordPress REST API endpoint.
    if (url.includes('/wp-json')) {
        return new WordPressProvider(config);
    }
    // Check for common RSS feed patterns.
    if (url.endsWith('.xml') || url.includes('/feed')) {
        // The RssProvider now internally handles YouTube and other RSS variations.
        return new RssProvider(config);
    }
    // Default to Blogger if no other provider matches.
    return new BloggerProvider(config);
}


/**
 * Initializes and renders dynamic content blocks based on data attributes.
 * It fetches Blogger post or comment data and displays it in various layouts.
 * @param {string|HTMLElement} blockItem A CSS selector string for the block elements or a single HTMLElement.
 */
window.mBlocks = async function(blockItem) {
    const elements = (typeof blockItem === 'string') ? document.querySelectorAll(blockItem) : [blockItem];

    for (const rawElement of elements) {
        let blockConfig = window._parseBlockConfig(rawElement);
        try {
            const provider = window._getProvider(blockConfig);
            const response = await provider.fetch();

            if (response.posts && response.posts.length > 0) {
                const postsInFeed = response.posts.length;
                const totalPostsAvailable = response.totalResults;
                const totalStages = Math.ceil(totalPostsAvailable / blockConfig.postsPerBlock); // Total pages/stages available for navigation

                if (blockConfig.contentType === "comments") {
                    blockConfig.moreText = "";
                }

                if (blockConfig.firstInstance) {
                    rawElement.setAttribute("data-s", blockConfig.stageID);

                    // --- Block Header (Title & Description) ---
                    rawElement.insertAdjacentHTML('beforeend', window._createBlockHeader(blockConfig));
                }

                blockConfig = window._calculateLayout(blockConfig, postsInFeed);

                // --- Main Content Wrapper ---
                const contentWrapper = document.createElement('div');
                contentWrapper.id = 'm' + blockConfig.mBlockID;
                rawElement.appendChild(contentWrapper);
                contentWrapper.className = `overflow-hidden bg-${blockConfig.dataTheme}${blockConfig.blockType == BLOCK_SHOWCASE ? ' sFeature' : ""}${((blockConfig.isCarousel || blockConfig.containsNavigation) ? ` st${blockConfig.stageID} carousel carousel-fade` : "")}`;
                contentWrapper.setAttribute("data-bs-ride", "carousel");

                const { blockBody, carouselIndicators, showcaseHTML } = window._buildBlockBody(response, blockConfig);

                if (showcaseHTML) {
                    contentWrapper.insertAdjacentHTML('beforebegin', showcaseHTML);
                }

                if (blockConfig.isCarousel || blockConfig.containsNavigation) {
                    let bodyWrapper = `<div class="carousel-inner">${blockBody}</div>`;
                    contentWrapper.insertAdjacentHTML('beforeend', blockBody + '</div>'); // Append and close carousel-inner
                    if (blockConfig.isCarousel) contentWrapper.appendChild(carouselIndicators);

                    // --- Carousel/Pagination Navigation ---
                    const { prev: prevButton, next: nextButton } = window._createCarouselControls(blockConfig);
                    if (blockConfig.isCarousel) contentWrapper.insertAdjacentHTML('beforeend', prevButton + nextButton);

                    if (blockConfig.containsNavigation) { if (blockConfig.stageID > 1) contentWrapper.insertAdjacentHTML('beforeend', prevButton); if (blockConfig.stageID < totalStages) contentWrapper.insertAdjacentHTML('beforeend', nextButton); }
                } else {
                    contentWrapper.insertAdjacentHTML('beforeend', blockBody);
                }

                // --- Block Footer (More Link) ---
                contentWrapper.insertAdjacentHTML('afterend', window._createBlockFooter(blockConfig, response));
            } //if
            else { // If response.posts is empty or doesn't exist
                switch (blockConfig.contentType) {
                    case "recent":
                        rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-${blockConfig.dataTheme} display-6 p-4 w-100">Sorry! No recent updates.</div>`);
                        break;
                    case "comments":
                        rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-${blockConfig.dataTheme} display-6 p-4 w-100">No comments. <br/> Start the conversation!</div>`);
                        break;
                    default:
                        rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-${blockConfig.dataTheme} display-6 p-4 w-100">Sorry! No content found for "${blockConfig.dataLabel}"!</div>`);
                }
            }
        } catch (error) {
            console.error(`mBlocks failed to initialize for element:`, rawElement, error);
            rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-danger p-4 w-100">Sorry! An error occurred while loading content.</div>`);
        } finally {
            // --- Finalization ---
            window._loadOptimalImages(rawElement);
            if (rawElement.querySelector('.nav-prev, .nav-next')) {
                window._bindPaginationEvents(rawElement);
            }

            const finalBlockType = (rawElement.getAttribute("data-type") || "v").substring(0, 1);
            if (finalBlockType === BLOCK_SHOWCASE) {
                // Delay binding to allow Bootstrap's carousel to initialize and clone items first.
                setTimeout(() => {
                    window._bindShowcaseEvents(rawElement, blockConfig);
                }, 0);
            }
        }
    } // end for...of loop
}

} // End of the guard clause `if (typeof window.mBloxInitialized === 'undefined')`