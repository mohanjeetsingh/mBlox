import { RESPONSIVE_CAROUSEL_CLASSES_M3E, BLOCK_COVER } from '../core/config.js';

export function renderCarouselGrid(renderedBlocks, config) {
    if (!renderedBlocks || renderedBlocks.length === 0) return '';

    const autoColsClass = RESPONSIVE_CAROUSEL_CLASSES_M3E[config.columnCount] || RESPONSIVE_CAROUSEL_CLASSES_M3E[6];
    const rowClassMap = { 1: 'grid-rows-1', 2: 'grid-rows-2', 3: 'grid-rows-3', 4: 'grid-rows-4' };
    const rowClass = rowClassMap[config.blockRows] || 'grid-rows-1';
    const pbClass = config.blockType === BLOCK_COVER ? '' : ' pb-8';

    let html = `<div class="grid grid-flow-col ${rowClass} ${autoColsClass} overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 ${pbClass} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">`;
    html += renderedBlocks.join('');
    html += `</div>`;

    return html;
}
