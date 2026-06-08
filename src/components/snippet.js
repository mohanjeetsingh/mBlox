import { BLOCK_COVER, LINE_CLAMP_CLASSES } from '../core/config.js';

export function renderSnippet(finalType, config, postContent, postUrl) {
    if (!config.showSnippet || !postContent) return '';

    const doc = new DOMParser().parseFromString(postContent, 'text/html');
    let snippetText = doc.body.textContent || "";
    snippetText = snippetText.trim();
    if (!snippetText) return '';

    const isOnlyElement = !config.showHeader && !config.showImage && !config.callToAction && !config.showLabels && !config.showDate;
    const clampClass = LINE_CLAMP_CLASSES[config.snippetLines] || LINE_CLAMP_CLASSES[3];

    if (isOnlyElement) {
        return `<a href="${postUrl}" class="after:absolute after:inset-0 z-10 block ${clampClass} list-none text-body-md font-normal opacity-75 ${(finalType === BLOCK_COVER) ? 'py-6 mx-0 md:mx-10' : ''}" aria-label="Read more">${snippetText}</a>`;
    }

    return `<div class="${clampClass} list-none text-body-md font-normal opacity-75 ${(finalType === BLOCK_COVER) ? 'py-6 block mx-0 md:mx-10' : ''}">${snippetText}</div>`;
}
