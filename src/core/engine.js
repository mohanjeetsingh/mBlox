/**
 * mBlox Core Engine
 */

import { getProvider, BloggerProvider } from '../services/providers.js';
import { parseBlockConfig, calculateLayout } from '../utils/config-parser.js';
import { BLOCK_SHOWCASE, BLOCK_LIST } from '../core/config.js';
import { loadOptimalImages } from '../utils/image-loader.js';
import { injectSvgSprite } from '../components/icons.js';
import { renderGrid } from '../layouts/grid.js';
import { renderCarouselGrid } from '../layouts/carousel.js';
import { renderListGrid } from '../layouts/list.js';

// Global renderer instance
let rendererInstance = null;

async function _getRenderer() {
    if (rendererInstance) return rendererInstance;
    const isM3E = (window.mBloxConfig && window.mBloxConfig.designSystem === 'm3e');
    if (isM3E) {
        const { M3ERenderer } = await import('../design/ui-m3e.js');
        window.mBlox = window.mBlox || {};
        window.mBlox.m3eRenderer = M3ERenderer;
        rendererInstance = new M3ERenderer();
    } else {
        const { M3ERenderer } = await import('../design/ui-m3e.js');
        rendererInstance = new M3ERenderer();
    }
    return rendererInstance;
}

export async function mBlocks(blockItem) {
    injectSvgSprite();
    const renderer = await _getRenderer();
    const elements = (typeof blockItem === 'string') ? document.querySelectorAll(blockItem) : [blockItem];

    for (const rawElement of elements) {
        // Designate the block wrapper as a CSS container query root
        rawElement.classList.add('@container');
        
        let blockConfig = parseBlockConfig(rawElement);
        
        // Apply the auto-detected theme and palette natively to the wrapper
        rawElement.setAttribute('data-scheme', blockConfig.dataScheme);
        rawElement.setAttribute('data-palette', blockConfig.palette);

        // Listen for pagination events fired by the renderer
        if (!rawElement._mbloxPaginateListener) {
            rawElement.addEventListener('mblox:loadNextPage', (e) => {
                mBlocks(e.target);
            });
            rawElement._mbloxPaginateListener = true;
        }

        try {
            const provider = getProvider(blockConfig);
            const response = await provider.fetch();
            blockConfig.isBloggerFeed = provider instanceof BloggerProvider;

            if (response.posts && response.posts.length > 0) {
                const postsInFeed = response.posts.length;
                if (blockConfig.contentType === "comments") blockConfig.moreText = "";

                if (blockConfig.firstInstance) {
                    rawElement.setAttribute("data-s", blockConfig.stageID);
                    rawElement.insertAdjacentHTML('beforeend', renderer.createBlockHeader(blockConfig));
                }

                blockConfig = calculateLayout(blockConfig, postsInFeed);

                const { renderedBlocks, carouselIndicators, showcaseHTML } = await renderer.buildBlockBody(response, blockConfig);

                const isCurrentStage = blockConfig.stageID === parseInt(rawElement.getAttribute("data-s") || "1", 10);
                const displayClass = isCurrentStage ? '' : ' d-none';
                
                let renderOutput = `<div class="st${blockConfig.stageID}${displayClass}" id="m${blockConfig.mBlockID}-st${blockConfig.stageID}">`;
                if (blockConfig.blockType === BLOCK_SHOWCASE && blockConfig.firstInstance) {
                    renderOutput += showcaseHTML;
                }
                
                let blockBody = '';
                if (blockConfig.isCarousel) {
                    blockBody = renderCarouselGrid(renderedBlocks, blockConfig);
                } else if (blockConfig.blockType === BLOCK_LIST) {
                    blockBody = renderListGrid(renderedBlocks, blockConfig);
                } else {
                    blockBody = renderGrid(renderedBlocks, blockConfig);
                }

                renderOutput += renderer.createStageWrapper(blockBody, carouselIndicators, blockConfig, response);
                renderOutput += renderer.createBlockFooter(blockConfig, response);
                renderOutput += `</div>`;
                
                rawElement.insertAdjacentHTML('beforeend', renderOutput);
                renderer.bindEvents(rawElement, blockConfig);

                loadOptimalImages(rawElement);
            }
        } catch (e) {
            console.error(e);
        }
    }
}
