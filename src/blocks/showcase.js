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
        const showcaseContent = config.showHeader
            ? `<div class="card-img-overlay d-flex flex-column justify-content-end p-0 border-0"><div class="sContent rounded-0 ${config.cornerStyle === " rounded" ? "rounded-top" : ""} mx-md-5 p-3 px-lg-5 bg-${config.dataTheme}">${titleCode} ${snippetCode}</div></div>`
            : '';
        const cta = (config.showImage || config.callToAction !== "") ? ctaButtonCode : "";
        const featureMarginClass = config.callToAction === "" ? ' pb-3' : '';
        return `<div class="feature-image card border-0 text-center bg-${config.dataTheme} overflow-hidden rounded-0${featureMarginClass}"><div class="sIframe d-none"></div>${showcaseImageCode}<a class="link-${config.inverseTheme} text-decoration-none fw-bold" href="${post.url}" title="${post.title}">${showcaseContent}${cta}</a></div>`;
    }

    // Showcase grid post
    const videoAttr = videoID !== 'noVideo' ? ` data-vidid="${videoID}"` : '';
    const articleClasses = `col d-inline-flex sPost`;
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
    const imageTag = `<img class="w-100 h-100 object-fit-cover${lazyLoadClass}" src="${thumbnailUrl}" data-img-high="${highResUrl}" alt="${post.title} image" loading="lazy" title="${post.title}" />`;
    const figureTag = `<figure class="m-0 w-100 img-fluid ${config.aspectRatio.trim()} shadow-sm">${imageTag}</figure>`;

    return `<article class="col d-inline-flex sPost" ${articleDataAttributes} role="article">${figureTag}</article>`;
}
