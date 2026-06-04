export function renderLabels(config, labels, siteUrl) {
    if (!config.showLabels || !labels || labels.length === 0) return '';

    // Select up to 2 random labels
    const displayLabels = [...labels].sort(() => 0.5 - Math.random()).slice(0, 2);

    // Build base URL for searches
    // We use a relative or absolute path based on siteUrl or default to /search/label/
    let baseSearchUrl = '/search/label/';
    if (siteUrl && siteUrl !== '/') {
        try {
            const urlObj = new URL(siteUrl);
            const lowerUrl = siteUrl.toLowerCase();
            
            if (lowerUrl.includes('youtube.com')) {
                baseSearchUrl = 'https://www.youtube.com/hashtag/';
            } else if (lowerUrl.includes('/wp-json')) {
                baseSearchUrl = `${urlObj.origin}/search/`;
            } else if (lowerUrl.includes('tumblr.com')) {
                baseSearchUrl = `${urlObj.origin}/tagged/`;
            } else if (lowerUrl.includes('mastodon.social')) {
                baseSearchUrl = `${urlObj.origin}/tags/`;
            } else if (lowerUrl.includes('bsky.app')) {
                baseSearchUrl = 'https://bsky.app/search?q=';
            } else if (lowerUrl.includes('deviantart.com')) {
                baseSearchUrl = 'https://www.deviantart.com/tag/';
            } else if (lowerUrl.includes('reddit.com')) {
                baseSearchUrl = 'https://www.reddit.com/search/?q=';
            } else {
                baseSearchUrl = `${urlObj.origin}/search/label/`;
            }
        } catch (e) {
            // If siteUrl is relative or malformed, just use the default
            baseSearchUrl = '/search/label/';
        }
    }

    const labelsHTML = displayLabels.map(label => {
        const encodedLabel = encodeURIComponent(label);
        const displayString = label.startsWith('#') ? label.replace(/\s+/g, '') : `#${label.replace(/\s+/g, '')}`;
        return `<a aria-label="${label.replace(/"/g, '&quot;')}" class="relative z-50 pointer-events-auto inline-flex items-center justify-center rounded-full transition-opacity duration-300 ease-[--ease-m3-emphasized] cursor-pointer ${config.palette.bg} ${config.palette.text} ${config.palette.hoverBg} ${config.palette.hoverText} opacity-75 hover:opacity-100 h-6 px-3 text-label-md no-underline" href="${baseSearchUrl}${encodedLabel}"><span>${displayString}</span></a>`;
    }).join('');

    return `
    <div class="flex items-center gap-2 mb-3 relative z-50 pointer-events-auto">
        <div class="flex flex-wrap items-center gap-2">
            ${labelsHTML}
        </div>
    </div>`;
}
