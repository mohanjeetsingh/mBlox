export function renderCarouselControls(config) {
    const prev = `<button class="carousel-control-prev ${config.theme.text} w-auto px-4${config.containsNavigation ? " nav-prev" : " pb-5"}" type="button" title="Click for Previous" data-bs-target="#carousel-${config.mBlockID}-st${config.stageID}" data-bs-slide="prev">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-left"></use></svg>
            <span class="visually-hidden">Previous</span>
          </button>`;
    const next = `<button class="carousel-control-next ${config.theme.text} w-auto px-4${config.containsNavigation ? " nav-next" : " pb-5"}" title="Click for Next" type="button" data-bs-target="#carousel-${config.mBlockID}-st${config.stageID}" data-bs-slide="next">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg>
            <span class="visually-hidden">Next</span>
          </button>`;
    return { prev, next };
}
