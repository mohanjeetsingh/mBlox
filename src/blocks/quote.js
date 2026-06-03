import { BLOCK_QUOTE } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_QUOTE, post, postID, config, (parts, config) => {
        const textContentHTML = parts.hasText ? `
            <div class="p-8 flex-grow flex flex-col">
                ${parts.titleCode}
                ${parts.snippetCode}
                <span class="mt-4 text-right">
                    ${parts.authorCode} ${parts.dateCode}
                </span>
            </div>
            ${parts.ctaButtonCode}
        ` : '';

        const blockClasses = ['flex', 'flex-col', 'w-full', config.theme.containerBg, config.cornerStyle, `text-${config.textHAlign}`, 'h-full', config.interactionClasses].filter(Boolean).join(' ');
        const articleClasses = 'col-span-1 inline-flex w-full relative';

        return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${parts.finalImageCode}${textContentHTML}</div></article>`;
    });
}

