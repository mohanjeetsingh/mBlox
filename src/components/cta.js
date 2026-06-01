import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

export function renderCTA(finalType, config, postTitle) {
    if (config.callToAction === "") return '';
    if (finalType === BLOCK_GALLERY) return '';
    if (finalType === BLOCK_COMMENT) {
        return `<span class="${config.theme.text} text-label-md no-underline font-bold">${config.callToAction}</span>`;
    }

    const ctaClasses = [
        'inline-block', 'text-label-lg', 'font-bold', 'no-underline', 'text-center', 'px-4', 'py-2',
        'hover:opacity-80', 'transition-opacity', 'opacity-75', config.theme.bg, config.theme.text,
        (config.cornerStyle === " rounded-none" || finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) ? 'rounded-none' : 'rounded-full'
    ];

    switch (finalType) {
        case BLOCK_SHOWCASE: ctaClasses.push("p-6", "md:px-12", "float-right"); break;
        case BLOCK_COVER: ctaClasses.push("p-2", "px-6", "mx-0", "md:mx-10", "mt-6"); break;
        case BLOCK_PANCAKE: 
        case BLOCK_QUOTE: ctaClasses.push("py-2", "px-6", "w-full", "text-right"); break;
        case BLOCK_STACK: ctaClasses.push("mt-6", "self-start"); break;
        case BLOCK_CARD: 
        case BLOCK_LIST: ctaClasses.push("bottom-0", "right-0", "mr-4", "mb-6", "block", "absolute", "w-auto"); break;
    }

    return `<span class="${ctaClasses.filter(Boolean).join(' ')}" role="button" title="${postTitle}">${config.callToAction}</span>`;
}
