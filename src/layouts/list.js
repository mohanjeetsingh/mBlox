import { RESPONSIVE_GRID_CLASSES_M3E } from '../core/config.js';

export function renderListGrid(renderedBlocks, config) {
    if (!renderedBlocks || renderedBlocks.length === 0) return '';
    
    // The first block is the feature item
    let html = renderedBlocks[0];
    
    // The rest of the blocks form a sub-grid
    if (renderedBlocks.length > 1) {
        let currentColumnCount = config.columnCount;
        if (config.showHeader) currentColumnCount--;
        
        const gridColsClass = RESPONSIVE_GRID_CLASSES_M3E[currentColumnCount] || RESPONSIVE_GRID_CLASSES_M3E[6];
        html += `<div class="${config.layout.gap} col flex-grow-1 px-0 grid ${gridColsClass}">`;
        
        for (let i = 1; i < renderedBlocks.length; i++) {
            html += renderedBlocks[i];
        }
        
        html += `</div>`;
    }
    
    return html;
}
