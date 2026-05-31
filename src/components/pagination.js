export function renderPaginationButtons(config, response) {
  if (config.containsNavigation || config.isCarousel) return '';

  const totalStages = response ? Math.ceil(response.totalResults / config.postsPerBlock) : 1;
  const baseClass = `absolute top-0 bottom-0 z-10 flex items-center justify-center w-16 cursor-pointer opacity-70 hover:opacity-100 transition-opacity ${config.theme.text} hover:backdrop-blur-xl`;

  let html = '';
  if (config.stageID > 1) {
    html += `<button class="nav-prev ${baseClass} left-0" type="button" title="Previous" aria-label="Previous">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-left"></use></svg>
          </button>`;
  }

  if (config.stageID < totalStages) {
    html += `<button class="nav-next ${baseClass} right-0" title="Next" type="button" aria-label="Next">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg>
          </button>`;
  }

  return html;
}
