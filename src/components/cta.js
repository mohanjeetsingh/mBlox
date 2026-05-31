import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

export function renderCTA(finalType, config, postTitle) {
    if (config.callToAction === "") return '';
    switch (finalType) {
        case BLOCK_GALLERY: 
            return '';
        case BLOCK_COMMENT: 
            return `<span class="${config.theme.text} text-label-md no-underline font-bold">${config.callToAction}</span>`;
        default:
            let ctaClasses = `inline-block text-label-lg font-bold no-underline text-center px-4 py-2 hover:opacity-80 transition-opacity ${((config.cornerStyle != " rounded" || finalType == BLOCK_PANCAKE || finalType == BLOCK_QUOTE) ? 'rounded-none' : 'rounded-full')} ${(config.lowContrast ? "opacity-50" : "opacity-75")}`;
            switch (finalType) {
                case BLOCK_SHOWCASE: ctaClasses += " p-6 md:px-12 float-right"; break;
                case BLOCK_COVER: ctaClasses += ' p-2 px-6 mx-0 md:mx-10 mt-6'; break;
                case BLOCK_PANCAKE: 
                case BLOCK_QUOTE: 
                    ctaClasses += ` py-2 px-6 w-full text-right`; 
                    break;
                case BLOCK_STACK: ctaClasses += ' mt-6 self-start'; break;
                case BLOCK_CARD: 
                case BLOCK_LIST: 
                    ctaClasses += ' bottom-0 right-0 mr-4 mb-6 block absolute w-auto'; 
                    break;
            }
            ctaClasses += ` ${config.theme.bg} ${config.theme.text}`;
            return `<span class="${ctaClasses}" role="button" title="${postTitle}">${config.callToAction}</span>`;
    }
}
