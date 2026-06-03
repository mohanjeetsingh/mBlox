import { BLOCK_COMMENT } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_COMMENT, post, postID, config, (parts, config) => {
        const textContentHTML = `
            <div class="w-full p-2 flex flex-col h-full text-${config.textHAlign}">
                ${parts.authorCode}${parts.dateCode}
                ${parts.titleCode}
                ${parts.snippetCode}
                ${parts.ctaButtonCode}
            </div>
        `;

        const blockClasses = `${config.cornerStyle} ${config.theme.containerBg} flex flex-row p-4 w-full items-start ${config.interactionClasses}`;

        return `
            <article class="col-span-1 inline-flex w-full relative" role="article">
                <div class="${blockClasses}">
                    ${parts.finalImageCode}
                    ${textContentHTML}
                </div>
            </article>
        `;
    });
}
