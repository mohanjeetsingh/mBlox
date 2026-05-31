/**
 * Carousel component for mBlox
 */
import { renderPaginationButtons } from './pagination.js';

export function renderCarousel(blockBody, carouselIndicators, config, response, controls) {
    let html = `<div id="carousel-${config.mBlockID}-st${config.stageID}" class="overflow-hidden ${config.theme.bg}${config.blockType === 's' ? ' sFeature' : ""} relative">`;

    if (config.isCarousel || config.containsNavigation) {
        // Native CSS scroll snap container
        html += `<div class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">${blockBody}</div>`;
        if (config.isCarousel && carouselIndicators) {
            html += (carouselIndicators instanceof HTMLElement) ? carouselIndicators.outerHTML : carouselIndicators;
        }

        if (config.isCarousel) {
            html += `${controls.prev}${controls.next}`;
        }

        if (config.containsNavigation) {
            const totalStages = Math.ceil(response.totalResults / config.postsPerBlock);
            if (config.stageID > 1) html += controls.prev;
            if (config.stageID < totalStages) html += controls.next;
        }
    } else {
        html += blockBody;
        html += renderPaginationButtons(config);
    }

    html += `</div>`;
    return html;
}

export function initCarousel(rawElement, config) {
    // Native CSS scroll snapping handles carousels automatically without JS.
    // Future enhancements can implement JS-based next/prev buttons interacting with scrollLeft here.
}
