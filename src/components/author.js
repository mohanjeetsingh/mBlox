import { BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

const AUTHOR_RENDERERS = {
    [BLOCK_QUOTE]: (name) => `<figcaption class="text-label-md font-light">- ${name}</figcaption>`,
    [BLOCK_COMMENT]: (name, _url, theme) => `<span class="text-label-md ${theme.containerText}" rel="author">${name}</span>`
};

export function renderAuthor(finalType, config, authorName, authorUri) {
    if (!config.showAuthor) return '';
    const authorURL = (authorName === "Anonymous" || authorName === "Unknown" || !authorUri) ? '' : authorUri;
    
    if (AUTHOR_RENDERERS[finalType]) {
        return AUTHOR_RENDERERS[finalType](authorName, authorURL, config.theme);
    }

    if (authorURL) {
        return `<span class="text-label-md font-light hover:underline z-20 relative cursor-pointer" rel="author" data-href="${authorURL}">${authorName}</span>`;
    }
    return `<span class="text-label-md font-light" rel="author">${authorName}</span>`;
}
