export function renderLabels(config, labels, siteUrl) {
    if (!config.showLabels || !labels || labels.length === 0) return '';

    // Slice to maximum of 3 labels as requested
    const displayLabels = labels.slice(0, 3);

    // Build base URL for searches
    // We use a relative or absolute path based on siteUrl or default to /search/label/
    let baseSearchUrl = '/search/label/';
    if (siteUrl && siteUrl !== '/') {
        try {
            const urlObj = new URL(siteUrl);
            baseSearchUrl = `${urlObj.origin}/search/label/`;
        } catch (e) {
            // If siteUrl is relative or malformed, just use the default
            baseSearchUrl = '/search/label/';
        }
    }

    const labelsHTML = displayLabels.map(label => {
        const encodedLabel = encodeURIComponent(label);
        return `<a aria-label="${label.replace(/"/g, '&quot;')}" class="relative z-50 pointer-events-auto inline-flex items-center justify-center rounded-full transition-all duration-300 ease-[--ease-m3-emphasized] cursor-pointer ${config.palette.hoverBg} ${config.palette.hoverText} ${config.palette.glass} ${config.palette.text} h-6 px-3 text-label-md" href="${baseSearchUrl}${encodedLabel}"><span>${label}</span></a>`;
    }).join('');

    return `
    <div class="flex items-center gap-2 mb-3 relative z-50 pointer-events-auto">
        <div class="flex flex-wrap items-center gap-2">
            <span class="text-body-sm font-normal opacity-75 ${config.palette.containerText}">in</span>
            ${labelsHTML}
        </div>
    </div>`;
}
