export function renderCarouselControls(config) {
    const baseClass = `absolute top-0 bottom-0 z-10 flex items-center justify-center w-16 cursor-pointer opacity-70 hover:opacity-100 transition-opacity ${config.theme.text} rounded-full hover:bg-tertiary hover:text-on-tertiary`;
    const prevClass = config.containsNavigation ? "nav-prev" : "js-carousel-prev pb-5";
    const nextClass = config.containsNavigation ? "nav-next" : "js-carousel-next pb-5";

    const prev = `<button class="${baseClass} left-0 ${prevClass}" type="button" title="Click for Previous" aria-label="Previous">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-left"></use></svg>
          </button>`;
    const next = `<button class="${baseClass} right-0 ${nextClass}" title="Click for Next" type="button" aria-label="Next">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg>
          </button>`;
    return { prev, next };
}
