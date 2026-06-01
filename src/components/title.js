import { BLOCK_COVER, BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

const TITLE_RENDERERS = {
    [BLOCK_QUOTE]: (title) => `<svg class="float-left text-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"><use href="#icon-quote"></use></svg><blockquote class="text-primary text-left mt-2 ml-6 text-headline-sm italic">${title}</blockquote>`,
    [BLOCK_COVER]: (title) => `<h3 class="text-display-sm font-bold mx-0 md:mx-10 opacity-75">${title}</h3>`,
    [BLOCK_COMMENT]: (title) => `<span class="block my-2 text-title-md">"${title}"</span>`
};

export function renderTitle(finalType, config, postTitle) {
    if (!config.showHeader) return '';
    
    const render = TITLE_RENDERERS[finalType] || ((title) => `<h5 class="text-title-lg font-bold mb-2">${title}</h5>`);
    return render(postTitle);
}
