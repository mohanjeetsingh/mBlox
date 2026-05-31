/**
 * Carousel component for mBlox
 */
import { renderPaginationButtons } from './pagination.js';
import { RESPONSIVE_CAROUSEL_CLASSES_M3E } from '../core/config.js';

export function renderCarousel(blockBody, carouselIndicators, config, response, controls) {
    let html = `<div id="carousel-${config.mBlockID}-st${config.stageID}" class="overflow-hidden ${config.theme.bg}${config.blockType === 's' ? ' sFeature' : ""} relative">`;

    if (config.isCarousel) {
        if (carouselIndicators) {
            html += (carouselIndicators instanceof HTMLElement) ? carouselIndicators.outerHTML : carouselIndicators;
        }

        const numItems = response && response.posts ? response.posts.length : 0;
        const numCols = Math.ceil(numItems / (config.blockRows || 1));
        if (numCols > 1) {
            const dotsPositionClass = config.blockType === 'v' ? 'bottom-12' : 'bottom-3';
            html += `<div class="carousel-indicators flex justify-center gap-2 mt-2 absolute ${dotsPositionClass} left-0 right-0 z-10 pointer-events-none">`;
            for (let i = 0; i < numCols; i++) {
                html += `<button type="button" class="carousel-dot pointer-events-auto w-2 h-2 rounded-full bg-current ${config.theme.text} opacity-30 hover:opacity-100 transition-opacity aria-[current='true']:opacity-100 aria-[current='true']:bg-primary" data-index="${i}" aria-label="Slide ${i + 1}"></button>`;
            }
            html += `</div>`;
        }
        html += blockBody;
        html += `${controls.prev}${controls.next}`;

    } else if (config.containsNavigation) {
        html += blockBody;
        const totalStages = Math.ceil(response.totalResults / config.postsPerBlock);
        if (config.stageID > 1) html += controls.prev;
        if (config.stageID < totalStages) html += controls.next;
    } else {
        html += blockBody;
        html += renderPaginationButtons(config, response);
    }

    html += `</div>`;
    return html;
}

export function initCarousel(rawElement, config) {
    if (!config.isCarousel) return;

    const container = rawElement.querySelector('.overflow-x-auto');
    const prevBtn = rawElement.querySelector('.js-carousel-prev');
    const nextBtn = rawElement.querySelector('.js-carousel-next');

    if (!container) return;

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
        });
    }

    const dots = rawElement.querySelectorAll('.carousel-dot');
    if (dots.length > 0 && container) {
        if (dots[0]) dots[0].setAttribute('aria-current', 'true');

        const updateDots = () => {
            const scrollLeft = container.scrollLeft;
            const itemWidth = container.scrollWidth / dots.length;
            const activeIndex = Math.min(dots.length - 1, Math.round(scrollLeft / itemWidth));
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });
        };

        container.addEventListener('scroll', updateDots, { passive: true });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'), 10);
                const itemWidth = container.scrollWidth / dots.length;
                container.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
            });
        });
    }

    // Auto-play logic (every 4 seconds)
    let autoPlayInterval;
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(() => {
            // Check if we reached the end (with a 5px buffer for rounding errors)
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
            }
        }, 4000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    };

    startAutoPlay();

    // Pause on hover
    rawElement.addEventListener('mouseenter', stopAutoPlay);
    rawElement.addEventListener('mouseleave', startAutoPlay);
}
