export function renderHeaderDescription(config) {
    if (!config.mBlockDescription) return '';
    return `<p class="pb-3 ${config.theme.textMuted} m-0">${config.mBlockDescription}</p>`;
}
