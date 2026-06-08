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
    2: 'auto-cols-[100%] @3xl:auto-cols-[50%]',
    3: 'auto-cols-[100%] @3xl:auto-cols-[50%] @5xl:auto-cols-[33.333333%]',
    4: 'auto-cols-[100%] @xl:auto-cols-[50%] @3xl:auto-cols-[33.333333%] @5xl:auto-cols-[25%]',
    5: 'auto-cols-[50%] @xl:auto-cols-[33.333333%] @3xl:auto-cols-[25%] @7xl:auto-cols-[20%]',
    6: 'auto-cols-[33.333333%] @xl:auto-cols-[25%] @5xl:auto-cols-[20%] @7xl:auto-cols-[16.666667%]'
};

export const RESPONSIVE_GRID_CLASSES_M3E = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 @3xl:grid-cols-2',
    3: 'grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3',
    4: 'grid-cols-1 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4',
    5: 'grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @3xl:grid-cols-4 @7xl:grid-cols-5',
    6: 'grid-cols-3 @xl:grid-cols-4 @5xl:grid-cols-5 @7xl:grid-cols-6'
};

export const M3E_PALETTES = {
    'surface': {
        bg: 'bg-surface', text: 'text-on-surface', glass: 'bg-surface/20',
        hoverBg: 'hover:bg-surface', hoverText: 'hover:text-on-surface',
        containerBg: 'bg-surface-container', containerText: 'text-on-surface', containerGlass: 'bg-surface-container/20'
    },
    'primary': {
        bg: 'bg-primary', text: 'text-on-primary', glass: 'bg-primary/20',
        hoverBg: 'hover:bg-tertiary', hoverText: 'hover:text-on-tertiary',
        containerBg: 'bg-primary-container', containerText: 'text-on-primary-container', containerGlass: 'bg-primary-container/20'
    },
    'secondary': {
        bg: 'bg-secondary', text: 'text-on-secondary', glass: 'bg-secondary/20',
        hoverBg: 'hover:bg-secondary', hoverText: 'hover:text-on-secondary',
        containerBg: 'bg-secondary-container', containerText: 'text-on-secondary-container', containerGlass: 'bg-secondary-container/20'
    },
    'tertiary': {
        bg: 'bg-tertiary', text: 'text-on-tertiary', glass: 'bg-tertiary/20',
        containerBg: 'bg-tertiary-container', containerText: 'text-on-tertiary-container', containerGlass: 'bg-tertiary-container/20'
    },
    'error': {
        bg: 'bg-error', text: 'text-on-error', glass: 'bg-error/20',
        containerBg: 'bg-error-container', containerText: 'text-on-error-container', containerGlass: 'bg-error-container/20'
    }
};

export const LAYOUT_CLASSES = {
    0: { gap: 'gap-0', mt: 'mt-0', mb: 'mb-0', px: 'px-0' },
    2: { gap: 'gap-1 @3xl:gap-2', mt: 'mt-1 @3xl:mt-2', mb: 'mb-1 @3xl:mb-2', px: 'px-1 @3xl:px-2' },
    4: { gap: 'gap-2 @3xl:gap-3 @5xl:gap-4', mt: 'mt-2 @3xl:mt-3 @5xl:mt-4', mb: 'mb-2 @3xl:mb-3 @5xl:mb-4', px: 'px-2 @3xl:px-3 @5xl:px-4' },
    6: { gap: 'gap-3 @3xl:gap-4 @5xl:gap-6', mt: 'mt-3 @3xl:mt-4 @5xl:mt-6', mb: 'mb-3 @3xl:mb-4 @5xl:mb-6', px: 'px-3 @3xl:px-4 @5xl:px-6' },
    8: { gap: 'gap-4 @3xl:gap-6 @5xl:gap-8', mt: 'mt-4 @3xl:mt-6 @5xl:mt-8', mb: 'mb-4 @3xl:mb-6 @5xl:mb-8', px: 'px-4 @3xl:px-6 @5xl:px-8' },
    10: { gap: 'gap-6 @3xl:gap-8 @5xl:gap-10', mt: 'mt-6 @3xl:mt-8 @5xl:mt-10', mb: 'mb-6 @3xl:mb-8 @5xl:mb-10', px: 'px-6 @3xl:px-8 @5xl:px-10' },
    12: { gap: 'gap-8 @3xl:gap-10 @5xl:gap-12', mt: 'mt-8 @3xl:mt-10 @5xl:mt-12', mb: 'mb-8 @3xl:mb-10 @5xl:mb-12', px: 'px-8 @3xl:px-10 @5xl:px-12' }
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

export const LINE_CLAMP_CLASSES = {
    1: 'line-clamp-1 min-h-[1.5em]',
    2: 'line-clamp-2 min-h-[3em]',
    3: 'line-clamp-3 min-h-[4.5em]',
    4: 'line-clamp-4 min-h-[6em]',
    5: 'line-clamp-5 min-h-[7.5em]',
    6: 'line-clamp-6 min-h-[9em]'
};
