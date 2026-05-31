import { BLOCK_SHOWCASE, BLOCK_PANCAKE, BLOCK_COMMENT, BLOCK_QUOTE, BLOCK_STACK, BLOCK_COVER, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY, noImg } from '../core/config.js';

export function renderImage(finalType, postID, config, data) {
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
            tooltipAttributes = `data-toggle="tooltip" data-vidid="${videoID}"`;
            if (postID === 0) showcaseImageCode = `<figure class="m-0${imageBSClass}${config.cornerStyle == " rounded" ? ' rounded-5 rounded-bottom' : config.cornerStyle} m-blox-image-to-load" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" title="${postTitle}" aria-label="${postTitle} image" ${tooltipAttributes}></figure>`;
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
