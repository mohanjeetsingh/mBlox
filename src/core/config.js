/**
 * mBlox Configuration & Constants
 * 
 * The defaults specified here are as per desktop version and ne
 */

export const BLOCK_COVER = 'v';
export const BLOCK_SHOWCASE = 's';
export const BLOCK_LIST = 'l';
export const BLOCK_CARD = 'c';
export const BLOCK_GALLERY = 'g';
export const BLOCK_PANCAKE = 'p';
export const BLOCK_STACK = 't';
export const BLOCK_QUOTE = 'q';
export const BLOCK_COMMENT = 'm';

export const noImg = window.noImg || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const DEFAULT_COLUMN_COUNTS = {
    [BLOCK_COVER]: 1,
    [BLOCK_COMMENT]: 1,
    [BLOCK_STACK]: 1,
    [BLOCK_PANCAKE]: 3,
    [BLOCK_CARD]: 4,
    [BLOCK_QUOTE]: 4,
    [BLOCK_GALLERY]: 5,
    [BLOCK_LIST]: 2,
    [BLOCK_SHOWCASE]: 6
};

export const RESPONSIVE_CAROUSEL_CLASSES_M3E = {
    1: 'auto-cols-[100%]',
    2: 'auto-cols-[100%] sm:auto-cols-[100%] md:auto-cols-[50%]',
    3: 'auto-cols-[100%] sm:auto-cols-[100%] md:auto-cols-[50%] lg:auto-cols-[33.333333%]',
    4: 'auto-cols-[100%] sm:auto-cols-[50%] md:auto-cols-[33.333333%] lg:auto-cols-[25%] xl:auto-cols-[25%]',
    5: 'auto-cols-[50%] sm:auto-cols-[33.333333%] md:auto-cols-[25%] lg:auto-cols-[25%] xl:auto-cols-[20%]',
    6: 'auto-cols-[33.333333%] sm:auto-cols-[25%] md:auto-cols-[25%] lg:auto-cols-[20%] xl:auto-cols-[16.666667%]'
};

export const RESPONSIVE_COLUMN_MAP = {
    1: [1, 1, 1, 1, 1],
    2: [1, 1, 2, 2, 2],
    3: [1, 1, 2, 3, 3],
    4: [1, 2, 3, 4, 4],
    5: [2, 3, 4, 4, 5],
    6: [3, 4, 4, 5, 6]
};

export const RESPONSIVE_GRID_CLASSES_M3E = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
};

export function getResponsiveGridClass(cols, designSystem) {
    const map = designSystem === 'm3e' ? RESPONSIVE_GRID_CLASSES_M3E : RESPONSIVE_GRID_CLASSES_BS;
    return map[cols] || map[6];
}

export function fadeIn(el) {
    if (!el) return;
    el.style.opacity = 0;
    el.classList.remove('d-none', 'hidden');
    el.style.display = '';
    (function fade() {
        let val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

export function fadeOut(el) {
    if (!el) return;
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = 'none';
        } else {
            requestAnimationFrame(fade);
        }
    })();
}
