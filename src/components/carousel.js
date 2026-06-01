export function renderCarouselIndicators(carouselIndicators, config, response) {
    if (!config.isCarousel) return '';

    const customIndicators = carouselIndicators ? ((carouselIndicators instanceof HTMLElement) ? carouselIndicators.outerHTML : carouselIndicators) : '';

    const numItems = response && response.posts ? response.posts.length : 0;
    const numCols = Math.ceil(numItems / (config.blockRows || 1));

    let dotsHTML = '';
    if (numCols > 1) {
        const dotsPositionClass = config.blockType === 'v' ? 'bottom-12' : 'bottom-3';
        const dots = Array.from({ length: numCols }, (_, i) =>
            `<button type="button" class="carousel-dot pointer-events-auto w-2 h-2 rounded-full bg-current ${config.theme.text} opacity-30 hover:opacity-100 transition-opacity aria-[current='true']:opacity-100 aria-[current='true']:bg-primary" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
        ).join('');
        dotsHTML = `<div class="carousel-indicators flex justify-center gap-2 mt-2 absolute ${dotsPositionClass} left-0 right-0 z-10">${dots}</div>`;
    }

    return `${customIndicators}${dotsHTML}`;
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

    let autoPlayInterval;
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(() => {
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

    rawElement.addEventListener('mouseenter', stopAutoPlay);
    rawElement.addEventListener('mouseleave', startAutoPlay);
}
