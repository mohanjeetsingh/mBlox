import { RESPONSIVE_GRID_CLASSES_M3E, BLOCK_COVER } from '../core/config.js';

export function renderGrid(renderedBlocks, config) {
    if (!renderedBlocks || renderedBlocks.length === 0) return '';

    let html = `<div class="${config.layout.gap}`;
    
    const gridColsClass = RESPONSIVE_GRID_CLASSES_M3E[config.columnCount] || RESPONSIVE_GRID_CLASSES_M3E[6];
    html += ` grid ${gridColsClass}">`;

    html += renderedBlocks.join('');

    html += `</div>`;
    return html;
}
