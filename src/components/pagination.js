export function renderPaginationButtons(config) {
    if (config.containsNavigation || config.isCarousel) return '';
    
    return `<button class="nav-prev carousel-control-prev ${config.theme.text} w-auto px-6" type="button" title="Previous">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-left"></use></svg>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="nav-next carousel-control-next ${config.theme.text} w-auto px-6" title="Next" type="button">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg>
            <span class="visually-hidden">Next</span>
          </button>`;
}
