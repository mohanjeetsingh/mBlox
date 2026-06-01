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

export const noImg = window.noImg || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzljYTNhZiI+PHBhdGggZD0iTTIxIDE5VjVjMC0xLjEtLjktMi0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnpNOC41IDEzLjVsMi41IDMuMDFMMTQuNSAxMmw0LjUgNkg1bDMuNS00LjV6Ii8+PC9zdmc+";

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

export const BREAKPOINTS = { sm: 600, md: 840, lg: 1200, xl: 1600 };

export const RESPONSIVE_COLUMN_MAP = {
    1: [1, 1, 1, 1, 1],
    2: [1, 1, 2, 2, 2],
    3: [1, 1, 2, 3, 3],
    4: [1, 2, 3, 4, 4],
    5: [2, 3, 4, 4, 5],
    6: [3, 4, 4, 5, 6]
};

export function getBreakpointIndex(width) {
    if (width < BREAKPOINTS.sm) return 0;
    if (width < BREAKPOINTS.md) return 1;
    if (width < BREAKPOINTS.lg) return 2;
    if (width < BREAKPOINTS.xl) return 3;
    return 4;
}

export const RESPONSIVE_CAROUSEL_CLASSES_M3E = {
    1: 'auto-cols-[100%]',
    2: 'auto-cols-[100%] @md:auto-cols-[50%]',
    3: 'auto-cols-[100%] @md:auto-cols-[50%] @lg:auto-cols-[33.333333%]',
    4: 'auto-cols-[100%] @sm:auto-cols-[50%] @md:auto-cols-[33.333333%] @lg:auto-cols-[25%]',
    5: 'auto-cols-[50%] @sm:auto-cols-[33.333333%] @md:auto-cols-[25%] @xl:auto-cols-[20%]',
    6: 'auto-cols-[33.333333%] @sm:auto-cols-[25%] @lg:auto-cols-[20%] @xl:auto-cols-[16.666667%]'
};

export const RESPONSIVE_GRID_CLASSES_M3E = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 @md:grid-cols-2',
    3: 'grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3',
    4: 'grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4',
    5: 'grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 @xl:grid-cols-5',
    6: 'grid-cols-3 @sm:grid-cols-4 @lg:grid-cols-5 @xl:grid-cols-6'
};

export const M3E_THEMES = {
    'surface': { bg: 'bg-surface', text: 'text-on-surface', glass: 'bg-surface/20' },
    'surface-variant': { bg: 'bg-surface-variant', text: 'text-on-surface-variant', glass: 'bg-surface-variant/20' },
    'primary': { bg: 'bg-primary', text: 'text-on-primary', glass: 'bg-primary/20' },
    'primary-container': { bg: 'bg-primary-container', text: 'text-on-primary-container', glass: 'bg-primary-container/20' },
    'secondary': { bg: 'bg-secondary', text: 'text-on-secondary', glass: 'bg-secondary/20' },
    'secondary-container': { bg: 'bg-secondary-container', text: 'text-on-secondary-container', glass: 'bg-secondary-container/20' },
    'tertiary': { bg: 'bg-tertiary', text: 'text-on-tertiary', glass: 'bg-tertiary/20' },
    'error': { bg: 'bg-error', text: 'text-on-error', glass: 'bg-error/20' }
};

export const LAYOUT_CLASSES = {
    0: { gap: 'gap-0', mt: 'mt-0', px: 'px-0' },
    2: { gap: 'gap-2', mt: 'mt-2', px: 'px-2' },
    4: { gap: 'gap-4', mt: 'mt-4', px: 'px-4' },
    6: { gap: 'gap-6', mt: 'mt-6', px: 'px-6' },
    8: { gap: 'gap-8', mt: 'mt-8', px: 'px-8' },
    10: { gap: 'gap-10', mt: 'mt-10', px: 'px-10' },
    12: { gap: 'gap-12', mt: 'mt-12', px: 'px-12' }
};

export const ASPECT_RATIO_CLASSES = {
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '9/16': 'aspect-[9/16]',
    '9/21': 'aspect-[9/21]',
    '21/9': 'aspect-[21/9]'
};
