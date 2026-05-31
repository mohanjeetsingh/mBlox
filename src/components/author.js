import { BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

export function renderAuthor(finalType, config, authorName, authorUri) {
    if (!config.showAuthor) return '';
    let authorCode = '';
    const authorURL = (authorName === "Anonymous" || authorName === "Unknown" || !authorUri) ? '' : authorUri;
    const authorNameHTML = `<span class="text-label-md font-light" rel="author">${authorName}</span>`;
    const authorLinkHTML = `<span class="text-label-md font-light hover:underline z-20 relative cursor-pointer" rel="author" data-href="${authorURL}">${authorName}</span>`;

    switch (finalType) {
        case BLOCK_QUOTE: 
            authorCode = `<figcaption class="text-label-md font-light">- ${authorName}</figcaption>`; 
            break;
        case BLOCK_COMMENT: 
            authorCode = `<span class="text-label-md ${config.theme.text}" rel="author">${authorName}</span>`; 
            break;
        default: 
            authorCode = authorURL ? authorLinkHTML : authorNameHTML; 
            break;
    }
    return authorCode;
}
