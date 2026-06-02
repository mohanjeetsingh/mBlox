import { BLOCK_COVER, BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

const TITLE_RENDERERS = {
    [BLOCK_QUOTE]: (title, url, hasCta) => `<svg class="float-left text-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"><use href="#icon-quote"></use></svg><blockquote class="text-primary text-left mt-2 ml-6 text-headline-sm italic">${hasCta ? title : `<a href="${url}" class="after:absolute after:inset-0 z-10" aria-label="Read more about ${title.replace(/"/g, '&quot;')}">${title}</a>`}</blockquote>`,
    [BLOCK_COVER]: (title, url, hasCta) => `<h3 class="text-display-sm font-bold mx-0 md:mx-10 opacity-75">${hasCta ? title : `<a href="${url}" class="after:absolute after:inset-0 z-10" aria-label="Read more about ${title.replace(/"/g, '&quot;')}">${title}</a>`}</h3>`,
    [BLOCK_COMMENT]: (title, url, hasCta) => `<span class="block my-2 text-title-md">"${hasCta ? title : `<a href="${url}" class="after:absolute after:inset-0 z-10" aria-label="Read more about ${title.replace(/"/g, '&quot;')}">${title}</a>`}"</span>`
};

export function renderTitle(finalType, config, postTitle, postUrl) {
    if (!config.showHeader) return '';
    
    const hasCta = Boolean(config.callToAction);
    const render = TITLE_RENDERERS[finalType] || ((title, url, hasCta) => `<h5 class="text-title-lg font-bold mb-2">${hasCta ? title : `<a href="${url}" class="after:absolute after:inset-0 z-10" aria-label="Read more about ${title.replace(/"/g, '&quot;')}">${title}</a>`}</h5>`);
    return render(postTitle, postUrl, hasCta);
}
