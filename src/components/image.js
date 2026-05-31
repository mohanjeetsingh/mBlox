import { BLOCK_SHOWCASE, BLOCK_PANCAKE, BLOCK_COMMENT, BLOCK_QUOTE, BLOCK_STACK, BLOCK_COVER, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY, noImg } from '../core/config.js';
import { getVideoIcon, getShowcaseVideoIcon } from './video.js';

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

    let imageCoverStyle = "object-fit:cover !important;height:100% !important;", imageBSClass = ' w-full h-auto', tooltipAttributes = ``;
    let showcaseImageCode = '';
    let figureClass = 'w-full h-full flex';

    switch (finalType) {
        case BLOCK_SHOWCASE:
            tooltipAttributes = `data-toggle="tooltip" data-vidid="${videoID}"`;
            const showcaseYoutubeIcon = getShowcaseVideoIcon(videoID);
            if (postID === 0) showcaseImageCode = `<figure class="m-0${imageBSClass}${config.cornerStyle == " rounded" ? ' rounded-t-3xl' : config.cornerStyle} m-blox-image-to-load relative" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" title="${postTitle}" aria-label="${postTitle} image" ${tooltipAttributes}>${showcaseYoutubeIcon}</figure>`;
            imageBSClass += `${config.aspectRatio}`;
            break;
        case BLOCK_PANCAKE: imageBSClass += ` ${config.aspectRatio.trim()}`; break;
        case BLOCK_COMMENT: imageCoverStyle += ' height:3rem!important;width:3rem!important;'; imageBSClass = ' rounded-full m-2'; figureClass = 'shrink-0 flex items-center justify-center'; break;
        case BLOCK_QUOTE: imageCoverStyle += ' height:6rem!important;width:6rem;'; imageBSClass = ' rounded-full mx-auto mt-6'; break;
        case BLOCK_STACK: 
            imageBSClass = " w-full h-full object-cover"; 
            figureClass = 'w-1/3 shrink-0 h-full flex items-center justify-center'; 
            break;
        case BLOCK_COVER: case BLOCK_LIST: case BLOCK_CARD: case BLOCK_GALLERY: imageBSClass += ` ${config.aspectRatio.trim()}`; break;
    }
    if (config.blurImage && config.contentType !== "comments") imageBSClass += ' blur-5';

    const placeholderSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const isComplexBlock = config.blockType === BLOCK_SHOWCASE || config.blockType === BLOCK_LIST;
    const canBeFixed = isComplexBlock ? postID === 0 && config.isImageFixed : config.isImageFixed;
    const lazyLoadClass = config.isBloggerFeed ? ' m-blox-image-to-load' : '';
    const imageSrc = config.isBloggerFeed ? placeholderSrc : imageURL;
    const youtubeIcon = getVideoIcon(videoID);

    const imageCode = canBeFixed
        ? `<figure class="m-0${imageBSClass}${lazyLoadClass} relative" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" aria-label="${postTitle} image"${tooltipAttributes}>${youtubeIcon}</figure>`
        : `<figure class="m-0 relative ${figureClass}"><img class="${imageBSClass}${lazyLoadClass}" style="${imageCoverStyle}" src="${imageSrc}" data-img-high="${highResImageURL}" alt="${postTitle} image" loading="lazy" title="${postTitle}" ${tooltipAttributes}/>${youtubeIcon}</figure>`;

    return { imageCode, showcaseImageCode, videoThumbnailURL, highResImageURL };
}
