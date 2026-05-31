/**
 * mBlox Bootstrap 5 Renderer
 */

const BLOCK_COVER = 'v', BLOCK_SHOWCASE = 's', BLOCK_LIST = 'l', BLOCK_CARD = 'c', BLOCK_GALLERY = 'g', BLOCK_PANCAKE = 'p', BLOCK_STACK = 't', BLOCK_QUOTE = 'q', BLOCK_COMMENT = 'm';
const noImg = window.noImg || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const RESPONSIVE_GRID_CLASSES = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
};

function _getYouTubeVideoId(post) {
    if (post.videoId) return post.videoId;
    if (post.thumbnailUrl && (post.thumbnailUrl.includes("ytimg.com/vi/") || post.thumbnailUrl.includes("youtube.com/vi/"))) {
        const idStartIndex = post.thumbnailUrl.indexOf("/vi/") + 4;
        const nextSlashIndex = post.thumbnailUrl.indexOf('/', idStartIndex);
        if (nextSlashIndex !== -1) return post.thumbnailUrl.substring(idStartIndex, nextSlashIndex);
    }
    if (post.content && post.content.includes('youtube.com/embed/')) {
        const match = post.content.match(/youtube\.com\/embed\/([^?"]+)/);
        return (match && match[1]) ? match[1] : "noVideo";
    }
    return "noVideo";
}

function fadeIn(el) {
    if (!el) return;
    el.style.opacity = 0;
    el.style.display = '';
    (function fade() {
        let val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

function fadeOut(el) {
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

export class M3ERenderer {
    
    buildBlockBody(response, config) {
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

        if (config.blockType === BLOCK_SHOWCASE && config.firstInstance && postsInFeed > 0) {
            const { showcaseHTML: singleShowcaseHTML } = this._createPostHtml(response.posts[0], 0, config);
            showcaseHTML = singleShowcaseHTML;

            const itemsPerSlide = Math.min(postsInFeed, config.actualColumnCount * config.blockRows);
            let currentSlide = 0;

            if (config.isCarousel) {
                for (let i = 0; i < postsInFeed; i++) {
                    if (i % itemsPerSlide === 0) {
                        if (i > 0) blockBody += `</div></div>`; 
                        const activeClass = (i === 0) ? ' active' : '';
                        blockBody += `<div class="carousel-item${activeClass}">`;
                        blockBody += `<div class="grid gap-${config.gutterSize} mx-0 px-2 sm:px-3 md:px-4 lg:px-5 ${RESPONSIVE_GRID_CLASSES[config.columnCount] || ''}">`;

                        if (carouselIndicators) {
                            const indicatorActiveClass = (currentSlide === 0) ? ' active' : '';
                            const ariaCurrent = (currentSlide === 0) ? ' aria-current="true"' : '';
                            carouselIndicators.insertAdjacentHTML('beforeend', `<button type="button" data-bs-target="#m${config.mBlockID}" data-bs-slide-to="${currentSlide}" class="bg-${config.inverseTheme}${indicatorActiveClass}" ${ariaCurrent} aria-label="Slide ${currentSlide + 1}"></button>`);
                            currentSlide++;
                        }
                    }
                    blockBody += this._renderShowcaseThumbnail(response.posts[i], config);
                }
                blockBody += `</div></div>`; 
            } else {
                blockBody += `<div class="grid gap-${config.gutterSize} mx-0 ${RESPONSIVE_GRID_CLASSES[config.columnCount] || ''}">`;
                for (let postID = 0; postID < postsInFeed; postID++) {
                    blockBody += this._renderShowcaseThumbnail(response.posts[postID], config);
                }
                blockBody += `</div>`;
            }
            return { blockBody, carouselIndicators, showcaseHTML };
        }

        for (let postID = 0; postID < postsInFeed; postID++) {
            const post = response.posts[postID];
            let currentColumnCount = config.columnCount;
            if (config.blockType === BLOCK_LIST && postID === 1 && config.showHeader) currentColumnCount--;

            const { postHTML, carouselIndicator } = this._createPostHtml(post, postID, config);

            if (carouselIndicator && config.isCarousel) {
                carouselIndicators.insertAdjacentHTML('beforeend', carouselIndicator);
            }

            const isFirstItemInLoop = postID === 0;
            const startNewRow = isFirstItemInLoop ||
                (config.isCarousel && postID % (config.actualColumnCount * config.blockRows) === 0) ||
                (config.blockType === BLOCK_LIST && postID === 1);

            if (startNewRow) {
                if (postID > 0) {
                    const prevPostID = postID - 1;
                    const wasPrevLastItemInSlide = config.isCarousel && (prevPostID % (config.actualColumnCount * config.blockRows) === (config.actualColumnCount * config.blockRows - 1));
                    if (!wasPrevLastItemInSlide) {
                        blockBody += `</div>`;
                    }
                }
                blockBody += `<div class="grid gap-${config.gutterSize} mx-0`;
                if (config.isCarousel) blockBody += ' carousel-item' + (postID === 0 ? ' active' : '');
                if (isComplexLayout && config.blockType === BLOCK_LIST) blockBody += ' col flex-grow-1';
                if (config.blockType === BLOCK_LIST) blockBody += ' px-0';
                else if (config.blockType !== BLOCK_COVER) blockBody += ' px-2 px-sm-3 px-md-4 px-lg-5';
                blockBody += ` ${RESPONSIVE_GRID_CLASSES[currentColumnCount] || RESPONSIVE_GRID_CLASSES[6]}">`;
            }

            blockBody += postHTML;
            const isLastItemInSlide = config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) === (config.actualColumnCount * config.blockRows - 1));
            const isLastPostOverall = postID === (postsInFeed - 1);
            if (isLastPostOverall || isLastItemInSlide) blockBody += `</div>`;
        }

        return { blockBody, carouselIndicators, showcaseHTML };
    }

    _createPostHtml(post, postID, config) {
        if (config.blockType === BLOCK_SHOWCASE && postID > 0) {
            const postHTML = this._renderShowcaseThumbnail(post, config);
            return { postHTML, showcaseHTML: '', carouselIndicator: '' };
        }

        let finalType = config.blockType; 
        if (config.blockType === BLOCK_LIST && postID > 0) {
            finalType = config.showHeader ? BLOCK_STACK : BLOCK_CARD;
        }

        const videoID = _getYouTubeVideoId(post);
        const postTitle = post.title;
        const postSnippet = (config.showSnippet || config.showImage) && post.content;

        const parts = {
            postURL: post.url,
            videoID,
            postTitle,
            authorCode: this._renderAuthor(finalType, config, post.authorName, post.authorUri),
            dateCode: this._renderDate(config, post.publishedDate),
            ...this._renderPostHeader(finalType, config, postTitle),
            ...this._renderSnippet(finalType, config, postSnippet),
            ctaButtonCode: this._renderCTA(finalType, config, postTitle),
            ...this._renderImage(finalType, postID, config, {
                postSnippet, videoID, postTitle,
                thumbnailUrl: post.thumbnailUrl,
                authorImage: post.authorImage
            })
        };

        const { postHTML, showcaseHTML } = this._renderPostByType(finalType, postID, config, parts);

        let carouselIndicator = '';
        if (config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) == 0)) {
            const slideIndex = postID / (config.actualColumnCount * config.blockRows);
            const activeClass = postID === 0 ? ' active' : '';
            const ariaCurrent = postID === 0 ? 'aria-current="true"' : '';
            carouselIndicator = `<button type="button" data-bs-target="#m${config.mBlockID}" data-bs-slide-to="${slideIndex}" class="bg-${config.inverseTheme}${activeClass}" ${ariaCurrent} aria-label="Slide ${slideIndex + 1}"></button>`;
        }

        return { postHTML, showcaseHTML, carouselIndicator };
    }

    _renderShowcaseThumbnail(post, config) {
        const videoID = _getYouTubeVideoId(post);
        let thumbnailUrl = post.thumbnailUrl || noImg;
        let highResUrl = thumbnailUrl;

        if (videoID !== 'noVideo' && highResUrl.includes('ytimg.com')) {
            highResUrl = highResUrl.replace(/\/([^\/]+)$/, '/maxresdefault.jpg');
        } else {
            highResUrl = highResUrl.replace(/\/s\d+(-c)?/, '/s1600').replace(/\/w\d+-h\d+(-c)?/, '/s1600');
        }

        const snippetText = (post.content || "").replace(/<[^>]*>/g, "").substring(0, config.snippetSize) + "...";
        if (!thumbnailUrl || thumbnailUrl.includes('no-image.png')) thumbnailUrl = noImg;
        if (!highResUrl || highResUrl.includes('no-image.png')) highResUrl = noImg;

        const lazyLoadClass = config.isBloggerFeed ? ' m-blox-image-to-load' : '';
        const articleDataAttributes = `data-title="${post.title}" data-link="${post.url}" data-summary="${snippetText}" data-vidid="${videoID}" data-toggle="tooltip"`;
        const imageTag = `<img class="w-100 h-100${lazyLoadClass}" style="object-fit:cover !important;" src="${thumbnailUrl}" data-img-high="${highResUrl}" alt="${post.title} image" loading="lazy" title="${post.title}" />`;
        const figureTag = `<figure class="m-0 w-100 img-fluid ${config.aspectRatio.trim()} shadow-sm">${imageTag}</figure>`;

        return `<article class="col d-inline-flex sPost" ${articleDataAttributes} role="article">${figureTag}</article>`;
    }

    _renderPostByType(finalType, postID, config, parts) {
        const { postURL, postTitle, imageCode, ...contentParts } = parts;
        const textContentHTML = this._renderPostContent(finalType, config, contentParts);

        if (finalType === BLOCK_SHOWCASE) {
            if (postID === 0 && config.firstInstance) {
                return { postHTML: '', showcaseHTML: this._renderShowcaseFeature(config, parts) };
            }
            return { postHTML: this._renderShowcaseGridPost(config, parts), showcaseHTML: '' };
        }

        const linkClasses = this._getLinkWrapperClasses(finalType, config);
        const linkWrapperStart = `<a class="${linkClasses}" href="${postURL}" title="${postTitle}">`;
        const linkWrapperEnd = `</a>`;
        const articleClasses = this._getArticleClasses(finalType, parts);
        const articleStyle = finalType === BLOCK_COVER ? ` style="${config.articleHeight}"` : '';

        const postHTML = `<article class="${articleClasses}"${articleStyle} role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
        return { postHTML, showcaseHTML: '' };
    }

    _renderShowcaseGridPost(config, parts) {
        const { imageCode, postTitle } = parts;
        const articleClasses = this._getArticleClasses(BLOCK_SHOWCASE, parts);
        return `<article class="${articleClasses}" role="article" title="${postTitle}">${config.showImage ? imageCode : ''}</article>`;
    }

    _renderShowcaseFeature(config, parts) {
        const { postURL, postTitle, normalHeaderCode, snippetCode, ctaButtonCode, showcaseImageCode } = parts;
        const showcaseContent = config.showHeader
            ? `<div class="sContent card-img-overlay rounded-0 ${config.cornerStyle === " rounded" ? "rounded-top" : ""} mx-md-5 p-3 px-lg-5 bg-${config.dataTheme} mt-auto" style="height:fit-content !important;">${normalHeaderCode} ${snippetCode}</div>`
            : '';
        const cta = (config.showImage || config.callToAction !== "") ? ctaButtonCode : "";
        const featureMarginClass = config.callToAction === "" ? ' pb-3' : '';
        return `<div class="feature-image card border-0 text-center bg-${config.dataTheme} overflow-hidden rounded-0${featureMarginClass}"><div class="sIframe" style="display:none !important;"></div>${showcaseImageCode}<a class="link-${config.inverseTheme}" href="${postURL}" title="${postTitle}">${showcaseContent}${cta}</a></div>`;
    }

    _renderAuthor(finalType, config, authorName, authorUri) {
        if (!config.showAuthor) return '';
        let authorCode = '';
        const authorURL = (authorName === "Anonymous" || authorName === "Unknown" || !authorUri) ? '' : authorUri;
        const authorNameHTML = `<span class="small fw-lighter" rel="author">${authorName}</span>`;
        const authorLinkHTML = `<a href="${authorURL}" class="small fw-lighter" rel="author">${authorName}</a>`;

        switch (finalType) {
            case BLOCK_QUOTE: authorCode = `<figcaption class="small fw-lighter">- ${authorName}</figcaption>`; break;
            case BLOCK_COMMENT: authorCode = `<span class="small text-${config.dataTheme}" rel="author">${authorName}</span>`; break;
            default: authorCode = authorURL ? authorLinkHTML : authorNameHTML; break;
        }
        return authorCode;
    }

    _renderDate(config, publishedDate) {
        if (!config.showDate) return '';
        const formattedDate = config.dateFormatter.format(new Date(publishedDate));
        return `<span class="small fw-lighter">${config.showAuthor ? ' &#8226; ' : ''} ${formattedDate}</span>`;
    }

    _renderPostHeader(finalType, config, postTitle) {
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

    _renderSnippet(finalType, config, postSnippet) {
        if (!config.showSnippet || !postSnippet) return { snippetText: '', snippetCode: '' };
        const doc = new DOMParser().parseFromString(postSnippet, 'text/html');
        let snippetText = doc.body.textContent || "";
        if (snippetText.length > config.snippetSize) snippetText = snippetText.substring(0, config.snippetSize) + "...";
        const snippetCode = `<summary class="list-unstyled ${config.dataTheme == "light" ? 'text-muted' : 'opacity-75'} ${finalType == BLOCK_COVER ? 'py-3 d-block mx-lg-5' : ''} ${config.lowContrast ? 'opacity-75' : ''}">${snippetText}</summary>`;
        return { snippetText, snippetCode };
    }

    _renderImage(finalType, postID, config, data) {
        if (!config.showImage) return { imageCode: '', showcaseImageCode: '', videoThumbnailURL: '', highResImageURL: '' };
        const { postSnippet, videoID, postTitle, thumbnailUrl, authorImage } = data;
        let videoThumbnailURL = thumbnailUrl || "";
        let imageURL = videoThumbnailURL;

        if (!imageURL) {
            if (config.contentType == 'comments') {
                if (authorImage && !authorImage.includes('blogblog.com')) imageURL = authorImage;
                else imageURL = noImg;
            } else {
                const contentParser = new DOMParser().parseFromString(postSnippet || "", 'text/html');
                const firstImage = contentParser.querySelector("img");
                imageURL = firstImage ? firstImage.getAttribute("src") : noImg;
            }
        }
        if (!videoThumbnailURL) videoThumbnailURL = imageURL;
        let highResImageURL = imageURL;
        if (config.isBloggerFeed) highResImageURL = highResImageURL.replace(/\/s\d+(-[a-z]\d+)*(-c)?/, '/s1600');
        else if (videoID !== 'noVideo' && highResImageURL && highResImageURL.includes('ytimg.com')) highResImageURL = highResImageURL.replace(/\/([^\/]+)$/, '/maxresdefault.jpg'); 

        let imageCoverStyle = "object-fit:cover !important;height:100% !important;", imageBSClass = ' w-100 img-fluid', tooltipAttributes = ``;
        let showcaseImageCode = '';

        switch (finalType) {
            case BLOCK_SHOWCASE:
                tooltipAttributes = `" data-toggle="tooltip" data-vidid="${videoID}"`;
                if (postID === 0) showcaseImageCode = `<figure class="m-0${imageBSClass}${config.cornerStyle == " rounded" ? ' rounded-5 rounded-bottom' : config.cornerStyle} m-blox-image-to-load" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" title="${postTitle}" aria-label="${postTitle} image"${tooltipAttributes}></figure>`;
                imageBSClass += `${config.aspectRatio} shadow-sm`;
                break;
            case BLOCK_PANCAKE: imageBSClass += ` ${config.aspectRatio.trim()}`; break;
            case BLOCK_COMMENT: imageCoverStyle += ' height:3rem!important;width:3rem!important;'; imageBSClass = ' rounded-circle m-2'; break;
            case BLOCK_QUOTE: imageCoverStyle += ' height:6rem!important;width:6rem;'; imageBSClass = ' rounded-circle mx-auto mt-3'; break;
            case BLOCK_STACK: imageBSClass = " col-4 h-100"; break;
            case BLOCK_COVER: case BLOCK_LIST: case BLOCK_CARD: case BLOCK_GALLERY: imageBSClass += ` ${config.aspectRatio.trim()}`; break;
        }
        if (config.blurImage && config.contentType !== "comments") imageBSClass += ' blur-5';

        const placeholderSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        const isComplexBlock = config.blockType === BLOCK_SHOWCASE || config.blockType === BLOCK_LIST;
        const canBeFixed = isComplexBlock ? postID === 0 && config.isImageFixed : config.isImageFixed;
        const lazyLoadClass = config.isBloggerFeed ? ' m-blox-image-to-load' : '';
        const imageSrc = config.isBloggerFeed ? placeholderSrc : imageURL;
        const imageCode = canBeFixed
            ? `<figure class="m-0${imageBSClass}${lazyLoadClass}" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" aria-label="${postTitle} image"${tooltipAttributes}></figure>`
            : `<img class="${imageBSClass}${lazyLoadClass}" style="${imageCoverStyle}" src="${imageSrc}" data-img-high="${highResImageURL}" alt="${postTitle} image" loading="lazy" title="${postTitle}" ${tooltipAttributes}/>`;

        return { imageCode, showcaseImageCode, videoThumbnailURL, highResImageURL };
    }

    _renderCTA(finalType, config, postTitle) {
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

    _getLinkWrapperClasses(finalType, config) {
        const classes = ['overflow-hidden', 'w-100', 'shadow-sm'];
        classes.push(finalType !== BLOCK_COVER ? config.cornerStyle : 'rounded-0');
        classes.push(finalType !== BLOCK_COMMENT ? 'card' : `text-bg-${config.inverseTheme}`);
        classes.push(config.hasRoundedBorder ? `border border-3 border-opacity-75 border-${config.dataTheme}` : 'border-0');

        switch (finalType) {
            case BLOCK_QUOTE: case BLOCK_COVER: classes.push('text-center', 'h-100'); break;
            case BLOCK_STACK: classes.push('h-100');
            case BLOCK_COMMENT: classes.push('row', 'g-0'); break;
            case BLOCK_LIST: classes.push(config.aspectRatio.trim(), `mt-${config.gutterSize}`); break;
            case BLOCK_CARD: case BLOCK_GALLERY: classes.push(config.aspectRatio.trim());
            case BLOCK_PANCAKE: classes.push('h-100'); break;
        }
        return classes.join(' ');
    }

    _getArticleClasses(finalType, postData) {
        if (finalType === BLOCK_SHOWCASE && postData.videoID) {
            const { postTitle, postURL, snippetText, videoID, videoThumbnailURL, highResImageURL } = postData;
            return `col d-inline-flex sPost" data-title="${postTitle}" data-link="${postURL}" data-summary="${snippetText}" data-vidid="${videoID}" data-img="${videoThumbnailURL}" data-img-high="${highResImageURL}" data-toggle="tooltip"`;
        }
        return 'col d-inline-flex';
    }

    _renderPostContent(finalType, config, contentParts) {
        if (!config.showHeader || finalType === BLOCK_GALLERY) return '';
        const { authorCode, dateCode, displayHeaderCode, commentHeaderCode, normalHeaderCode, snippetCode, ctaButtonCode } = contentParts;
        let textContentHTML = '';

        switch (finalType) {
            case BLOCK_COMMENT: textContentHTML += `<div class="col p-2 ps-0">`; break;
            case BLOCK_STACK: config.showImage && (textContentHTML += '<div class="col-8 h-100">');
            case BLOCK_PANCAKE: case BLOCK_QUOTE: textContentHTML += `<div class="card-body${(config.dataTheme != "light" && (finalType == BLOCK_PANCAKE || (config.blockType == BLOCK_LIST && finalType == BLOCK_STACK)) ? ` h-100 bg-opacity-75 text-bg-${config.dataTheme}` : ` text-${config.inverseTheme}`)}">`; break;
            case BLOCK_LIST: textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 rounded-0 ps-5 py-3" style="height:fit-content !important;">Latest</div>`;
            case BLOCK_CARD: textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 rounded-0 p-5`;
                switch (config.textVerticalAlign) {
                    case "top": textContentHTML += ' h-auto">'; break;
                    case "middle": textContentHTML += ' h-auto top-50 translate-middle-y">'; break;
                    case "bottom": textContentHTML += ' h-auto bottom-0" style="top:auto !important;">'; break;
                    case "overlay": textContentHTML += '">'; break;
                } break;
            case BLOCK_COVER: finalType == BLOCK_COVER && (textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ${((config.cornerStyle == " rounded" && config.textVerticalAlign != "overlay") ? ' rounded-5' : config.cornerStyle)} start-50 translate-middle`);
                switch (config.textVerticalAlign) {
                    case "top": textContentHTML += '-x mt-5">'; break;
                    case "middle": textContentHTML += ' top-50">'; break;
                    case "bottom": textContentHTML += '-x  bottom-0 mb-5">'; break;
                    case "overlay": textContentHTML += ' top-50 h-100 w-100">'; break;
                } break;
        }

        if (finalType !== BLOCK_QUOTE) textContentHTML += `${authorCode}${dateCode}`;
        if (finalType === BLOCK_COVER) textContentHTML += displayHeaderCode; else if (finalType === BLOCK_COMMENT) textContentHTML += commentHeaderCode; else textContentHTML += normalHeaderCode;
        textContentHTML += snippetCode;
        if (finalType === BLOCK_QUOTE) textContentHTML += `${authorCode}${dateCode}`;
        if (finalType !== BLOCK_PANCAKE && finalType !== BLOCK_QUOTE) textContentHTML += ctaButtonCode;
        textContentHTML += `</div>`;
        if (finalType === BLOCK_STACK && config.showImage) textContentHTML += `</div>`;
        if (finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) textContentHTML += ctaButtonCode; 
        return textContentHTML;
    }

    createBlockHeader(config) {
        if (!config.dataTitle) return '';
        const descriptionHTML = config.dataDescription ? `<span class="pb-3 text-black-50">${config.dataDescription}</span>` : '';
        const titleClasses = `display-5 fw-bold text-${config.inverseTheme} py-3 m-0 ${config.lowContrast ? "opacity-50" : ""}`;
        return `<div class="text-center m-0 bg-${config.dataTheme} py-5"><h4 class="${titleClasses}">${config.dataTitle}</h4>${descriptionHTML}</div>`;
    }

    createBlockFooter(config, response) {
        if (config.moreText === "" && config.blockType === BLOCK_COVER) return '';
        let moreLinkHTML = '';
        if (config.moreText !== "") {
            if (response.feedUrl) {
                const linkClasses = `text-bg-${config.dataTheme} border-0 ${config.lowContrast ? "opacity-50" : "opacity-75"}`;
                moreLinkHTML = `<a class="${linkClasses}" href="${response.feedUrl}?&max-results=12" title="Click for More">
                                ${config.moreText} <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>`;
            }
        }
        return `<nav aria-label="Page navigation" class="st${config.stageID} w-100 pe-5 py-5 pagination justify-content-end bg-${config.dataTheme}">${this._createPaginationButtons(config)}${moreLinkHTML}</nav>`;
    }

    _createPaginationButtons(config) {
        if (config.containsNavigation || config.isCarousel) return '';
        const prevClass = `nav-prev link-${config.inverseTheme} page-link bg-${config.dataTheme} border-0`;
        const nextClass = `nav-next link-${config.inverseTheme} page-link bg-${config.dataTheme} border-0`;
        return `<ul class="pagination mb-0" style="z-index:9;">
            <li class="page-item">
                <button class="${prevClass}" type="button" title="Previous">
                    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg>
                </button>
            </li>
            <li class="page-item">
                <button class="${nextClass}" type="button" title="Next">
                    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
                </button>
            </li>
        </ul>`;
    }

    createCarouselControls(config) {
        const prevClass = `carousel-control-prev link-secondary${config.containsNavigation ? " nav-prev" : " pb-5"}`;
        const nextClass = `carousel-control-next link-secondary${config.containsNavigation ? " nav-next" : " pb-5"}`;
        const target = `#m${config.mBlockID}`;
        const prev = `<button class="${prevClass}" type="button" title="Click for Previous" data-bs-target="${target}" data-bs-slide="prev" style="width:5% !important;">
                <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg>
                <span class="visually-hidden">Previous</span>
              </button>`;
        const next = `<button class="${nextClass}" title="Click for Next" type="button" data-bs-target="${target}" data-bs-slide="next" style="width:5% !important;">
                <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
                <span class="visually-hidden">Next</span>
              </button>`;
        return { prev, next };
    }

    bindEvents(rawElement, config) {
        this._bindShowcaseEvents(rawElement, config);
        this._bindPaginationEvents(rawElement, config);
        if (config.isCarousel && window.bootstrap && window.bootstrap.Carousel) {
            const carouselEl = rawElement.querySelector('.carousel');
            if (carouselEl) {
                const carousel = window.bootstrap.Carousel.getOrCreateInstance(carouselEl, {
                    interval: 5000,
                    ride: 'carousel',
                    wrap: config.wrap !== false
                });
                carousel.cycle();
            }
        }
    }

    _bindShowcaseEvents(rawElement, config) {
        const featuredImageNode = rawElement.closest('.mBlock, .mBlockL')?.querySelector('.feature-image');
        const contentWrapper = rawElement.querySelector('.sFeature'); 
        if (!featuredImageNode || !contentWrapper) return;
        const figureNode = featuredImageNode.querySelector('figure');
        const iFrameNode = featuredImageNode.querySelector('.sIframe');
        const contentNode = featuredImageNode.querySelector('.sContent');

        const postElements = contentWrapper.querySelectorAll('.sPost');
        const postData = Array.from(postElements).map((el, index) => {
            el.setAttribute('data-index', index); 
            return {
                vidid: el.getAttribute('data-vidid'),
                title: el.getAttribute('data-title'),
                summary: el.getAttribute('data-summary'),
                link: el.getAttribute('data-link'),
                imgHigh: el.querySelector('img')?.getAttribute('data-img-high') || ''
            };
        });

        if (figureNode) {
            figureNode.addEventListener('click', function () {
                const videoId = this.getAttribute('data-vidid');
                if (videoId && videoId !== "noVideo") {
                    if (iFrameNode) {
                        const src = `https://www.youtube-nocookie.com/embed/${videoId}`;
                        iFrameNode.innerHTML = `<iframe src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;" width="100%" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="${config.articleHeight}"></iframe>`;
                        fadeIn(iFrameNode);
                        fadeOut(figureNode);
                        if (contentNode) fadeOut(contentNode);
                    }
                } else {
                    const link = featuredImageNode.querySelector('a');
                    if (link && link.href) window.location.href = link.href;
                }
            });
        }

        contentWrapper.addEventListener('click', function (event) {
            const clickedPost = event.target.closest('.sPost');
            if (!clickedPost) return; 
            const postIndex = clickedPost.getAttribute('data-index');
            if (postIndex === null || !postData[postIndex]) return;
            const data = postData[postIndex];

            if (figureNode) {
                let playIcon = figureNode.querySelector('svg');
                if (data.vidid && data.vidid !== 'noVideo') {
                    if (!playIcon) {
                        figureNode.insertAdjacentHTML('beforeend', `<svg class="position-absolute top-50 start-50 translate-middle" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>`);
                    } else if (playIcon.style.display === 'none') fadeIn(playIcon);
                    figureNode.title = "Click here to load the video!";
                } else if (playIcon) {
                    fadeOut(playIcon);
                    figureNode.title = data.title;
                }
                figureNode.setAttribute('data-vidid', data.vidid);
                figureNode.style.backgroundImage = `url(${data.imgHigh})`;
                figureNode.style.backgroundSize = 'cover';
            }

            fadeOut(iFrameNode);
            fadeIn(figureNode);
            if (contentNode) {
                fadeIn(contentNode);
                const h5 = contentNode.querySelector('h5');
                if (h5) h5.textContent = data.title;
                const summary = contentNode.querySelector('summary');
                if (summary) summary.textContent = data.summary;
            }

            const link = featuredImageNode.querySelector('a');
            if (link) { link.href = data.link; link.title = data.title; }
            const button = featuredImageNode.querySelector('button');
            if (button) button.title = data.title;
        });
    }

    _bindPaginationEvents(rawElement, config) {
        if (!config) return;
        const stage = config.stageID;
        const prevButtons = rawElement.querySelectorAll(`.st${stage} .nav-prev, nav.st${stage} .nav-prev`);
        const nextButtons = rawElement.querySelectorAll(`.st${stage} .nav-next, nav.st${stage} .nav-next`);

        prevButtons.forEach(prevButton => {
            if (prevButton.dataset.bound) return;
            prevButton.dataset.bound = "true";
            prevButton.addEventListener('click', () => {
                const currentStage = parseInt(rawElement.getAttribute("data-s"), 10);
                if (currentStage <= 1) return;
                const prevStage = currentStage - 1;
                rawElement.setAttribute("data-s", prevStage);
                fadeOut(rawElement.querySelector(`div.st${currentStage}`));
                fadeOut(rawElement.querySelector(`nav.st${currentStage}`));
                fadeIn(rawElement.querySelector(`div.st${prevStage}`));
                fadeIn(rawElement.querySelector(`nav.st${prevStage}`));
            });
        });

        nextButtons.forEach(nextButton => {
            if (nextButton.dataset.bound) return;
            nextButton.dataset.bound = "true";
            nextButton.addEventListener('click', () => {
                const currentStage = parseInt(rawElement.getAttribute("data-s"), 10);
                const nextStage = currentStage + 1;
                rawElement.setAttribute("data-s", nextStage);
                fadeOut(rawElement.querySelector(`div.st${currentStage}`));
                const currentFooter = rawElement.querySelector(`nav.st${currentStage}`);
                const nextStageEl = rawElement.querySelector(`div.st${nextStage}`);
                if (nextStageEl) {
                    if (currentFooter) fadeOut(currentFooter);
                    fadeIn(nextStageEl);
                    fadeIn(rawElement.querySelector(`nav.st${nextStage}`));
                } else {
                    if (currentFooter) fadeOut(currentFooter);
                    // Needs engine.js to reload data if nextStageEl is not found
                    const customEvent = new CustomEvent('mblox:loadNextPage', { detail: { element: rawElement } });
                    rawElement.dispatchEvent(customEvent);
                }
            });
        });
    }
}
