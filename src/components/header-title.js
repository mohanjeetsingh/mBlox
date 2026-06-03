export function renderHeaderTitle(config) {
    if (!config.mBlockTitle) return '';
    return `<h4 class="text-headline-lg font-bold ${config.palette.text} m-0">${config.mBlockTitle}</h4>`;
}
