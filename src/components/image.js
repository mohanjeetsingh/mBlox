import { BLOCK_SHOWCASE, BLOCK_PANCAKE, BLOCK_COMMENT, BLOCK_QUOTE, BLOCK_STACK, BLOCK_COVER, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY, noImg } from '../core/config.js';
import { getVideoIcon, getShowcaseVideoIcon } from './video.js';

export function renderImage(finalType, postID, config, data) {
    if (!config.showImage) return { imageCode: '', showcaseImageCode: '', videoThumbnailURL: '', highResImageURL: '' };
    const { postSnippet, videoID, postTitle, thumbnailUrl, authorImage } = data;
    let videoThumbnailURL = thumbnailUrl || "";
    let imageURL = videoThumbnailURL || config.imageURL || noImg;

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
    if (videoID && videoID !== 'noVideo') highResImageURL = `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`;
    else if (config.isBloggerFeed) highResImageURL = highResImageURL.replace(/\/s\d+(-[a-z]\d+)*(-c)?/, '/s1600');

    const IMAGE_CONFIG_MAP = {
        [BLOCK_SHOWCASE]: { bs: [config.aspectRatio.trim()], figure: 'w-full h-full flex' },
        [BLOCK_PANCAKE]: { bs: [config.aspectRatio.trim()], figure: 'w-full h-full flex' },
        [BLOCK_COMMENT]: { 
            style: 'object-fit:cover !important;height:3rem!important;width:3rem!important;', 
            bs: ['rounded-full', 'm-2'], 
            figure: 'shrink-0 flex items-center justify-center' 
        },
        [BLOCK_QUOTE]: { 
            style: 'object-fit:cover !important;height:6rem!important;width:6rem;', 
            bs: ['rounded-full', 'mx-auto', 'mt-6'], 
            figure: 'w-full h-full flex' 
        },
        [BLOCK_STACK]: { 
            bs: ['h-full', 'object-cover'], 
            figure: 'w-1/3 shrink-0 h-full flex items-center justify-center' 
        },
        [BLOCK_COVER]: { bs: [config.aspectRatio.trim()], figure: 'w-full h-full flex' },
        [BLOCK_LIST]: { bs: [config.aspectRatio.trim()], figure: 'w-full h-full flex' },
        [BLOCK_CARD]: { bs: [config.aspectRatio.trim()], figure: 'w-full h-full flex' },
        [BLOCK_GALLERY]: { bs: [config.aspectRatio.trim()], figure: 'w-full h-full flex' }
    };

    const imgConf = IMAGE_CONFIG_MAP[finalType] || { bs: [], figure: 'w-full h-full flex' };
    
    let imageCoverStyle = imgConf.style || "object-fit:cover !important;height:100% !important;";
    const imageBSClasses = imgConf.bs.length > 0 ? [...imgConf.bs] : ['w-full', 'h-auto'];
    if (finalType !== BLOCK_COMMENT && finalType !== BLOCK_QUOTE && finalType !== BLOCK_STACK) {
        imageBSClasses.unshift('w-full', 'h-auto');
    }
    let figureClass = imgConf.figure;
    
    let tooltipAttributes = ``;
    let showcaseImageCode = '';

    if (finalType === BLOCK_SHOWCASE) {
        tooltipAttributes = `data-toggle="tooltip" data-vidid="${videoID}"`;
        const showcaseYoutubeIcon = getShowcaseVideoIcon(videoID);
        const corner = config.cornerStyle === " rounded" ? ' rounded-t-3xl' : config.cornerStyle;
        if (postID === 0) showcaseImageCode = `<figure class="m-0 ${imageBSClasses.join(' ')} ${config.aspectRatio} ${corner} m-blox-image-to-load relative" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" title="${postTitle}" aria-label="${postTitle} image" ${tooltipAttributes}>${showcaseYoutubeIcon}</figure>`;
    }

    if (config.blurImage && config.contentType !== "comments") imageBSClasses.push('blur-sm');

    const placeholderSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const isComplexBlock = config.blockType === BLOCK_SHOWCASE || config.blockType === BLOCK_LIST;
    const canBeFixed = isComplexBlock ? postID === 0 && config.isImageFixed : config.isImageFixed;
    const lazyLoadClass = config.isBloggerFeed ? ' m-blox-image-to-load' : '';
    const imageSrc = config.isBloggerFeed ? placeholderSrc : imageURL;
    const youtubeIcon = getVideoIcon(videoID);

    const imgTagClasses = `w-full ${imageBSClasses.join(' ')} ${lazyLoadClass}`.replace(/\s+/g, ' ');
    const fixedFigureClass = `m-0 relative ${figureClass} ${imageBSClasses.join(' ')} ${lazyLoadClass}`.replace(/\s+/g, ' ');

    const imageCode = canBeFixed
        ? `<figure class="${fixedFigureClass}" data-img-high="${highResImageURL}" data-is-fixed="true" style="${config.articleHeight}" role="img" loading="lazy" aria-label="${postTitle} image"${tooltipAttributes}>${youtubeIcon}</figure>`
        : `<figure class="m-0 relative ${figureClass}"><img class="${imgTagClasses}" style="${imageCoverStyle}" src="${imageSrc}" data-img-high="${highResImageURL}" alt="${postTitle} image" loading="lazy" title="${postTitle}" ${tooltipAttributes}/>${youtubeIcon}</figure>`;

    return { imageCode, showcaseImageCode, videoThumbnailURL, highResImageURL };
}
