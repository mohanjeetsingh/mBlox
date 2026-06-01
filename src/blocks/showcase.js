import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_SHOWCASE, noImg } from '../core/config.js';

import { getYouTubeVideoId, getVideoIcon } from '../components/video.js';

export function render(post, postID, config) {
    const finalType = BLOCK_SHOWCASE;
    const videoID = getYouTubeVideoId(post);

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
        snippetText = snippetText.replace(/"/g, '&quot;');
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
        const cta = (config.showImage || config.callToAction !== "") ? ctaButtonCode : "";

        let showcaseContent = '';
        if (config.showHeader || cta) {
            const hsCode = config.showHeader ? `<div class="flex-grow text-left">${titleCode} ${snippetCode}</div>` : '';
            const ctaCode = cta ? `<div class="flex-shrink-0 mt-4 md:mt-0 md:ml-6 flex items-center justify-end w-full md:w-auto">${cta}</div>` : '';

            showcaseContent = `<div class="absolute inset-0 flex flex-col justify-end p-0 z-10 pointer-events-none"><div class="sContent flex flex-col md:flex-row items-start md:items-center justify-between ${cornerClass} p-6 md:px-12 ${config.theme.glass} backdrop-blur-xl ${config.theme.text} pointer-events-auto">${hsCode}${ctaCode}</div></div>`;
        }

        return `<div class="feature-image relative flex flex-col text-center overflow-hidden rounded-none mb-4"><div class="sIframe hidden"></div>${showcaseImageCode}<a class="text-primary block absolute inset-0 z-20" href="${post.url}" title="${post.title}">${showcaseContent}</a></div>`;
    }

    // Showcase grid post
    const videoAttr = (videoID && videoID !== 'noVideo') ? ` data-vidid="${videoID}"` : '';
    const ringClasses = (postID === 0 && config.firstInstance) ? ' ring-4 ring-primary ring-inset' : '';
    const articleClasses = `col-span-1 inline-flex w-full sPost cursor-pointer relative ${config.interactionClasses}${ringClasses}`;
    let imageHigh = noImg;
    if (videoID && videoID !== 'noVideo') imageHigh = `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`;
    else if (post.thumbnailUrl) imageHigh = post.thumbnailUrl.replace(/\/s\d+(-[a-z]\d+)*(-c)?/, '/s1600');
    
    const escapedTitle = post.title.replace(/"/g, '&quot;');
    const articleDataAttributes = `data-title="${escapedTitle}" data-link="${post.url}" data-summary="${snippetText}"${videoAttr} data-img-high="${imageHigh}" data-toggle="tooltip"`;

    return `<article class="${articleClasses}" ${articleDataAttributes} role="article" title="${escapedTitle}">${config.showImage ? imageCode : ''}</article>`;
}

export function renderThumbnail(post, config) {
    const videoID = getYouTubeVideoId(post);
    let thumbnailUrl = post.thumbnailUrl || noImg;
    let highResUrl = thumbnailUrl;

    if (videoID && videoID !== 'noVideo' && highResUrl.includes('ytimg.com')) {
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
    const youtubeIcon = getVideoIcon(videoID);
    const figureTag = `<figure class="m-0 w-full ${config.aspectRatio.trim()} overflow-hidden ${config.cornerStyle} relative">${imageTag}${youtubeIcon}</figure>`;

    return `<article class="col-span-1 inline-flex w-full sPost cursor-pointer relative ${config.interactionClasses}" ${articleDataAttributes} role="article">${figureTag}</article>`;
}
