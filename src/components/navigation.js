export function renderCarouselControls(config) {
    const prevClass = `carousel-control-prev link-${config.inverseTheme} w-auto px-4${config.containsNavigation ? " nav-prev" : " pb-5"}`;
    const nextClass = `carousel-control-next link-${config.inverseTheme} w-auto px-4${config.containsNavigation ? " nav-next" : " pb-5"}`;
    const target = `#carousel-${config.mBlockID}-st${config.stageID}`;
    const prev = `<button class="${prevClass}" type="button" title="Click for Previous" data-bs-target="${target}" data-bs-slide="prev">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg>
            <span class="visually-hidden">Previous</span>
          </button>`;
    const next = `<button class="${nextClass}" title="Click for Next" type="button" data-bs-target="${target}" data-bs-slide="next">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
            <span class="visually-hidden">Next</span>
          </button>`;
    return { prev, next };
}
