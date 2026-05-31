export function renderBlockHeader(config) {
    if (!config.dataTitle) return '';
    const descriptionHTML = config.dataDescription ? `<span class="pb-3 text-black-50">${config.dataDescription}</span>` : '';
    const titleClasses = `display-5 fw-bold text-${config.inverseTheme} py-3 m-0 ${config.lowContrast ? "opacity-50" : ""}`;
    return `<div class="text-center m-0 bg-${config.dataTheme} py-5"><h4 class="${titleClasses}">${config.dataTitle}</h4>${descriptionHTML}</div>`;
}
