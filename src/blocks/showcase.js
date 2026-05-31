import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_SHOWCASE, noImg } from '../core/config.js';

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

export function render(post, postID, config) {
    const finalType = BLOCK_SHOWCASE;
    const videoID = _getYouTubeVideoId(post);
    
    // Render parts
    const titleCode = renderTitle(finalType, config, post.title);
    const snippetCode = renderSnippet(finalType, config, post.content);
    
    let snippetText = '';
    if (post.content) {
        const doc = new DOMParser().parseFromString(post.content, 'text/html');
        snippetText = doc.body.textContent || "";
        if (snippetText.length > config.snippetSize) {
            snippetText = snippetText.substring(0, config.snippetSize) + "...";
        }
    }

    const ctaButtonCode = renderCTA(finalType, config, post.title);
    
    const { imageCode, showcaseImageCode } = renderImage(finalType, postID, config, {
        postSnippet: post.content,
        videoID: videoID,
        postTitle: post.title,
        thumbnailUrl: post.thumbnailUrl,
        authorImage: post.authorImage
    });

    if (postID === 0 && config.firstInstance) {
        // Large feature block
        const cornerClass = config.cornerStyle === " rounded-none" ? "rounded-none" : "rounded-t-3xl";
        const showcaseContent = config.showHeader
            ? `<div class="absolute inset-0 flex flex-col justify-end p-0 z-10"><div class="sContent ${cornerClass} mx-0 md:mx-10 p-6 md:px-12 ${config.theme.glass} backdrop-blur-md ${config.theme.text}">${titleCode} ${snippetCode}</div></div>`
            : '';
        const cta = (config.showImage || config.callToAction !== "") ? ctaButtonCode : "";
        const featureMarginClass = config.callToAction === "" ? ' pb-3' : '';
        return `<div class="feature-image relative flex flex-col text-center ${config.theme.bg} overflow-hidden rounded-none shadow-sm${featureMarginClass}"><div class="sIframe hidden"></div>${showcaseImageCode}<a class="text-primary no-underline font-bold" href="${post.url}" title="${post.title}">${showcaseContent}${cta}</a></div>`;
    }

    // Showcase grid post
    const videoAttr = videoID !== 'noVideo' ? ` data-vidid="${videoID}"` : '';
    const articleClasses = `col-span-1 inline-flex w-full sPost cursor-pointer relative`;
    const imageHigh = post.thumbnailUrl ? post.thumbnailUrl.replace(/\/s\d+(-[a-z]\d+)*(-c)?/, '/s1600') : noImg;
    const articleDataAttributes = `data-title="${post.title}" data-link="${post.url}" data-summary="${snippetText}"${videoAttr} data-img-high="${imageHigh}" data-toggle="tooltip"`;
    
    return `<article class="${articleClasses}" ${articleDataAttributes} role="article" title="${post.title}">${config.showImage ? imageCode : ''}</article>`;
}

export function renderThumbnail(post, config) {
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
    const videoAttr = videoID !== 'noVideo' ? ` data-vidid="${videoID}"` : '';
    const articleDataAttributes = `data-title="${post.title}" data-link="${post.url}" data-summary="${snippetText}"${videoAttr} data-toggle="tooltip"`;
    const imageTag = `<img class="w-full h-full object-cover${lazyLoadClass}" src="${thumbnailUrl}" data-img-high="${highResUrl}" alt="${post.title} image" loading="lazy" title="${post.title}" />`;
    const figureTag = `<figure class="m-0 w-full ${config.aspectRatio.trim()} shadow-sm overflow-hidden ${config.cornerStyle}">${imageTag}</figure>`;

    return `<article class="col-span-1 inline-flex w-full sPost cursor-pointer relative" ${articleDataAttributes} role="article">${figureTag}</article>`;
}
