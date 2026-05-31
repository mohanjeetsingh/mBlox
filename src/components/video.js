export function getYouTubeVideoId(post) {
    if (post.videoId) return post.videoId;
    if (post.thumbnailUrl && (post.thumbnailUrl.includes("ytimg.com/vi/") || post.thumbnailUrl.includes("youtube.com/vi/"))) {
        const idStartIndex = post.thumbnailUrl.indexOf("/vi/") + 4;
        const nextSlashIndex = post.thumbnailUrl.indexOf('/', idStartIndex);
        if (nextSlashIndex !== -1) return post.thumbnailUrl.substring(idStartIndex, nextSlashIndex);
    }
    if (post.content && post.content.includes('youtube.com/embed/')) {
        const match = post.content.match(/youtube\.com\/embed\/([^?"]+)/);
        return (match && match[1]) ? match[1] : "noVideo";
    }
    return "noVideo";
}

export function getVideoIcon(videoID) {
    if (!videoID || videoID === 'noVideo') return '';
    return `<svg class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-on-error drop-shadow-md z-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><use href="#icon-youtube"></use></svg>`;
}

export function getShowcaseVideoIcon(videoID) {
    if (!videoID || videoID === 'noVideo') return '';
    return `<svg class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-on-error drop-shadow-lg z-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><use href="#icon-youtube"></use></svg>`;
}

export function getVideoIframe(videoID, config) {
    if (!videoID || videoID === 'noVideo') return '';
    const src = `https://www.youtube-nocookie.com/embed/${videoID}?autoplay=1`;
    return `<iframe src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;" width="100%" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="${config.articleHeight}"></iframe>`;
}
