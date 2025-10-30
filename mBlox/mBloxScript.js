/*!
 * mBlox for Blogger
 * Demo @ https://mBloxForBlogger.blogspot.com/
 * Agency @ https://CIA.RealHappinessCenter.com
 * Copyright (c) 2022-2024, Mohanjeet Singh (https://Mohanjeet.blogspot.com/)
 * Released under the MIT license
 */

/**
 * Fetches data from a URL using the JSONP technique.
 * This is a lightweight, native replacement for jQuery's $.ajax with dataType: 'jsonp'.
 * @param {string} url The URL to request, which should support a JSONP callback.
 * @param {object} options Configuration for the request.
 * @param {function(object)} options.success Callback function to execute on successful data retrieval.
 * @param {function} options.complete Callback function to execute when the request finishes (either success or error).
 */
function fetchJSONP(url, options) {
    const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
    const script = document.createElement('script');

    // The URL already has query params, so we append the callback.
    script.src = `${url}&callback=${callbackName}`;

    window[callbackName] = function(data) {
        // Cleanup the script and global callback function
        delete window[callbackName];
        document.head.removeChild(script);

        // Execute the success and complete callbacks
        if (options.success) {
            options.success(data);
        }
        if (options.complete) {
            options.complete();
        }
    };

    // Basic error handling
    script.onerror = function() {
        delete window[callbackName];
        document.head.removeChild(script);
        console.error(`JSONP request to ${url} failed.`);
        if (options.complete) options.complete();
    };

    document.head.appendChild(script);
}

/**
 * Calculates the optimal image resolution based on layout and screen size.
 * This helps in requesting appropriately sized images from Blogger's servers to save bandwidth.
 * @param {boolean} isImageFixed - Whether the image is a fixed background.
 * @param {number} columnCount - The number of columns in the layout.
 * @param {number} windowInnerWidth - The width of the browser window.
 * @returns {number} The calculated image resolution, rounded up to the nearest 100.
 */
function calculateImageResolution(isImageFixed, columnCount, windowInnerWidth) {
    let resolution = 100;
    if (isImageFixed) {
        resolution = windowInnerWidth;
    } else {
        if (columnCount === 1) { resolution = windowInnerWidth; }
        else if (columnCount === 2) { resolution = windowInnerWidth < 768 ? windowInnerWidth : windowInnerWidth / 2; }
        else if (columnCount === 3) { resolution = windowInnerWidth < 768 ? windowInnerWidth : (windowInnerWidth < 992 ? windowInnerWidth / 2 : windowInnerWidth / 3); }
        else if (columnCount === 4) { resolution = windowInnerWidth < 576 ? windowInnerWidth : (windowInnerWidth < 768 ? windowInnerWidth / 2 : (windowInnerWidth < 992 ? windowInnerWidth / 3 : windowInnerWidth / 4)); }
        else if (columnCount === 5) { resolution = windowInnerWidth < 576 ? windowInnerWidth / 2 : (windowInnerWidth < 768 ? windowInnerWidth / 3 : (windowInnerWidth < 1200 ? windowInnerWidth / 4 : windowInnerWidth / 5)); }
        else if (columnCount >= 6) { resolution = windowInnerWidth < 576 ? windowInnerWidth / 3 : (windowInnerWidth < 992 ? windowInnerWidth / 4 : (windowInnerWidth < 1200 ? windowInnerWidth / 5 : windowInnerWidth / 6)); }
    }
    resolution = Math.ceil(resolution / 100) * 100;
    if (resolution < 100) resolution = 100;
    if (resolution > 1600) resolution = 1600;

    return resolution;
}

/**
 * Creates the HTML for a single post item.
 * This is a helper function for mBlocks.
 * @param {object} post The post data object from the Blogger feed.
 * @param {number} postID The index of the post in the current feed batch.
 * @param {object} config The configuration object for the block.
 * @returns {{postHTML: string, showcaseHTML: string, carouselIndicator: string}} An object containing the HTML for the post and other related components.
 */
function _createPostHtml(post, postID, config) {
    let postHTML = '';
    let showcaseHTML = '';
    let carouselIndicator = '';

    const postTitle = post.title.$t,
        postSnippet = (config.showSnippet || config.showImage) && (("content" in post) ? post.content.$t : (("summary" in post) ? post.summary.$t : ""));
    let postAuthor = post.author[0].name.$t,
        snippetText = "",
        snippetCode = "";

    // --- List Block Type Transformation ---
    // For a 'list' block, the first post (postID 0) uses the 'l' style. 
    // Subsequent posts are transformed into either 'stack' (t) or 'card' (c) style for a more complex layout.
    let finalType = config.blockType;
    if (config.blockType === config.BLOCK_TYPE_LIST && postID > 0) {
        if (config.showHeader) {
            finalType = config.BLOCK_TYPE_STACK;
            config.columnCount--;
        } else {
            finalType = config.BLOCK_TYPE_CARD;
        }
    }

    // --- Author Info ---
    let authorCode = '',
        authorURL = "";
    if (config.showAuthor) {
        if (config.contentType !== "comments") authorURL = (postAuthor === "Anonymous" || postAuthor === "Unknown") ? config.siteURL : post.author[0].uri.$t;

        // Author display varies by block type.
        switch (finalType) {
            case config.BLOCK_TYPE_QUOTE:
                authorCode = `<figcaption class="small fw-lighter">- ${postAuthor}</figcaption>`;
                break;
            case config.BLOCK_TYPE_COMMENT:
                authorCode = `<span class="small text-${config.dataTheme}" rel="author">${postAuthor}</span>`;
                break;
        }
    }

    // --- Date Formatting ---
    let dateCode = ''; // Formats the publication date.
    if (config.showDate) {
        const formattedDate = config.dateFormatter.format(new Date(post.published.$t));
        dateCode = `<span class="small fw-lighter">${config.showAuthor ? ' &#8226; ' : ''} ${formattedDate}</span>`;
    }

    // --- Title / Header ---
    let displayHeaderCode = "",
        normalHeaderCode = "",
        commentHeaderCode = "";
    if (finalType === config.BLOCK_TYPE_QUOTE) {
        normalHeaderCode = `<svg class="float-start link-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/></svg><blockquote class="blockquote link-primary text-start mt-2 ms-4">${postTitle}</blockquote>`;
    } else if (config.showHeader) {
        displayHeaderCode = `<h3 class="display-5 mx-lg-5 ${config.lowContrast ? "opacity-50" : "opacity-75"}">${postTitle}</h3>`;
        normalHeaderCode = `<h5 class="card-title fw-normal">${postTitle}</h5>`;
        commentHeaderCode = `<span class="d-block my-2">"${postTitle}"</span>`;
    }

    // --- Snippet ---
    if (config.showSnippet) {
        (snippetText = postSnippet.replace(/<\S[^>]*>/g, "")).length > 70 && (snippetText = snippetText.substring(0, config.snippetSize) + "...");
        snippetCode = `<summary class="list-unstyled ${config.dataTheme == "light" ? 'text-muted' : 'opacity-75'} ${finalType == config.BLOCK_TYPE_COVER ? 'py-3 d-block mx-lg-5' : ''} ${config.lowContrast ? 'opacity-75' : ''}">${snippetText}</summary>`;
    }

    // --- Post Link ---
    let postURL = "";
    for (let linkIndex = 0; linkIndex < post.link.length; linkIndex++)
        if ("alternate" == post.link[linkIndex].rel) {
            postURL = post.link[linkIndex].href;
            break;
        }

    // --- Image & Video Processing ---
    // Extracts image or video thumbnail from the post content.
    let imageCode = "",
        videoThumbnailURL = "",
        showcaseImageCode = ''; // This was missing
    let highResImageURL = noImg; // Declare here to ensure it's in scope
    if (config.showImage) {
        let imageURL = noImg;
        // Use DOMParser for robust HTML string parsing to find images/videos.
        const contentParser = new DOMParser().parseFromString(postSnippet || "", 'text/html');
        if (config.contentType == 'comments') {
            imageURL = post.author[0].gd$image.src;
            if (imageURL.match("blogblog.com")) imageURL = noImg;
        } else {
            // Check for YouTube embeds to get a high-quality thumbnail.
            if (postSnippet.indexOf("//www.youtube.com/embed/") > -1) {
                videoThumbnailURL = post.media$thumbnail.url;
                (-1 !== videoThumbnailURL.indexOf("img.youtube.com")) && (videoThumbnailURL = videoThumbnailURL.replace("/default.jpg", "/maxresdefault.jpg"));
            }
            if (postSnippet.indexOf("<img") > -1) {
                const firstImage = contentParser.querySelector("img");
                // Extract image URL and attempt to get a higher resolution version from Blogger's image server.
                imageURL = firstImage ? firstImage.getAttribute("src") : noImg;
                if (-1 !== imageURL.indexOf("/s72-c")) highResImageURL = imageURL.replace("/s72-c", "/s1600");
                else if (-1 !== imageURL.indexOf("/w640-h424")) highResImageURL = imageURL.replace("/w640-h424", "/s1600");
                else highResImageURL = imageURL;
                if (-1 !== highResImageURL.indexOf("/s1600")) imageURL = highResImageURL.replace("/s1600", "/s" + config.imageResolution);
            }
        }
        (videoThumbnailURL == "") && (videoThumbnailURL = imageURL);

        // Prepare image classes and styles based on block type and settings.
        let imageCoverStyle = " object-fit:cover;height:100%!important;",
            imageBSClass = ' w-100 img-fluid',
            fixedImageStyle = ' background:url(' + highResImageURL + ') fixed center center;background-size:cover;',
            tooltipAttributes = ``;
        switch (finalType) {
            case config.BLOCK_TYPE_SHOWCASE:
                const videoID = (-1 !== videoThumbnailURL.indexOf("img.youtube.com")) ? (videoThumbnailURL.substr(videoThumbnailURL.indexOf("/vi/") + 4, 11)) : "regular";
                tooltipAttributes = `" data-toggle="tooltip" data-vidid="${videoID}"`;
                if (postID === 0) {
                    showcaseImageCode = `<figure class="m-0${imageBSClass}${config.cornerStyle == " rounded" ? ' rounded-5 rounded-bottom' : config.cornerStyle}" style="${fixedImageStyle}${config.articleHeight}" role="img" loading="lazy" title="${postTitle}" aria-label="${postTitle} image"${tooltipAttributes}></figure>`;
                }
                imageBSClass += config.aspectRatio + ' shadow-sm';
                break;
            case config.BLOCK_TYPE_PANCAKE:
                imageBSClass = config.aspectRatio;
                break;
            case config.BLOCK_TYPE_COMMENT:
                imageCoverStyle += ' height:3rem!important;width:3rem;';
                fixedImageStyle += ' height:3rem!important;width:3rem;';
                imageBSClass = ' rounded-circle m-2';
                break;
            case config.BLOCK_TYPE_QUOTE:
                imageCoverStyle += ' height:6rem!important;width:6rem;';
                fixedImageStyle += ' height:6rem!important;width:6rem;';
                imageBSClass = ' rounded-circle mx-auto mt-3';
                break;
            case config.BLOCK_TYPE_STACK:
                imageBSClass = " col-4 h-100";
                break;
            case config.BLOCK_TYPE_COVER:
                fixedImageStyle += config.articleHeight;
                break;
        }
        if (config.blurImage && config.contentType !== "comments") imageBSClass += ' blur-5';

        imageCode = config.isImageFixed
            ? `<figure class="m-0${imageBSClass}" style="${fixedImageStyle}" role="img" loading="lazy" aria-label="${postTitle} image"${tooltipAttributes}></figure>`
            : `<img class="${imageBSClass}" style="${imageCoverStyle}" src="${imageURL}" alt="${postTitle} image" loading="lazy" title="${postTitle}" ${tooltipAttributes}/>`;
    } //IMAGE SETTINGS

    // --- CTA Button ---
    let ctaButtonCode = "";
    if (config.callToAction != "") {
        switch (finalType) {
            case config.BLOCK_TYPE_GALLERY:
                break;
            case config.BLOCK_TYPE_COMMENT:
                ctaButtonCode = `<span class="link-${config.dataTheme} small">${config.callToAction}</span>`;
                break;
            default:
                let ctaClasses = `btn ${((config.cornerStyle != " rounded" || finalType == config.BLOCK_TYPE_PANCAKE || finalType == config.BLOCK_TYPE_QUOTE) ? 'rounded-0' : '')} ${(config.lowContrast ? "opacity-50" : "opacity-75")}`;
                switch (finalType) {
                    case config.BLOCK_TYPE_SHOWCASE:
                        ctaClasses += " p-3 px-lg-5 float-end";
                        break;
                    case config.BLOCK_TYPE_COVER:
                        ctaClasses += ' p-2 px-4 mx-lg-5 mt-4';
                        break;
                    case config.BLOCK_TYPE_PANCAKE:
                    case config.BLOCK_TYPE_QUOTE:
                        ctaClasses += ` py-2 px-3 w-100 text-end link-${config.inverseTheme}`;
                        break;
                    case config.BLOCK_TYPE_STACK:
                        ctaClasses += ' mt-3';
                        break;
                    case config.BLOCK_TYPE_CARD:
                    case config.BLOCK_TYPE_LIST:
                        ctaClasses += ' bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto';
                        break;
                }
                ctaClasses += ` border-0 btn-${config.dataTheme}`;
                ctaButtonCode = `<button class="${ctaClasses}" role="button" title="${postTitle}">${config.callToAction}</button>`;
        }
    }

    // --- Carousel Indicators ---
    if (config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) == 0)) {
        carouselIndicator = `<button type="button" data-bs-target="#m${config.mBlockID}" data-bs-slide-to="${postID / (config.actualColumnCount * config.blockRows)}" class="bg-${config.inverseTheme}${postID == 0 ? ' active' : ''}" ${postID == 0 ? 'aria-current="true"' : ''} aria-label="Slide ${postID / (config.actualColumnCount * config.blockRows) + 1}"></button>`;
    }

    // --- Showcase Block Specific ---
    // The first post of a showcase block is handled separately to create the large featured image area.
    if (finalType === config.BLOCK_TYPE_SHOWCASE && config.firstInstance && postID === 0) {
        showcaseHTML = `<div class="feature-image card border-0 text-center bg-${config.dataTheme} overflow-hidden rounded-0"><div class="sIframe" style="display:none;"></div>${showcaseImageCode}<a class="link-${config.inverseTheme}" href="${postURL}" title="${postTitle}">${(config.showHeader ? `<div class="sContent card-img-overlay rounded-0 ${(config.cornerStyle == " rounded" ? "rounded-top" : "")} mx-md-5 p-3 px-lg-5 bg-${config.dataTheme} mt-auto" style="height:fit-content;">${normalHeaderCode} ${snippetCode}</div>` : "")}${(config.showImage || config.callToAction != "") ? ctaButtonCode : ""}</a></div>`;
    }

    // --- Article HTML Construction ---
    let videoID = "regular"; // Default videoID
    if (finalType == config.BLOCK_TYPE_SHOWCASE) videoID = (-1 !== videoThumbnailURL.indexOf("img.youtube.com")) ? (videoThumbnailURL.substr(videoThumbnailURL.indexOf("/vi/") + 4, 11)) : "regular";

    postHTML += `<article class="col d-inline-flex${(finalType == config.BLOCK_TYPE_SHOWCASE ? ` sPost" data-title="${postTitle}" data-link="${postURL}" data-summary="${snippetText}" data-vidid="${videoID}" data-img="${videoThumbnailURL}" data-img-high="${highResImageURL}" data-toggle="tooltip"` : (finalType == config.BLOCK_TYPE_COVER ? `" style="${config.articleHeight}"` : '"'))}" role="article">`;

    // Link wrapper for the entire article (except for showcase items)
    if (finalType !== config.BLOCK_TYPE_SHOWCASE) postHTML += `<a class="overflow-hidden w-100 shadow-sm${(finalType != config.BLOCK_TYPE_COVER ? config.cornerStyle : ' rounded-0')}${(finalType != config.BLOCK_TYPE_COMMENT ? ' card' : ` text-bg-${config.inverseTheme}`)}${(config.hasRoundedBorder ? ` border border-3 border-opacity-75 border-${config.dataTheme}` : ' border-0')}${((finalType == config.BLOCK_TYPE_QUOTE || finalType == config.BLOCK_TYPE_COVER) ? ' text-center h-100' : ((finalType == config.BLOCK_TYPE_STACK||finalType==config.BLOCK_TYPE_COMMENT) ? " row g-0" : ((finalType == config.BLOCK_TYPE_LIST || finalType == config.BLOCK_TYPE_CARD || finalType == config.BLOCK_TYPE_GALLERY) ? `${config.aspectRatio}${(finalType == config.BLOCK_TYPE_LIST ? ` mt-${config.gutterSize}` : '')}` : "")))}" href="${postURL}" title="${postTitle}">`;

    //IMAGE
    if (config.showImage) postHTML += imageCode; // Add image HTML if it exists

    // --- Text Content ---
    if (config.showHeader && finalType != config.BLOCK_TYPE_SHOWCASE && finalType != config.BLOCK_TYPE_GALLERY) {
        switch (finalType) {
            case config.BLOCK_TYPE_COMMENT: postHTML += `<div class="col p-2 ps-0">`; break;
                case config.BLOCK_TYPE_STACK: config.showImage && (postHTML += '<div class="col-8 h-100">');
                case config.BLOCK_TYPE_PANCAKE: case config.BLOCK_TYPE_QUOTE: postHTML += `<div class="card-body${(config.dataTheme != "light" && (finalType == config.BLOCK_TYPE_PANCAKE || (config.blockType == config.BLOCK_TYPE_LIST && finalType == config.BLOCK_TYPE_STACK)) ? ` h-100 bg-opacity-75 text-bg-${config.dataTheme}` : ` text-${config.inverseTheme}`)}">`;
                    break;
                case config.BLOCK_TYPE_LIST: postHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>`;
                case config.BLOCK_TYPE_CARD: postHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 rounded-0 p-5`;
                    switch (config.textVerticalAlign) {
                        case "top": postHTML += ' h-auto">'; break;
                        case "middle": postHTML += ' h-auto top-50 translate-middle-y">'; break;
                        case "bottom": postHTML += ' h-auto bottom-0" style="top:auto;">'; break;
                        case "overlay": postHTML += '">'; break;
                    }
                    break;
                case config.BLOCK_TYPE_COVER: finalType == config.BLOCK_TYPE_COVER && (postHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ${((config.cornerStyle == " rounded" && config.textVerticalAlign != "overlay") ? ' rounded-5' : config.cornerStyle)} start-50 translate-middle`);
                    switch (config.textVerticalAlign) {
                        case "top": postHTML += '-x mt-5">'; break;
                        case "middle": postHTML += ' top-50">'; break;
                        case "bottom": postHTML += '-x  bottom-0 mb-5">'; break;
                        case "overlay": postHTML += ' top-50 h-100 w-100">'; break;
                    }
            }

            postHTML += `${authorCode}${dateCode}`;
            if (finalType === config.BLOCK_TYPE_COVER) postHTML += displayHeaderCode; else if (finalType === config.BLOCK_TYPE_COMMENT) postHTML += commentHeaderCode; else postHTML += normalHeaderCode;
            postHTML += snippetCode;
            !(finalType == config.BLOCK_TYPE_PANCAKE || finalType == config.BLOCK_TYPE_QUOTE) && (postHTML += ctaButtonCode);//CTA 

            postHTML += `</div>`;
            if (finalType === config.BLOCK_TYPE_STACK && config.showImage) postHTML += `</div>`;
            if (finalType === config.BLOCK_TYPE_PANCAKE || finalType === config.BLOCK_TYPE_QUOTE) postHTML += ctaButtonCode;// CTA for card-footer style
        }//TEXT
    if (finalType !== config.BLOCK_TYPE_SHOWCASE) postHTML += `</a>`;

    postHTML += `</article>`;

    return { postHTML, showcaseHTML, carouselIndicator };
}

/**
 * Initializes and renders dynamic content blocks based on data attributes.
 * It fetches Blogger post or comment data and displays it in various layouts.
 * @param {string|HTMLElement} blockItem A CSS selector string for the block elements or a single HTMLElement.
 */
function mBlocks(blockItem) {
    // Stage 1 jQuery Removal: Use native JS for element selection and looping.
    const elements = (typeof blockItem === 'string') ? document.querySelectorAll(blockItem) : [blockItem];

    elements.forEach(function (rawElement) {
        const // Constants for block types, improving readability over single-character strings.
            BLOCK_TYPE_COVER = 'v',
            BLOCK_TYPE_SHOWCASE = 's',
            BLOCK_TYPE_LIST = 'l',
            BLOCK_TYPE_CARD = 'c',
            BLOCK_TYPE_GALLERY = 'g',
            BLOCK_TYPE_PANCAKE = 'p',
            BLOCK_TYPE_STACK = 't',
            BLOCK_TYPE_QUOTE = 'q',
            BLOCK_TYPE_COMMENT = 'm';

        // --- Block Configuration Parsing ---
        const
            dataLabel = rawElement.getAttribute("data-label") || "Label Name missing", // Blogger label to fetch posts from
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
        
        // Determine the height of the section, with specific defaults for cover and showcase types.
        let sectionHeight = rawElement.getAttribute("data-iHeight");
        if (!sectionHeight) {
            if (blockType === BLOCK_TYPE_COVER) sectionHeight = "100vh";
            else if (blockType === BLOCK_TYPE_SHOWCASE) sectionHeight = "70vh";
            else sectionHeight = "m";
        }

        // --- Pagination and Identity ---
        const stageID = rawElement.getAttribute("data-s") || 1; // For paginated navigation, tracks the current page/stage
        const firstInstance = !rawElement.hasAttribute("data-s"); // Is this the first time the block is being loaded?
        const postsPerBlock = parseInt(rawElement.getAttribute("data-posts") || 3, 10); // Number of posts to fetch
        
        const articleHeight = sectionHeight === 'm' ? '' : `height:${sectionHeight}!important;`; // CSS style for the item height
        const widget = rawElement.closest(".widget");
        const mBlockID = widget ? widget.getAttribute("ID") : (dataTitle + dataType + dataLabel); // Unique ID for the block, used for carousel targeting.
        
        let blurImage;
        const dataBlur = (rawElement.getAttribute("data-iBlur") || "").toLowerCase();
        if (dataBlur === "true") {
            blurImage = true;
        } else if (dataBlur === "false") {
            blurImage = false;
        } else {
            // Default behavior: Blur image if header is present, except for specific block types
            const excludedBlurTypes = [BLOCK_TYPE_SHOWCASE, BLOCK_TYPE_LIST, BLOCK_TYPE_STACK, BLOCK_TYPE_PANCAKE, BLOCK_TYPE_QUOTE];
            blurImage = showHeader && !excludedBlurTypes.includes(blockType);
        }
        // --- Layout and Feed Configuration ---
        let
            columnCount = rawElement.getAttribute("data-cols"), // Number of columns for the grid
            blockRows = parseInt(rawElement.getAttribute("data-rows") || "1", 10), // Number of rows per carousel slide
            isCarousel = (rawElement.getAttribute("data-isCarousel") || "").toLowerCase() == "true", // Check if the block should be a carousel
            containsNavigation = false,
            contentWrapper = "",
            feedURL = siteURL + "feeds/",
            carouselIndicators = '',// HTML for carousel indicators
            actualColumnCount = 0;

        // --- Feed URL Construction ---
        switch (contentType) { // Construct the feed URL based on content type
            case "recent":
                feedURL += "posts";
                feedURL += showImage ? "/default" : "/summary";
                break;
            case "comments":
                feedURL += "comments";
                feedURL += showImage ? "/default" : "/summary";
                break;
            default:
                feedURL += "posts";
                feedURL += showImage ? "/default" : "/summary";
                feedURL += "/-/" + dataLabel;
        }
        feedURL += `?alt=json-in-script&start-index=${(stageID - 1) * postsPerBlock + 1}&max-results=${postsPerBlock}`;

        // --- Data Fetching ---
        fetchJSONP(feedURL, {
            success: function (response) {
                if (response.feed.entry) {
                    const postsInFeed = response.feed.entry.length,//Total number of actual posts in feed
                        totalPostsAvailable = response.feed.openSearch$totalResults.$t, // Total posts available on the blog for this query
                        snippetSize = rawElement.getAttribute("data-snippetSize") || 150, // Max characters for snippets
                        cornerStyle = ((rawElement.getAttribute("data-corner") || "").toLowerCase() == "sharp") ? " rounded-0" : " rounded", // 'sharp' or 'rounded' corners
                        inverseTheme = (dataTheme == "light" ? "primary" : "light");// Inverse theme for contrast
                    
                    let textVerticalAlign = (rawElement.getAttribute("data-textVAlign") || "").toLowerCase();
                    if (!textVerticalAlign) {
                        if (blockType === 'v') textVerticalAlign = "middle";
                        else if (blockType === 'l') textVerticalAlign = "bottom";
                        else textVerticalAlign = 'overlay';
                    }
                    const
                        aspectRatio = ` ratio ratio-${(rawElement.getAttribute("data-ar") || "1x1").toLowerCase()}`,// Aspect ratio for media [1x1, 4x3, 16x9, etc.]
                        gutterSize = rawElement.getAttribute("data-gutter") || ((blockType == "v") ? 0 : 3), // Bootstrap gutter size
                        isImageFixed = (rawElement.getAttribute("data-iFix") || "").toLowerCase() == "true", // Use fixed background images
                        lowContrast = (rawElement.getAttribute("data-lowContrast") || "").toLowerCase() == "true", // Lower contrast for text/elements
                        hasRoundedBorder = (rawElement.getAttribute("data-iBorder") || "").toLowerCase() == "true", // Add a border around items
                        callToAction = rawElement.getAttribute("data-CTAText") || "", // Call-to-action button text
                        isComplexLayout = (blockType == BLOCK_TYPE_LIST || blockType == BLOCK_TYPE_SHOWCASE), // Flag for layouts with special structures
                        totalStages = Math.ceil(totalPostsAvailable / postsPerBlock);// Total pages/stages available for navigation
                    let blockBody = '',//block body
                    moreText = rawElement.getAttribute("data-moreText") || "", // Text for the "View All" link in the footer.
                    finalType = blockType;

                    // Disable carousel for single-post blocks or list-style blocks
                    (postsPerBlock <= 1 || blockType == BLOCK_TYPE_LIST) && (isCarousel = false);
                    (contentType == "comments") && (moreText="");

                    // Create the date formatter once, outside the loop, for efficiency.
                    const dateFormatter = showDate ? new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short', // Use 'short' to match original format (e.g., "Oct")
                        day: 'numeric'
                    }) : null;
                    
                    let windowInnerWidth = 0;
                    if (isCarousel || showImage) { windowInnerWidth = window.innerWidth; }

                    // --- Image Resolution Calculation ---
                    // Determines the optimal image resolution to request from Blogger's servers based on column count and window size to save bandwidth.
                    let imageResolution = 100;
                    if (showImage && !blurImage) {
                        imageResolution = calculateImageResolution(isImageFixed, columnCount, windowInnerWidth);
                    }

                    // Consolidate all configuration variables into a single blockConfig object.
                    // This simplifies passing data to helper functions.
                    const blockConfig = {
                        siteURL, contentType, blockType, dataTheme, inverseTheme, showHeader, showImage, showSnippet, showAuthor, showDate, dateFormatter, lowContrast, snippetSize, cornerStyle, isImageFixed, blurImage, imageResolution, articleHeight, aspectRatio, hasRoundedBorder, callToAction,
                        // Pass block-type constants
                        BLOCK_TYPE_COVER, BLOCK_TYPE_SHOWCASE, BLOCK_TYPE_LIST, BLOCK_TYPE_CARD, BLOCK_TYPE_GALLERY, BLOCK_TYPE_PANCAKE, BLOCK_TYPE_STACK, BLOCK_TYPE_QUOTE, BLOCK_TYPE_COMMENT,
                        // Pass other dynamic variables needed inside the helper
                        isCarousel, columnCount, actualColumnCount: 0, blockRows, mBlockID, firstInstance, textVerticalAlign, gutterSize
                    };

                    if (firstInstance) {
                        rawElement.setAttribute("data-s", stageID);

                        // --- Block Header (Title & Description) ---
                        // Appends the main title and description for the entire block if provided.
                        if (dataTitle) rawElement.insertAdjacentHTML('beforeend', `<div class="text-center m-0 bg-${dataTheme} py-5"><h4 class="display-5 fw-bold text-${inverseTheme} py-3 m-0 ${lowContrast ? "opacity-50" : ""}">${dataTitle}</h4>${(dataDescription != "") ? `<span class="pb-3 text-black-50">${dataDescription}</span>` : ''}</div>`);
                    }

                    if (columnCount === null) { // Only set default if data-cols is not present at all
                        switch (blockType) {
                            case BLOCK_TYPE_COVER: case BLOCK_TYPE_COMMENT: case BLOCK_TYPE_STACK: columnCount = 1; break;
                            case BLOCK_TYPE_PANCAKE: columnCount = 3; break;
                            case BLOCK_TYPE_CARD: case BLOCK_TYPE_QUOTE: columnCount = 4; break;
                            case BLOCK_TYPE_GALLERY: columnCount = 5; break;
                            case BLOCK_TYPE_LIST: columnCount = 2; break;
                            case BLOCK_TYPE_SHOWCASE: columnCount = 6; break;
                        }
                    } else { 
                        columnCount = parseInt(columnCount, 10); 
                        if (columnCount < 1) columnCount = 1;
                        if (columnCount > 6) columnCount = 6;
                    }

                    // --- Carousel Column Calculation ---
                    // Adjusts the number of visible columns in a carousel based on screen width for responsiveness.
                    if (isCarousel) {
                        if (windowInnerWidth < 576) { actualColumnCount = columnCount < 5 ? 1 : (columnCount === 5 ? 2 : 3); }
                        else if (windowInnerWidth < 768) { actualColumnCount = columnCount < 4 ? 1 : (columnCount === 4 ? 2 : (columnCount === 5 ? 3 : 4)); }
                        else if (windowInnerWidth < 992) { actualColumnCount = columnCount === 3 ? 2 : (columnCount === 4 ? 3 : 4); }
                        else if (windowInnerWidth < 1200) { actualColumnCount = columnCount > 4 ? (columnCount === 5 ? 4 : 5) : columnCount; }
                        else { actualColumnCount = columnCount; }
                        
                        blockConfig.actualColumnCount = actualColumnCount; // Update config with the calculated value

                        // If there aren't enough posts to fill a slide, disable the carousel and enable simple next/prev navigation instead.
                        if (blockRows > Math.ceil(postsInFeed / actualColumnCount)) blockRows = Math.ceil(postsInFeed / actualColumnCount);
                        if (postsInFeed <= (actualColumnCount * blockRows)) { isCarousel = false; containsNavigation = true; }
                    }

                    // --- Carousel Initialization ---
                    if (isCarousel) {
                        carouselIndicators = document.createElement("div");
                        carouselIndicators.classList.add('carousel-indicators');
                        if (blockType != BLOCK_TYPE_COVER) carouselIndicators.classList.add('position-relative', 'm-0');
                    }(isCarousel || containsNavigation) && (blockBody += `<div class="carousel-inner">`);

                    // --- Main Content Wrapper ---
                    // Creates the main container for the block content.
                    contentWrapper = document.createElement('div');
                    contentWrapper.id = 'm' + mBlockID;
                    rawElement.appendChild(contentWrapper);
                    contentWrapper.className = `overflow-hidden bg-${dataTheme}${blockType == BLOCK_TYPE_SHOWCASE ? ' sFeature' : ""}${((isCarousel || containsNavigation) ? ` st${stageID} carousel carousel-fade` : "")}`;
                    contentWrapper.setAttribute("data-bs-ride", "carousel");

                    // =========================== POST PROCESSING LOOP ===========================
                    // Iterates through each post from the feed to build its HTML.
                    for (let postID = 0; postID < postsInFeed; postID++) {
                        const post = response.feed.entry[postID];
                        const { postHTML, showcaseHTML, carouselIndicator } = _createPostHtml(post, postID, blockConfig);
                        
                        if (carouselIndicator) {
                            if (isCarousel) carouselIndicators.insertAdjacentHTML('beforeend', carouselIndicator);
                        }
                        if (showcaseHTML && firstInstance && postID === 0) {
                             contentWrapper.insertAdjacentHTML('beforebegin', showcaseHTML);
                        }

                        // --- Item Wrapper ---
                        // Creates a new row/carousel-item wrapper when needed.
                        if (postID == 0 || (isCarousel && postID % (actualColumnCount * blockRows) == 0) || (blockType == BLOCK_TYPE_LIST && postID == 1)) {
                            blockBody += `<div class="row  g-${gutterSize} mx-0`;
                            if (isCarousel) { blockBody += ' carousel-item' + (postID === 0 ? ' active' : ''); } // Add active class to first item
                            isComplexLayout && (blockType == BLOCK_TYPE_LIST) && (blockBody += ' col flex-grow-1');
                            (finalType != BLOCK_TYPE_COVER) && (!(isComplexLayout && (finalType == BLOCK_TYPE_STACK || finalType == BLOCK_TYPE_CARD)) && (blockBody += ` pb-${gutterSize}`), (isCarousel || containsNavigation) && (blockBody += ' px-2 px-sm-3 px-md-4 px-lg-5'));
                            switch (columnCount) {
                                case 1: blockBody += ' row-cols-1">'; break;
                                case 2: blockBody += ' row-cols-1 row-cols-sm-1 row-cols-md-2">'; break;
                                case 3: blockBody += ' row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3">'; break;
                                case 4: blockBody += ' row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4">'; break;
                                case 5: blockBody += ' row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5">'; break;
                                case 6: blockBody += ' row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">'; break;
                            }
                        }

                        // --- Article HTML Construction ---
                        blockBody += postHTML;

                        // Close the row/carousel-item div at the end of a slide or at the last post.
                        if (postID === (postsInFeed - 1) || (isCarousel && (postID % (actualColumnCount * blockRows) === (actualColumnCount * blockRows - 1)))) blockBody += `</div>`; // close .row
                    }// End of post processing loop

                    if (isCarousel || containsNavigation) {
                        contentWrapper.insertAdjacentHTML('beforeend', blockBody + '</div>'); // Append and close carousel-inner
                        if (isCarousel) contentWrapper.appendChild(carouselIndicators);

                        // --- Carousel/Pagination Navigation ---
                        let previousButtonCode ="", nextButtonCode = "";
                        previousButtonCode = `<button class="carousel-control-prev link-secondary${(containsNavigation ? " nav-prev" : " pb-5")}" type="button" title="Click for Previous" data-bs-target="#m${mBlockID}" data-bs-slide="prev" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg><span class="visually-hidden">Previous</span></button>`, nextButtonCode = `<button class="carousel-control-next link-secondary${(containsNavigation ? " nav-next" : " pb-5")}" title="Click for Next" type="button" data-bs-target="#m${mBlockID}" data-bs-slide="next" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg><span class="visually-hidden">Next</span></button>`;
                        if (isCarousel) contentWrapper.insertAdjacentHTML('beforeend', previousButtonCode + nextButtonCode);

                        if (containsNavigation) { if (stageID > 1) contentWrapper.insertAdjacentHTML('beforeend', previousButtonCode); if (stageID < totalStages) contentWrapper.insertAdjacentHTML('beforeend', nextButtonCode); }
                    } else { contentWrapper.insertAdjacentHTML('beforeend', blockBody); }

                    // --- Block Footer (More Link) ---
                    let footerNavCode = ``;
                    if (!(moreText === "" && blockType === BLOCK_TYPE_COVER)) footerNavCode += `<nav aria-label="Page navigation" class="st${stageID} w-100 pe-5 py-5 pagination justify-content-end bg-${dataTheme}">`;
                    if (moreText != "") {
                        for (let linkIndex = 0; linkIndex < response.feed.link.length; linkIndex++) {
                            let feedURL = response.feed.link[linkIndex];
                            if ("alternate" == feedURL.rel) {
                                let moreLinkURL = feedURL.href;
                                footerNavCode += `<a class="text-bg-${dataTheme} border-0 ${lowContrast ? "opacity-50" : "opacity-75"}" href="${moreLinkURL}?&max-results=12" title="Click for More">${moreText} <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>`;
                            }
                        }
                    }
                    if (!(moreText === "" && blockType === BLOCK_TYPE_COVER)) footerNavCode += `</nav>`;
                    contentWrapper.insertAdjacentHTML('afterend', footerNavCode);
                }//if
                else { // If response.feed.entry is empty or doesn't exist
                    switch (contentType) { // Handle cases where the feed is empty
                        case "recent": rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-${dataTheme} display-6 p-4 w-100">Sorry! No recent updates.</div>`); break;
                        case "comments": rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-${dataTheme} display-6 p-4 w-100">No comments. <br/> Start the conversation!</div>`); break;
                        default: rawElement.insertAdjacentHTML('beforeend', `<div class="text-center text-bg-${dataTheme} display-6 p-4 w-100">Sorry! No content found for "${dataLabel}"!</div>`);
                    }
                } 
            },//success
            complete: function () {
                // Helper functions for fade animations
                const fadeIn = (el) => { if (!el) return; el.style.opacity = 0; el.style.display = 'block'; (function fade() { let val = parseFloat(el.style.opacity); if (!((val += .1) > 1)) { el.style.opacity = val; requestAnimationFrame(fade); } })(); };
                const fadeOut = (el) => { if (!el) return; el.style.opacity = 1; (function fade() { if ((el.style.opacity -= .1) < 0) { el.style.display = "none"; } else { requestAnimationFrame(fade); } })(); };

                // --- Navigation Event Handlers ---
                if (containsNavigation) {
                    const prevButton = rawElement.querySelector(".nav-prev"); // Previous button for simple navigation
                    const prevNav = function() {
                        const currentStage = (rawElement.getAttribute("data-s"));
                        rawElement.setAttribute("data-s", +currentStage - 1);
                        fadeOut(rawElement.querySelector(".st" + currentStage));
                        fadeIn(rawElement.querySelector(".st" + (currentStage - 1)));
                        prevButton.removeEventListener('click', prevNav); // Unbind
                    };
                    if (prevButton) prevButton.addEventListener('click', prevNav);

                    const nextButton = rawElement.querySelector(".nav-next"); // Next button for simple navigation
                    const nextNav = function() {
                        const currentStage = (rawElement.getAttribute("data-s"));
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
                    if (nextButton) nextButton.addEventListener('click', nextNav);
                }//if
                // --- Showcase Block Interactivity ---
                if (blockType == BLOCK_TYPE_SHOWCASE) {
                    const featuredImageNode = rawElement.querySelector(".feature-image");
                    if (!featuredImageNode) return;

                    const figureNode = featuredImageNode.querySelector("figure");
                    const iFrameNode = featuredImageNode.querySelector(".sIframe");
                    const contentNode = featuredImageNode.querySelector(".sContent");

                    // Handle clicks on the main featured image, especially for playing videos.
                    if (figureNode) figureNode.addEventListener('click', function() {
                        let clickedVideoID = this.getAttribute("data-vidid");
                        if (clickedVideoID !== "regular") {
                            if (iFrameNode) iFrameNode.innerHTML = `<iframe src="https://www.youtube.com/embed/${clickedVideoID}?autoplay=1" allowfullscreen="" style="${articleHeight}width:100%;" frameborder="0"></iframe>`;
                            fadeIn(iFrameNode);
                            fadeOut(figureNode);
                            if (contentNode) fadeOut(contentNode);
                        }
                    });

                    // Handle clicks on the smaller thumbnail posts to update the main featured area.
                    rawElement.querySelectorAll(".sPost").forEach(showcasePost => {
                        showcasePost.addEventListener('click', function() {
                            const videoID = this.getAttribute("data-vidid");
                            const postTitle = this.getAttribute("data-title");
                            let playIcon = figureNode ? figureNode.querySelector("svg") : null;

                            if (figureNode) {
                                // Update the main figure with the new post's data (image, title, video ID).
                                let videoTitle = postTitle;
                                if (videoID.toLowerCase() != "regular") {
                                    videoTitle = "Click here to load the video!";
                                    if (!playIcon) {
                                        figureNode.insertAdjacentHTML('beforeend', `<svg class="position-absolute top-50 start-50 translate-middle" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>`);
                                    } else {
                                        fadeIn(playIcon);
                                    }
                                } else { 
                                    if (playIcon) fadeOut(playIcon); 
                                }
                                figureNode.setAttribute("title", videoTitle);
                                figureNode.setAttribute("aria-label", videoTitle);
                                figureNode.style.background = `url(${this.getAttribute("data-img-high")}) center center`;
                                figureNode.style.backgroundSize = 'cover';
                                figureNode.setAttribute("data-vidid", videoID);
                            }

                            fadeOut(iFrameNode);
                            fadeIn(figureNode);
                            if(contentNode) {
                                // Update the content overlay with the new post's title and snippet.
                                fadeIn(contentNode);
                                const h5 = contentNode.querySelector("h5");
                                if (h5) h5.innerHTML = postTitle;
                                const summary = contentNode.querySelector("summary");
                                if (summary) summary.innerHTML = this.getAttribute("data-summary");
                            }

                            // Update the link and button titles.
                            const link = featuredImageNode.querySelector("a");
                            if (link) {
                                link.setAttribute("href", this.getAttribute("data-link"));
                                link.setAttribute("title", postTitle);
                            }
                            const button = featuredImageNode.querySelector("button");
                            if (button) button.setAttribute("title", postTitle);
                        });
                    });
                }
            }//complete
        })//ajax
    });//forEach
}