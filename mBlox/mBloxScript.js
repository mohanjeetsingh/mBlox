/*!
 * mBlox for Blogger
 * Demo @ https://mBloxForBlogger.blogspot.com/
 * Agency @ https://CIA.RealHappinessCenter.com
 * @version 1.0.0
 * Copyright (c) 2022-2025, Mohanjeet Singh (https://Mohanjeet.blogspot.com/)
 * Released under the MIT license
 */
function mBlocks(m) {
    $(m).map(function () {
        /* CONSTANTS */
        // Defines the single-character codes used in data attributes for various settings.
        const C = {
            TYPE: { VERTICAL: 'v', MINIMAL: 'm', TEXT: 't', PHOTO: 'p', CARD: 'c', QUOTE: 'q', GALLERY: 'g', LIST: 'l', SHOWCASE: 's' },
            CONTENT: { RECENT: 'recent', COMMENTS: 'comments' },
            THEME: { LIGHT: 'light' },
            V_ALIGN: { MIDDLE: 'middle', BOTTOM: 'bottom', OVERLAY: 'overlay' },
            CORNER: { SHARP: 'sharp' },
            FLAG: { HEADER: 'h', IMAGE: 'i', SNIPPET: 's', AUTHOR: 'a', DATE: 'd' }
        };

        /* SETTINGS PULLED FROM USER PLACEMENT + VALIDATION + DEFAULT SETTINGS APPLICATION */
        // These settings are pulled from the `data-*` attributes on the mBlock element itself.
        const
            element = $(this),
            label = element.attr("data-label") || "Label Name missing",
            contentType = (element.attr("data-contentType") || C.CONTENT.RECENT).toLowerCase(),// Can be comments, label, or recent.
            siteUrl = element.attr("data-feed") || "/",// The root URL of the blogspot site.
            title = element.attr("data-title") || "",
            description = element.attr("data-description") || "",
            typeAttr = (element.attr("data-type") || "v-ih").toLowerCase(), // e.g., "v-ihs" for Vertical, Image, Header, Snippet
            blockType = typeAttr.substring(0, 1),// The primary block type (v, s, l, etc.)
            typeFlags = typeAttr.substring(1),// The flags for content parts (i, h, s, a, d)
            theme = (element.attr("data-theme") || C.THEME.LIGHT).toLowerCase(),
            hasHeader = (-1 != typeFlags.search(C.FLAG.HEADER)),
            hasImage = (-1 != typeFlags.search(C.FLAG.IMAGE)),
            hasSnippet = (-1 != typeFlags.search(C.FLAG.SNIPPET)),
            hasAuthor = (-1 != typeFlags.search(C.FLAG.AUTHOR)),
            hasDate = (-1 != typeFlags.search(C.FLAG.DATE)),
            imageHeight = element.attr("data-iHeight") || (blockType == C.TYPE.VERTICAL ? "100vh" : (blockType == C.TYPE.SHOWCASE ? "70vh" : "m")),
            blockHeightStyle = imageHeight == 'm' ? '' : "height:" + imageHeight + "!important;",
            stage = element.attr("data-s") || 1,// Used for paginating through posts.
            isFirstInstance = (element.attr("data-s") === undefined),// Checks if this is the first time the block is being loaded.
            postsPerPage = parseInt(element.attr("data-posts") || 3),
            blockId = element.closest(".widget-content").parent(".widget").attr("ID") || (title + typeAttr + label);
        let
            isBlurred = (() => {
                const dataBlur = element.attr("data-iBlur");
                if (dataBlur === "true") return true;
                if (dataBlur === "false") return false;
                // Default blur is true for most content-heavy blocks.
                return hasHeader && ![C.TYPE.SHOWCASE, C.TYPE.LIST, C.TYPE.TEXT, C.TYPE.PHOTO, C.TYPE.QUOTE].includes(blockType);
            })(),
            columnCount = element.attr("data-cols"),
            rowCount = parseInt(element.attr("data-rows") || 1),
            isCarousel = (element.attr("data-isCarousel") || "").toLowerCase() == "true",
            isNav = false, // Flag to determine if carousel-style navigation is needed without the carousel itself.
            wrapper = "",
            feedUrl = siteUrl + "feeds/",
            carouselIndicators = '';

        //FEED SETTING: Construct the correct Blogger JSON feed URL based on the desired content type.
        switch (contentType) {
            case C.CONTENT.RECENT: feedUrl += "posts"; hasImage ? (feedUrl += "/default") : (feedUrl += "/summary"); break;
            case C.CONTENT.COMMENTS: feedUrl += "comments"; hasImage ? (feedUrl += "/default") : (feedUrl += "/summary"); break;
            default: feedUrl += "posts"; hasImage ? (feedUrl += "/default") : (feedUrl += "/summary"); feedUrl += "/-/" + label;
        }
        feedUrl += "?alt=json-in-script&start-index=" + ((stage - 1) * postsPerPage + 1) + "&max-results=" + postsPerPage;

        //JSON PULL: Fetch the data from the Blogger feed.
        $.ajax({
            url: feedUrl,
            type: "get",
            dataType: "jsonp",
            success: function (fe) {
                if (fe.feed.entry) {
                    // These consts are defined within the success callback as they depend on the returned feed data.
                    const postCount = fe.feed.entry.length,
                        totalResults = fe.feed.openSearch$totalResults.$t,
                        snippetSize = element.attr("data-snippetSize") || 150,
                        cornerStyle = ((element.attr("data-corner") || "").toLowerCase() == C.CORNER.SHARP) ? " rounded-0" : " rounded",
                        textAlignV = (element.attr("data-textVAlign") || (blockType == C.TYPE.VERTICAL ? C.V_ALIGN.MIDDLE : (blockType == C.TYPE.LIST ? C.V_ALIGN.BOTTOM : C.V_ALIGN.OVERLAY))).toLowerCase(),
                        inverseTheme = (theme == C.THEME.LIGHT ? "primary" : C.THEME.LIGHT),
                        aspectRatio = " ratio ratio-" + (element.attr("data-ar") || "1x1").toLowerCase(),
                        gutter = element.attr("data-gutter") || ((blockType == C.TYPE.VERTICAL) ? 0 : 3),
                        isImageFixed = (element.attr("data-iFix") || "").toLowerCase() == "true",
                        isLowContrast = (element.attr("data-lowContrast") || "").toLowerCase() == "true",
                        isRounded = (element.attr("data-iBorder") || "").toLowerCase() == "true",
                        ctaText = element.attr("data-CTAText") || "",
                        isCompound = (blockType == C.TYPE.LIST || blockType == C.TYPE.SHOWCASE), // Compound blocks have special layout rules.
                        totalStages = Math.ceil(totalResults / postsPerPage);
                    let blockBodyHtml = '',
                    moreText = element.attr("data-moreText") || "",
                    finalItemType = blockType; // The item type can change within a loop (e.g., for List type).

                    (postsPerPage <= 1 || blockType == C.TYPE.LIST) && (isCarousel = false);
                    (contentType == C.CONTENT.COMMENTS) && (moreText="");
                    if (isCarousel || hasImage) { var innerWidth = window.innerWidth; }

                    //Image Resolution Setting: Calculate the optimal image size based on container width and column count.
                    let imageSize = 100;
                    if (hasImage && !isBlurred) {
                        if (isImageFixed) { imageSize = innerWidth; } else {
                            switch (columnCount) {
                                case 1: imageSize = innerWidth;
                                case 2: innerWidth < 768 ? imageSize = innerWidth : imageSize = innerWidth / 2;
                                case 3: innerWidth < 768 ? imageSize = innerWidth : (innerWidth < 992 ? imageSize = innerWidth / 2 : imageSize = innerWidth / 3);
                                case 4: innerWidth < 576 ? imageSize = innerWidth : (innerWidth < 768 ? imageSize = innerWidth / 2 : (innerWidth < 992 ? imageSize = innerWidth / 3 : imageSize = innerWidth / 4));
                                case 5: innerWidth < 576 ? imageSize = innerWidth / 2 : (innerWidth < 768 ? imageSize = innerWidth / 3 : (innerWidth < 1200 ? imageSize = innerWidth / 4 : imageSize = innerWidth / 5));
                                case 6: innerWidth < 576 ? imageSize = innerWidth / 3 : (innerWidth < 992 ? imageSize = innerWidth / 4 : (innerWidth < 1200 ? imageSize = innerWidth / 5 : imageSize = innerWidth / 6));
                            }
                        }
                        imageSize = Math.ceil(imageSize / 100) * 100;
                    }

                    // On the first load of this block, add the main title and description header.
                    if (isFirstInstance) {
                        element.attr("data-s", stage);
                        (title != "") && element.append('<div class="text-center m-0 bg-' + theme + ' py-5"><h4 class="display-5 fw-bold text-' + inverseTheme + ' py-3 m-0 ' + (isLowContrast ? "opacity-50" : "") + '">' + title + '</h4>' + ((description != "") ? ('<span class="pb-3 text-black-50">' + description + '</span>') : '') + '</div>');
                    }

                    // Set default column counts based on block type if not specified by the user.
                    if (typeof (columnCount) === "undefined") {
                        switch (blockType) {
                            case C.TYPE.VERTICAL:case C.TYPE.MINIMAL: case C.TYPE.TEXT: columnCount = 1; break;
                            case C.TYPE.PHOTO: columnCount = 3; break;
                            case C.TYPE.CARD: case C.TYPE.QUOTE: columnCount = 4; break;
                            case C.TYPE.GALLERY: columnCount = 5; break;
                            case C.TYPE.LIST: columnCount = 2; break;
                            case C.TYPE.SHOWCASE: columnCount = 6; break;
                        }
                    } else { columnCount = parseInt(columnCount); (columnCount < 1) && (columnCount = 1); (columnCount > 6) && (columnCount = 6); }

                    //CAROUSEL COLUMNS ADJUSTMENT TO WINDOW SIZE
                    if (isCarousel) {
                        var activeColumns = 0;

                        if (innerWidth < 576) { columnCount < 5 ? activeColumns = 1 : (columnCount == 5 ? activeColumns = 2 : activeColumns = 3); }
                        else if (innerWidth < 768) { columnCount < 4 ? activeColumns = 1 : (columnCount == 4 ? activeColumns = 2 : (columnCount == 5 ? activeColumns = 3 : activeColumns = 4)); }
                        else if (innerWidth < 992) { columnCount == 3 ? activeColumns = 2 : (columnCount == 4 ? activeColumns = 3 : activeColumns = 4); }
                        else if (innerWidth < 1200) { (columnCount > 4) && (columnCount == 5 ? activeColumns = 4 : activeColumns = 5); }
                        else { activeColumns = columnCount; }

                        (rowCount > Math.ceil(postCount / columnCount)) && (rowCount = Math.ceil(postCount / columnCount));
                        // If the number of posts is less than or equal to what can be displayed on one screen, disable the carousel and enable simple navigation instead.
                        (postCount <= (activeColumns * rowCount)) && (isCarousel = false, isNav = true);
                    }
                    
                    if (isCarousel) {
                        carouselIndicators = document.createElement("div");
                        $(carouselIndicators).addClass('carousel-indicators');
                        (blockType != C.TYPE.VERTICAL) && ($(carouselIndicators).addClass('position-relative m-0'));
                    }
                    (isCarousel || isNav) && (blockBodyHtml += '<div class="carousel-inner">');

                    //BLOCK BODY WRAPPER
                    wrapper = document.createElement('div');
                    wrapper.id = 'm' + blockId;
                    const m = $(wrapper);
                    m.appendTo(element).attr({ "data-bs-ride": "carousel" });
                    wrapper.className = ('overflow-hidden bg-' + theme + (blockType == C.TYPE.SHOWCASE ? ' sFeature' : "") + ((isCarousel || isNav) ? (' st' + stage + ' carousel carousel-fade') : ""));

                    //== FEED LOOP FOR POSTS ==
                    // This is the main loop that iterates over each post from the feed and builds the corresponding HTML.
                    for (let p = 0; p < postCount; p++) {
                        const item = fe.feed.entry[p],
                            itemTitle = item.title.$t,
                            itemContent = (hasSnippet || hasImage) && (("content" in item) ? item.content.$t : (("summary" in item) ? (item.summary.$t) : (("summary" in b_rc) ? (item.summary.$t) : "")));
                        let authorName = item.author[0].name.$t, snippetHtml = tempSnippetText = "";

                        // For the "List" block type, the first post is treated differently (as a Text type), and subsequent posts are Cards.
                        (blockType == C.TYPE.LIST) && p > 0 && (hasHeader ? (finalItemType = C.TYPE.TEXT, columnCount--) : finalItemType = C.TYPE.CARD);

                        //<< POST COMPONENT LIBRARY >>
                        // Each section below builds a piece of the final post HTML (Author, Date, Title, etc.)
                        
                        let authorHtml = '';
                        if (hasAuthor) {
                            contentType != C.CONTENT.COMMENTS && ((authorName == "Anonymous" || authorName == "Unknown") ? (auur = siteUrl) : (auur = item.author[0].uri.$t));
                            switch (finalItemType) {
                                case C.TYPE.QUOTE: authorHtml += '<figcaption class="small fw-lighter">- ' + authorName + '</figcaption>'; break;
                                case C.TYPE.MINIMAL: authorHtml += '<span class="small text-'+theme+'" rel="author">' + authorName + '</span>'; break;
                            }
                        }
                        
                        let dateHtml = '';
                        if (hasDate) {
                            const o = item.published.$t,
                                h = (item.published.$t, item.content.$t, item.published.$t);
                            let v = h.split("T");
                            dateHtml = " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(v = v[0].split("-"))[1] - 1] + " " + v[2] + ", " + v[0];
                            dateHtml = '<span class="small fw-lighter">'+(hasAuthor?' &#8226; ':'') + dateHtml + '</span>';
                        }

                        let headerDisplay = headerNormal = headerMinimal= "";
                        (finalItemType == C.TYPE.QUOTE) ? (headerNormal = '<svg class="float-start link-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/></svg><blockquote class="blockquote link-primary text-start mt-2 ms-4">' + itemTitle + '</blockquote>') : (hasHeader && (headerDisplay = '<h3 class="display-5 mx-lg-5 ' + (isLowContrast ? "opacity-50" : "opacity-75") + '">' + itemTitle + '</h3>', headerNormal = '<h5 class="card-title fw-normal">' + itemTitle + '</h5>',headerMinimal='<span class="d-block my-2">"' + itemTitle+'"</span>'));

                        if (hasSnippet) {
                            (tempSnippetText = itemContent.replace(/<\S[^>]*>/g, "")).length > 70 && (tempSnippetText = tempSnippetText.substring(0, snippetSize) + "...");
                            snippetHtml = '<summary class="list-unstyled' +
                                (theme == C.THEME.LIGHT ? ' text-muted' : ' opacity-75')+
                                (finalItemType == C.TYPE.VERTICAL ? ' py-3 d-block mx-lg-5' : '') +
                                (isLowContrast ? ' opacity-75' : '') +
                                '">' + tempSnippetText + '</summary>';
                        }

                        let linkUrl = "";
                        for (let z = 0; z < item.link.length; z++) if ("alternate" == item.link[z].rel) { linkUrl = item.link[z].href; break; }

                        let imageHtml = imageUrl = imageHighResUrl = videoThumbUrl = imageShowcaseHtml = "";
                        if (hasImage) {
                            let imageUrl = imageHighResUrl = noImg;
                            let tempSnippetText = $("<div>").html(itemContent);
                            if (contentType == C.CONTENT.COMMENTS) {
                                imageUrl = item.author[0].gd$image.src;
                                imageUrl.match("blogblog.com") && (imageUrl = noImg);
                            }
                            else {
                                if (itemContent.indexOf("//www.youtube.com/embed/") > -1) {
                                    videoThumbUrl = item.media$thumbnail.url;
                                    (-1 !== videoThumbUrl.indexOf("img.youtube.com")) && (videoThumbUrl = videoThumbUrl.replace("/default.jpg", "/maxresdefault.jpg"));
                                }
                                if (itemContent.indexOf("<img") > -1) {
                                    imageUrl = tempSnippetText.find("img:first").attr("src");
                                    (-1 !== imageUrl.indexOf("/s72-c")) ? (imageHighResUrl = imageUrl.replace("/s72-c", "/s1600")) : ((-1 !== imageUrl.indexOf("/w640-h424")) ? imageHighResUrl = imageUrl.replace("/w640-h424", "/s1600") : (imageHighResUrl = imageUrl));
                                    (-1 !== imageHighResUrl.indexOf("/s1600")) && (imageUrl = imageHighResUrl.replace("/s1600", "/s" + imageSize));
                                }
                            }
                            (videoThumbUrl == "") && (videoThumbUrl = imageUrl);

                            let imageStyle = " object-fit:cover;height:100%!important;",
                                imageClass = ' w-100 img-fluid',
                                imageStyleFixed = ' background:url(' + imageHighResUrl + ') fixed center center;background-size:cover;',
                                t = "";
                            switch (finalItemType) {
                                case C.TYPE.PHOTO: imageClass = aspectRatio; break;
                                case C.TYPE.MINIMAL:imageStyle += ' height:3rem!important;width:3rem;';
                                imageStyleFixed += ' height:3rem!important;width:3rem;';
                                imageClass = ' rounded-circle m-2'; break;
                                case C.TYPE.QUOTE:
                                    imageStyle += ' height:6rem!important;width:6rem;';
                                    imageStyleFixed += ' height:6rem!important;width:6rem;';
                                    imageClass = ' rounded-circle mx-auto mt-3'; break;
                                case C.TYPE.TEXT: imageClass = " col-4 h-100"; break;
                                case C.TYPE.SHOWCASE:
                                    const videoIdYoutube = (-1 !== videoThumbUrl.indexOf("img.youtube.com")) ? (videoThumbUrl.substr(videoThumbUrl.indexOf("/vi/") + 4, 11)) : "regular";
                                    p == 0 && (t = '" data-toggle="tooltip" data-vidid="' + videoIdYoutube + '"', imageShowcaseHtml = '<figure class="m-0' + imageClass +(cornerStyle == " rounded" ? ' rounded-5 rounded-bottom' : cornerStyle) + '" style="' + imageStyleFixed + blockHeightStyle + '" role="img" loading="lazy" title="' + itemTitle + '" aria-label="' + itemTitle + ' image"' + t + '></figure>');
                                    imageClass += aspectRatio+' shadow-sm';
                                    break;
                                case C.TYPE.VERTICAL: imageStyleFixed += blockHeightStyle; break;
                            }
                            isBlurred && !(contentType == C.CONTENT.COMMENTS) && (imageClass += ' blur-5');

                            imageHtml = isImageFixed ? ('<figure class="m-0' + imageClass + '" style="' + imageStyleFixed + '" role="img" loading="lazy" aria-label="' + itemTitle + ' image"' + t + '></figure>') : ('<img class="' + imageClass + '" style="' + imageStyle + '" src="' + imageUrl + '" alt="' + itemTitle + ' image" loading="lazy" title="' + itemTitle + '" ' + t + '/>');
                        }

                        let buttonHtml = "";
                        if (ctaText != "") {
                            switch (finalItemType) {
                                case C.TYPE.GALLERY: break;
                                case C.TYPE.MINIMAL: buttonHtml = '<span class="link-'+theme+' small">'+ctaText+'</span>' ; break;
                                default:
                                    buttonHtml = '<button class="btn ' +
                                        ((cornerStyle != " rounded" || finalItemType == C.TYPE.PHOTO || finalItemType == C.TYPE.QUOTE) ? 'rounded-0' : '') +
                                        (isLowContrast ? " opacity-50" : " opacity-75");
                                    switch (finalItemType) {
                                        case C.TYPE.SHOWCASE: buttonHtml += " p-3 px-lg-5 float-end"; break;
                                        case C.TYPE.VERTICAL: buttonHtml += ' p-2 px-4  mx-lg-5 mt-4'; break;
                                        case C.TYPE.PHOTO: case C.TYPE.QUOTE: buttonHtml += ' py-2 px-3 w-100 text-end link-' + inverseTheme; break;
                                        case C.TYPE.TEXT: buttonHtml += ' mt-3'; break;
                                        case C.TYPE.CARD: case C.TYPE.LIST: buttonHtml += ' bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto'; break;
                                    }
                                    buttonHtml += ' border-0 btn-' + theme + '" role="button" title="' + itemTitle + '">' + ctaText + '</button>';
                            }
                        }

                        isCarousel && (p % (activeColumns * rowCount) == 0) && ($(carouselIndicators).append('<button type="button" data-bs-target="#m' + blockId + '" data-bs-slide-to="' + p / (activeColumns * rowCount) + '" class="bg-' + inverseTheme + (p == 0 ? (' active" aria-current="true"') : '"') + ' aria-label="Slide ' + (p / (activeColumns * rowCount) + 1) + '"></button>'));

                        finalItemType == C.TYPE.SHOWCASE && isFirstInstance && p == 0 && m.before('<div class="feature-image card border-0 text-center bg-' + theme + ' overflow-hidden rounded-0"><div class="sIframe" style="display:none;"></div>' + imageShowcaseHtml + '<a class="link-' + inverseTheme + '" href="' + linkUrl + '" title="' + itemTitle + '">' + ((hasHeader) ? ('<div class="sContent card-img-overlay rounded-0 ' + (cornerStyle == " rounded" && "rounded-top") + ' mx-md-5 p-3 px-lg-5 bg-' + theme + ' mt-auto" style="height:fit-content;">' + headerNormal + ' ' + snippetHtml + '</div>') : "") + ((hasImage || ctaText != "") ? buttonHtml : "") + '</a></div>');

                        if (p == 0 || (isCarousel && p % (activeColumns * rowCount) == 0) || (blockType == C.TYPE.LIST && p == 1)) {
                            blockBodyHtml += '<div class="row  g-' + gutter + ' mx-0';
                            isCarousel && ((blockBodyHtml += ' carousel-item'), (p == 0) && (blockBodyHtml += ' active'));
                            isCompound && (blockType == C.TYPE.LIST) && (blockBodyHtml += ' col flex-grow-1');
                            (finalItemType != C.TYPE.VERTICAL) && (!(isCompound && (finalItemType == C.TYPE.TEXT || finalItemType == C.TYPE.CARD)) && (blockBodyHtml += ' pb-' + gutter), (isCarousel || isNav) && (blockBodyHtml += ' px-2 px-sm-3 px-md-4 px-lg-5'));
                            switch (columnCount) {
                                case 1: blockBodyHtml += ' row-cols-1">'; break;
                                case 2: blockBodyHtml += ' row-cols-1 row-cols-sm-1 row-cols-md-2">'; break;
                                case 3: blockBodyHtml += ' row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3">'; break;
                                case 4: blockBodyHtml += ' row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4">'; break;
                                case 5: blockBodyHtml += ' row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5">'; break;
                                case 6: blockBodyHtml += ' row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">'; break;
                            }
                        }

                        blockBodyHtml += '<article class="col d-inline-flex' + (finalItemType == C.TYPE.SHOWCASE ? (' sPost" data-title="' + itemTitle + '" data-link="' + linkUrl + '" data-summary="' + tempSnippetText + '" data-vidid="' + videoIdYoutube + '" data-img="' + videoThumbUrl + '" data-toggle="tooltip"') : (finalItemType == C.TYPE.VERTICAL ?'" style='+blockHeightStyle+'"':'"')) + ' role="article">';

                        finalItemType != C.TYPE.SHOWCASE && (blockBodyHtml += '<a class="overflow-hidden w-100 shadow-sm' +
                        (finalItemType != C.TYPE.VERTICAL ? cornerStyle : ' rounded-0') +
                        (finalItemType != C.TYPE.MINIMAL ? ' card' : ' text-bg-'+inverseTheme) +
                        (isRounded ? (' border border-3 border-opacity-75 border-' + theme) : ' border-0') +
                            ((finalItemType == C.TYPE.QUOTE || finalItemType == C.TYPE.VERTICAL) ? ' text-center h-100' : ((finalItemType == C.TYPE.TEXT||finalItemType==C.TYPE.MINIMAL) ? " row g-0" : ((finalItemType == C.TYPE.LIST || finalItemType == C.TYPE.CARD || finalItemType == C.TYPE.GALLERY) ? aspectRatio + (finalItemType == C.TYPE.LIST ? ' mt-' + gutter : '') : ""))) + '" href="' + linkUrl + '" title="' + itemTitle + '">');

                        hasImage && (blockBodyHtml += imageHtml);

                        if (hasHeader && finalItemType != C.TYPE.SHOWCASE && finalItemType != C.TYPE.GALLERY) {
                            switch (finalItemType) {
                                case C.TYPE.MINIMAL: blockBodyHtml+= '<div class="col p-2 ps-0">'; break;
                                    case C.TYPE.TEXT: hasImage && (blockBodyHtml += '<div class="col-8 h-100">');
                                    case C.TYPE.PHOTO: case C.TYPE.QUOTE: blockBodyHtml += '<div class="card-body' + (theme != C.THEME.LIGHT && (finalItemType == C.TYPE.PHOTO || (blockType == C.TYPE.LIST && finalItemType == C.TYPE.TEXT)) ? (' h-100 bg-opacity-75 text-bg-' + theme) : ' text-'+ inverseTheme) + '">';
                                        break;
                                    case C.TYPE.LIST: blockBodyHtml += '<div class="text-bg-' + theme + ' bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content;">Latest</div>';
                                    case C.TYPE.CARD: blockBodyHtml += '<div class="text-bg-' + theme + ' bg-opacity-75 rounded-0 p-5';
                                        switch (textAlignV) {
                                            case C.V_ALIGN.TOP: blockBodyHtml += ' h-auto">'; break;
                                            case C.V_ALIGN.MIDDLE: blockBodyHtml += ' h-auto top-50 translate-middle-y">'; break;
                                            case C.V_ALIGN.BOTTOM: blockBodyHtml += ' h-auto bottom-0" style="top:auto;">'; break;
                                            case C.V_ALIGN.OVERLAY: blockBodyHtml += '">'; break;
                                        }
                                        break;
                                    case C.TYPE.VERTICAL: finalItemType == C.TYPE.VERTICAL && (blockBodyHtml += '<div class="text-bg-' + theme + ' bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ' + ((cornerStyle == " rounded" && textAlignV != C.V_ALIGN.OVERLAY) ? ' rounded-5' : cornerStyle) + ' start-50 translate-middle');
                                        switch (textAlignV) {
                                            case C.V_ALIGN.TOP: blockBodyHtml += '-x mt-5">'; break;
                                            case C.V_ALIGN.MIDDLE: blockBodyHtml += ' top-50">'; break;
                                            case C.V_ALIGN.BOTTOM: blockBodyHtml += '-x  bottom-0 mb-5">'; break;
                                            case C.V_ALIGN.OVERLAY: blockBodyHtml += ' top-50 h-100 w-100">'; break;
                                        }
                                }

                                blockBodyHtml += authorHtml+dateHtml;
                                (finalItemType == C.TYPE.VERTICAL) ? blockBodyHtml += headerDisplay : (finalItemType==C.TYPE.MINIMAL) ? blockBodyHtml+=headerMinimal : blockBodyHtml += headerNormal;
                                blockBodyHtml += snippetHtml;
                                !(finalItemType == C.TYPE.PHOTO || finalItemType == C.TYPE.QUOTE) && (blockBodyHtml += buttonHtml);

                                blockBodyHtml += '</div>';
                                finalItemType == C.TYPE.TEXT && hasImage && (blockBodyHtml += '</div>');
                                (finalItemType == C.TYPE.PHOTO || finalItemType == C.TYPE.QUOTE) && (blockBodyHtml += buttonHtml);
                            }
                        finalItemType != C.TYPE.SHOWCASE && (blockBodyHtml += '</a>');
                        blockBodyHtml += '</article>';

                        (p == (postCount - 1) || (isCarousel && (p % (activeColumns * rowCount) == (activeColumns * rowCount - 1)))) && (blockBodyHtml += '</div>');
                    }

                    if (isCarousel || isNav) {
                        blockBodyHtml += '</div>';

                        let carouselLeft = carouselRight = "";
                        carouselLeft = '<button class="carousel-control-prev link-secondary' + (isNav ? " nav-prev" : " pb-5") + '" type="button" title="Click for Previous" data-bs-target="#m' + blockId + '" data-bs-slide="prev" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg><span class="visually-hidden">Previous</span></button>', carouselRight = '<button class="carousel-control-next link-secondary' + (isNav ? " nav-next" : " pb-5") + '" title="Click for Next" type="button" data-bs-target="#m' + blockId + '" data-bs-slide="next" style="width:5%;"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg><span class="visually-hidden">Next</span></button>';
                        blockBodyHtml += isCarousel ? (carouselLeft + carouselRight) : "";
                        m.append(blockBodyHtml);
                        m.append(carouselIndicators);
                        isNav && ((stage > 1) && m.append(carouselLeft), (stage < totalStages) && m.append(carouselRight));
                    } else { m.append(blockBodyHtml); }

                    let navHtml = "";
                    (!(moreText == "" && blockType == C.TYPE.VERTICAL)) && (navHtml += '<nav aria-label="Page navigation" class="st' + stage + ' w-100 pe-5 py-5 pagination justify-content-end bg-' + theme + '">');
                    if (moreText != "") {
                        for (let i = 0; i < fe.feed.link.length; i++) {
                            const linkItem = fe.feed.link[i];
                            if ("alternate" == linkItem.rel) {
                                const moreLink = linkItem.href;
                                navHtml += '<a class="text-bg-' + theme + ' border-0 ' + (isLowContrast ? "opacity-50" : "opacity-75") + '" href="' + moreLink + '?&max-results=12" title="Click for More">' + moreText + ' <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>';
                            }
                        }
                    }
                    (!(moreText == "" && blockType == C.TYPE.VERTICAL)) && (navHtml += '</nav>');
                    m.after(navHtml);
                }
                else {
                    switch (contentType) {
                        case C.CONTENT.RECENT: element.append('<div class="text-center text-bg-'+theme+' display-6 p-4 w-100">Sorry! No recent updates.</div>'); break;
                        case C.CONTENT.COMMENTS: element.append('<div class="text-center text-bg-'+theme+' display-6 p-4 w-100">No comments. <br/> Start the conversation!</div>'); break;
                        default: element.append('<div class="text-center text-bg-'+theme+' display-6 p-4 w-100">Sorry! No content found for "' + label + '"!</div>');
                    }
                }
            },
            complete: function () {
                if (isNav) {
                    element.find(".nav-prev").unbind('click').click(function () {
                        const sC = (element.attr("data-s"));
                        element.attr("data-s", +sC - 1);
                        element.find(".st" + sC).fadeOut(); element.find(".st" + (sC - 1)).fadeIn();
                    });
                    element.find(".nav-next").unbind('click').click(function () {
                        const sC = (element.attr("data-s"));
                        element.find(".st" + sC).fadeOut();
                        element.attr("data-s", +sC + 1);
                        (element.find(".st" + (+sC + 1)).length == 0) ? mBlocks(element) : element.find(".st" + (+sC + 1)).fadeIn();
                    });
                }
                if (blockType == C.TYPE.SHOWCASE) {
                    const featureContainer = element.find(".feature-image");
                    const featureFigure = featureContainer.find("figure"), featureIframe = featureContainer.find(".sIframe"), featureContent = featureContainer.find(".sContent");
                    featureFigure.click(function () {
                        let e = $(this).attr("data-vidid");
                        if (e !== "regular") {
                            featureIframe.html('<iframe src="https://www.youtube.com/embed/' + e + '?autoplay=1" allowfullscreen="" style="' + blockHeightStyle + 'width:100%;" frameborder="0"></iframe>'), featureIframe.fadeIn(0), featureFigure.fadeOut(0),featureContent.fadeOut(0);
                        }
                    }),
                        element.find(".sPost").map(function () {
                            $(this).click(function () {
                                const v = $(this).attr("data-vidid"),
                                    t = $(this).attr("data-title");
                                let fi = featureFigure.find("svg")||false;
                                if (v.toLowerCase() != "regular") {
                                    itemTitle = "Click here to load the video!";
                                    (fi.length==0)?featureFigure.append('<svg class="position-absolute top-50 translate-middle" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>'):fi.fadeIn(0);
                                } else { itemTitle = t; fi.fadeOut(0); }
                                featureFigure.attr({ style: "background:url(" + $(this).attr("data-img") + ") center center;background-size:cover;" + blockHeightStyle, "data-vidid": v, title: itemTitle, "aria-label": itemTitle });
                                featureIframe.fadeOut(0), featureFigure.fadeIn(0),
                                    featureContent.fadeIn(0), featureContent.find("h5").html(t), featureContent.find("summary").html($(this).attr("data-summary")),
                                    featureContainer.find("a").attr({ href: $(this).attr("data-link"), title: t }), featureContainer.find("button").attr("title", t);
                            })
                        })
                }
            }
        })
    });
}