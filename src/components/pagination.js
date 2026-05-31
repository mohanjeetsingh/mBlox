export function renderPaginationButtons(config) {
    if (config.containsNavigation || config.isCarousel) return '';
    
    const prevClass = `nav-prev carousel-control-prev link-${config.inverseTheme} w-auto px-4`;
    const nextClass = `nav-next carousel-control-next link-${config.inverseTheme} w-auto px-4`;
    
    return `<button class="${prevClass}" type="button" title="Previous">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"></path></svg>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="${nextClass}" title="Next" type="button">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
            <span class="visually-hidden">Next</span>
          </button>`;
}
