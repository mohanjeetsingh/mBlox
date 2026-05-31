export function renderHeaderTitle(config) {
    if (!config.dataTitle) return '';
    return `<h4 class="text-headline-lg font-bold ${config.theme.text} py-6 m-0 ${config.lowContrast ? "opacity-50" : ""}">${config.dataTitle}</h4>`;
}
