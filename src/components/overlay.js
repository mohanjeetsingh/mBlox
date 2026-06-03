export function renderImageOverlay(post, config) {
    if (!config.showOverlay) return '';

    let viewsHTML = '';
    if (config.overlayItems.includes('v') && post.viewCount && post.viewCount > 0) {
        viewsHTML = `
        <div class="flex items-center gap-1 px-2 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-colors font-semibold">
            <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-eye"></use></svg>
            <span class="text-[0.625rem]">${post.viewCount}</span>
        </div>`;
    }

    let commentsHTML = '';
    if (config.overlayItems.includes('c')) {
        const commentsUrl = post.commentsUrl || post.url;
        const commentCountText = (post.commentCount && post.commentCount > 0) ? `<span class="text-[0.625rem]">${post.commentCount}</span>` : '';
        commentsHTML = `
        <a aria-label="Comments" class="relative px-2 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md flex items-center justify-center gap-1 ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-colors font-semibold pointer-events-auto" href="${commentsUrl}">
            <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-comment-bubble"></use></svg>
            ${commentCountText}
        </a>`;
    }

    let bookmarkHTML = '';
    if (config.overlayItems.includes('b')) {
        bookmarkHTML = `
        <button aria-label="Save" class="group bm-button relative h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md flex items-center justify-center ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-all duration-300 ease-in-out pointer-events-auto" data-bm-title="${post.title.replace(/"/g, '&quot;')}" data-bm-url="${post.url}" data-bm-image="${post.thumbnailUrl || ''}" type="button">
            <span class="bm-text overflow-hidden whitespace-nowrap text-[11px] font-medium transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[60px] group-hover:opacity-100 group-hover:pl-2.5">Save</span>
            <div class="w-6 h-6 flex items-center justify-center shrink-0">
                <svg aria-hidden="true" class="w-4 h-4 bm-add-icon group-[.added]:hidden"><use href="#icon-bookmark-add"></use></svg>
                <svg aria-hidden="true" class="w-4 h-4 bm-added-icon hidden group-[.added]:block"><use href="#icon-bookmark-added"></use></svg>
            </div>
        </button>`;
    }

    let authorHTML = '';
    if (config.overlayItems.includes('a') && post.authorName && post.authorName !== 'Unknown' && post.authorName !== 'Anonymous') {
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

    let shareHTML = '';
    if (config.overlayItems.includes('s')) {
        shareHTML = `
        <button aria-label="Share" class="w-6 h-6 rounded-md ${config.palette.glass} ${config.palette.text} backdrop-blur-md flex items-center justify-center ${config.palette.hoverBg || 'hover:bg-tertiary'} ${config.palette.hoverText || 'hover:text-on-tertiary'} transition-colors pointer-events-auto" data-action="share-native" data-title="${post.title.replace(/"/g, '&quot;')}" data-url="${post.url}">
            <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-share"></use></svg>
        </button>`;
    }

    return `
    <div class="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-none z-20 bg-gradient-to-b from-black/40 to-transparent">
        <div class="flex items-center gap-2 pointer-events-auto">
            ${viewsHTML}
        </div>
        <div class="flex items-center gap-2 pointer-events-auto">
            ${commentsHTML}
            ${bookmarkHTML}
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
