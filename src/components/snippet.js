import { BLOCK_COVER } from '../core/config.js';

export function renderSnippet(finalType, config, postContent) {
    if (!config.showSnippet || !postContent) return '';
    
    const doc = new DOMParser().parseFromString(postContent, 'text/html');
    let snippetText = doc.body.textContent || "";
    if (snippetText.length > config.snippetSize) {
        snippetText = snippetText.substring(0, config.snippetSize) + "...";
    }

    return `<div class="line-clamp-3 list-none text-body-md opacity-75 ${(finalType === BLOCK_COVER) ? 'py-6 block mx-0 md:mx-10' : ''}">${snippetText}</div>`;
}
