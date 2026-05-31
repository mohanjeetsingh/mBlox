import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

export function renderCTA(finalType, config, postTitle) {
    if (config.callToAction === "") return '';
    switch (finalType) {
        case BLOCK_GALLERY: 
            return '';
        case BLOCK_COMMENT: 
            return `<span class="link-${config.dataTheme} small no-underline font-bold">${config.callToAction}</span>`;
        default:
            let ctaClasses = `btn font-bold no-underline ${((config.cornerStyle != " rounded" || finalType == BLOCK_PANCAKE || finalType == BLOCK_QUOTE) ? 'rounded-none' : '')} ${(config.lowContrast ? "opacity-50" : "opacity-75")}`;
            switch (finalType) {
                case BLOCK_SHOWCASE: ctaClasses += " p-6 px-lg-5 float-end"; break;
                case BLOCK_COVER: ctaClasses += ' p-2 px-6 mx-lg-5 mt-6'; break;
                case BLOCK_PANCAKE: 
                case BLOCK_QUOTE: 
                    ctaClasses += ` py-2 px-6 w-full text-end link-${config.inverseTheme}`; 
                    break;
                case BLOCK_STACK: ctaClasses += ' mt-6'; break;
                case BLOCK_CARD: 
                case BLOCK_LIST: 
                    ctaClasses += ' bottom-0 end-0 mr-4 mb-6 d-block position-absolute w-auto'; 
                    break;
            }
            ctaClasses += ` border-0 btn-${config.dataTheme}`;
            return `<button class="${ctaClasses}" role="button" title="${postTitle}">${config.callToAction}</button>`;
    }
}
