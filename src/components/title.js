import { BLOCK_COVER, BLOCK_QUOTE, BLOCK_COMMENT } from '../core/config.js';

export function renderTitle(finalType, config, postTitle) {
    if (!config.showHeader) return '';
    
    switch (finalType) {
        case BLOCK_QUOTE:
            return `<svg class="float-start link-primary" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/></svg><blockquote class="blockquote link-primary text-start mt-2 ml-6">${postTitle}</blockquote>`;
        case BLOCK_COVER:
            return `<h3 class="display-5 font-bold mx-lg-5 ${config.lowContrast ? 'opacity-50' : 'opacity-75'}">${postTitle}</h3>`;
        case BLOCK_COMMENT:
            return `<span class="d-block my-2">"${postTitle}"</span>`;
        default:
            return `<h5 class="card-title font-bold">${postTitle}</h5>`;
    }
}
