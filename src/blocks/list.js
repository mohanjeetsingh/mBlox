import { BLOCK_LIST } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_LIST, post, postID, config, (parts, config) => {
        const textContentHTML = parts.hasText ? `
            <div class="p-2 pt-0 md:p-4 flex flex-col justify-center">
                ${parts.authorCode}${parts.dateCode}
                ${parts.titleCode}
                ${parts.snippetCode}
                ${parts.ctaButtonCode}
            </div>
        ` : '';

        const bgClasses = (postID === 0 && !config.showImage) ? [config.theme.containerBg, config.theme.containerText] : [];
        const blockClasses = ['relative', 'block', config.cornerStyle, config.aspectRatio.trim(), 'w-full', 'h-full', ...bgClasses, config.interactionClasses].filter(Boolean).join(' ');
        const articleClasses = `col-span-1 inline-flex w-full h-full relative ${config.layout.mb}`;

        return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${parts.finalImageCode}${textContentHTML}</div></article>`;
    });
}

