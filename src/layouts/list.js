import { RESPONSIVE_GRID_CLASSES_M3E } from '../core/config.js';

export function renderListGrid(renderedBlocks, config) {
    if (!renderedBlocks || renderedBlocks.length === 0) return '';

    // The responsive span required for the inner grid to fill the remaining 
    // columns of the outer grid (OuterCols - 1).
    const SUBGRID_SPAN_CLASSES_M3E = {
        2: '@md:col-span-1',
        3: '@md:col-span-2',
        4: '@sm:col-span-1 @md:col-span-2 @lg:col-span-3',
        5: '@sm:col-span-2 @md:col-span-3 @xl:col-span-4',
        6: '@sm:col-span-3 @lg:col-span-4 @xl:col-span-5'
    };

    // Outer grid (places the feature item on the left and the sub-grid on the right)
    let currentColumnCount = config.columnCount;
    const outerGridColsClass = RESPONSIVE_GRID_CLASSES_M3E[currentColumnCount] || RESPONSIVE_GRID_CLASSES_M3E[6];

    let html = `<div class="${config.layout.gap} col flex-grow-1 grid ${outerGridColsClass}">`;

    // The first block is the feature item (left column). It is naturally col-span-1.
    html += renderedBlocks[0];

    // The rest of the blocks form a sub-grid (right column)
    if (renderedBlocks.length > 1) {
        if (config.showHeader) currentColumnCount--;

        const innerGridColsClass = RESPONSIVE_GRID_CLASSES_M3E[currentColumnCount] || RESPONSIVE_GRID_CLASSES_M3E[6];
        const innerSpanClass = SUBGRID_SPAN_CLASSES_M3E[config.columnCount] || 'col-span-1';

        html += `<div class="${config.layout.gap} ${innerSpanClass} px-0 grid ${innerGridColsClass}">`;

        for (let i = 1; i < renderedBlocks.length; i++) {
            html += renderedBlocks[i];
        }

        html += `</div>`; // close inner grid
    }

    html += `</div>`; // close outer grid
    return html;
}