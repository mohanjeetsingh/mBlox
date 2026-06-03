import { BLOCK_COMMENT } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_COMMENT, post, postID, config, (parts, config) => {
        const textContentHTML = `
            <div class="w-full p-2 flex flex-col h-full text-${config.textHAlign}">
                <div class="mb-1 opacity-75 flex flex-wrap items-center gap-x-1">${parts.authorCode}${parts.dateCode}</div>
                ${parts.labelsCode}
                ${parts.titleCode}
                ${parts.snippetCode}
                ${parts.ctaButtonCode}
            </div>
        `;

        const blockClasses = `${config.cornerStyle} ${config.palette.containerBg} ${config.palette.containerText} flex flex-row p-4 w-full items-start ${config.interactionClasses}`;

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
