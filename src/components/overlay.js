export function renderImageOverlay(post, config) {
    if (!config.showOverlay) return '';

    let viewsHTML = '';
    if (post.viewCount && post.viewCount > 0) {
        viewsHTML = `
        <div class="flex items-center gap-1 px-2 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-colors font-semibold">
            <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-eye"></use></svg>
            <span class="text-[0.625rem]">${post.viewCount}</span>
        </div>`;
    }

    const commentsUrl = post.commentsUrl || post.url;
    const commentCountText = (post.commentCount && post.commentCount > 0) ? `<span class="text-[0.625rem]">${post.commentCount}</span>` : '';
    const commentsHTML = `
    <a aria-label="Comments" class="relative px-2 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md flex items-center justify-center gap-1 ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-colors font-semibold pointer-events-auto" href="${commentsUrl}">
        <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-comment-bubble"></use></svg>
        ${commentCountText}
    </a>`;

    let authorHTML = '';
    if (post.authorName && post.authorName !== 'Unknown' && post.authorName !== 'Anonymous') {
        const verifiedIcon = `<svg aria-hidden="true" class="w-4 h-4 text-primary"><use href="#icon-verified"></use></svg>`;
        
        let authorImageHTML = '';
        if (post.authorImage) {
            let imgUrl = post.authorImage.startsWith('//') ? `https:${post.authorImage}` : post.authorImage;
            authorImageHTML = `<img src="${imgUrl}" alt="${post.authorName}" class="w-4 h-4 rounded-full object-cover">`;
        }

        const authorInner = `
            ${authorImageHTML}
            <span>${post.authorName}</span>${verifiedIcon}
        `;

        if (post.authorUri) {
            authorHTML = `
            <a href="${post.authorUri}" class="flex items-center gap-1 px-2 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} text-[0.625rem] font-semibold transition-colors pointer-events-auto">
                ${authorInner}
            </a>`;
        } else {
            authorHTML = `
            <div class="flex items-center gap-1 px-2 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} text-[0.625rem] font-semibold transition-colors pointer-events-auto">
                ${authorInner}
            </div>`;
        }
    }

    const shareHTML = `
    <button aria-label="Share" class="w-6 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md flex items-center justify-center ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-colors pointer-events-auto" data-action="share-native" data-title="${post.title.replace(/"/g, '&quot;')}" data-url="${post.url}">
        <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-share"></use></svg>
    </button>`;

    return `
    <div class="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-none z-20 bg-gradient-to-b from-black/40 to-transparent">
        <div class="flex items-center gap-2 pointer-events-auto">
            ${viewsHTML}
        </div>
        <div class="flex items-center gap-2 pointer-events-auto">
            ${commentsHTML}
        </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between pointer-events-none z-20 bg-gradient-to-t from-black/40 to-transparent">
        <div class="flex items-center gap-2 pointer-events-auto">
            ${authorHTML}
        </div>
        <div class="flex items-center gap-2 pointer-events-auto">
            ${shareHTML}
        </div>
    </div>`;
}
