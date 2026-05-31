import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

export function renderCTA(finalType, config, postTitle) {
    if (config.callToAction === "") return '';
    switch (finalType) {
        case BLOCK_GALLERY: 
            return '';
        case BLOCK_COMMENT: 
            return `<span class="link-${config.dataTheme} small text-decoration-none fw-bold">${config.callToAction}</span>`;
        default:
            let ctaClasses = `btn fw-bold text-decoration-none ${((config.cornerStyle != " rounded" || finalType == BLOCK_PANCAKE || finalType == BLOCK_QUOTE) ? 'rounded-0' : '')} ${(config.lowContrast ? "opacity-50" : "opacity-75")}`;
            switch (finalType) {
                case BLOCK_SHOWCASE: ctaClasses += " p-3 px-lg-5 float-end"; break;
                case BLOCK_COVER: ctaClasses += ' p-2 px-4 mx-lg-5 mt-4'; break;
                case BLOCK_PANCAKE: 
                case BLOCK_QUOTE: 
                    ctaClasses += ` py-2 px-3 w-100 text-end link-${config.inverseTheme}`; 
                    break;
                case BLOCK_STACK: ctaClasses += ' mt-3'; break;
                case BLOCK_CARD: 
                case BLOCK_LIST: 
                    ctaClasses += ' bottom-0 end-0 me-3 mb-3 d-block position-absolute w-auto'; 
                    break;
            }
            ctaClasses += ` border-0 btn-${config.dataTheme}`;
            return `<button class="${ctaClasses}" role="button" title="${postTitle}">${config.callToAction}</button>`;
    }
}
