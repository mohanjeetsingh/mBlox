import { BLOCK_COVER, BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

export function renderTitle(finalType, config, postTitle) {
    if (!config.showHeader) return '';
    
    switch (finalType) {
        case BLOCK_QUOTE:
            return `<svg class="float-left text-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"><use href="#icon-quote"></use></svg><blockquote class="text-primary text-left mt-2 ml-6 text-headline-sm italic">${postTitle}</blockquote>`;
        case BLOCK_COVER:
            return `<h3 class="text-display-sm font-bold mx-0 md:mx-10 ${config.lowContrast ? 'opacity-50' : 'opacity-75'}">${postTitle}</h3>`;
        case BLOCK_COMMENT:
            return `<span class="block my-2 text-title-md">"${postTitle}"</span>`;
        default:
            return `<h5 class="text-title-lg font-bold mb-2">${postTitle}</h5>`;
    }
}
