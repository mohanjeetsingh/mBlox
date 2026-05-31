export function renderHeaderDescription(config) {
    if (!config.dataDescription) return '';
    return `<p class="pb-3 ${config.theme.textMuted} m-0">${config.dataDescription}</p>`;
}
