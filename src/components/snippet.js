import { BLOCK_COVER } from '../core/config.js';

export function renderSnippet(finalType, config, postContent, postUrl) {
    if (!config.showSnippet || !postContent) return '';

    const doc = new DOMParser().parseFromString(postContent, 'text/html');
    let snippetText = doc.body.textContent || "";
    if (snippetText.length > config.snippetSize) {
        snippetText = snippetText.substring(0, config.snippetSize) + "...";
    }

    const isOnlyElement = !config.showHeader && !config.showImage && !config.callToAction && !config.showLabels && !config.showDate;

    if (isOnlyElement) {
        return `<a href="${postUrl}" class="after:absolute after:inset-0 z-10 block line-clamp-3 list-none text-body-md font-normal opacity-75 ${(finalType === BLOCK_COVER) ? 'py-6 mx-0 md:mx-10' : ''}" aria-label="Read more">${snippetText}</a>`;
    }

    return `<div class="line-clamp-3 list-none text-body-md font-normal opacity-75 ${(finalType === BLOCK_COVER) ? 'py-6 block mx-0 md:mx-10' : ''}">${snippetText}</div>`;
}
