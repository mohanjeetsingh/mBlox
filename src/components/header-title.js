export function renderHeaderTitle(config) {
    if (!config.dataTitle) return '';
    return `<h4 class="text-headline-lg font-bold ${config.theme.text} m-0">${config.dataTitle}</h4>`;
}
