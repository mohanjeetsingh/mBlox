/**
 * Carousel component for mBlox
 */
import { renderPaginationButtons } from './pagination.js';

export function renderCarousel(blockBody, carouselIndicators, config, response, controls) {
    const wrapperId = `carousel-${config.mBlockID}-st${config.stageID}`;
    const wrapperClass = `overflow-hidden bg-${config.dataTheme}${config.blockType === 's' ? ' sFeature' : ""}${((config.isCarousel || config.containsNavigation) ? ' carousel slide carousel-fade' : " position-relative")}`;
    
    let html = `<div id="${wrapperId}" class="${wrapperClass}" data-bs-ride="carousel">`;

    if (config.isCarousel || config.containsNavigation) {
        html += `<div class="carousel-inner">${blockBody}</div>`;
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
    if (config.isCarousel && window.bootstrap && window.bootstrap.Carousel) {
        const carouselEl = rawElement.querySelector(`.st${config.stageID}.carousel, .st${config.stageID} .carousel`);
        if (carouselEl) {
            const carousel = window.bootstrap.Carousel.getOrCreateInstance(carouselEl, {
                interval: 5000,
                ride: 'carousel',
                wrap: config.wrap !== false
            });
            carousel.cycle();
        }
    }
}
