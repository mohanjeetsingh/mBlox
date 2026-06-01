import { BLOCK_COVER } from '../core/config.js';

export function renderNavigationControls(config, response) {
  const bottomInset = (config.isCarousel && config.blockType !== BLOCK_COVER) ? "bottom-8" : "bottom-0";
  const baseClass = `absolute top-0 ${bottomInset} z-10 flex items-center justify-center w-16 cursor-pointer opacity-70 hover:opacity-100 transition-opacity ${config.theme.text} hover:backdrop-blur-xl`;
  
  const isCarousel = config.isCarousel;
  const prevClass = isCarousel ? "js-carousel-prev" : "nav-prev";
  const nextClass = isCarousel ? "js-carousel-next" : "nav-next";

  const prevBtn = `<button class="${baseClass} left-0 ${prevClass}" type="button" title="Previous" aria-label="Previous">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-left"></use></svg>
          </button>`;
  const nextBtn = `<button class="${baseClass} right-0 ${nextClass}" title="Next" type="button" aria-label="Next">
            <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg>
          </button>`;

  if (isCarousel) {
      return prevBtn + nextBtn;
  }

  const totalStages = response ? Math.ceil(response.totalResults / config.postsPerBlock) : 1;
  let html = '';
  if (config.stageID > 1) html += prevBtn;
  if (config.stageID < totalStages) html += nextBtn;
  
  return html;
}
