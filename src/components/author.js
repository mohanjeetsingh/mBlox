import { BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

export function renderAuthor(finalType, config, authorName, authorUri) {
    if (!config.showAuthor) return '';
    let authorCode = '';
    const authorURL = (authorName === "Anonymous" || authorName === "Unknown" || !authorUri) ? '' : authorUri;
    const authorNameHTML = `<span class="small fw-lighter" rel="author">${authorName}</span>`;
    const authorLinkHTML = `<a href="${authorURL}" class="small fw-lighter" rel="author">${authorName}</a>`;

    switch (finalType) {
        case BLOCK_QUOTE: 
            authorCode = `<figcaption class="small fw-lighter">- ${authorName}</figcaption>`; 
            break;
        case BLOCK_COMMENT: 
            authorCode = `<span class="small text-${config.dataTheme}" rel="author">${authorName}</span>`; 
            break;
        default: 
            authorCode = authorURL ? authorLinkHTML : authorNameHTML; 
            break;
    }
    return authorCode;
}
