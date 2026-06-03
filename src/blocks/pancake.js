import { BLOCK_PANCAKE } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_PANCAKE, post, postID, config, (parts, config) => {
        const bgThemeClass = (config.mBloxTheme !== "surface") ? ` h-full opacity-90 ${config.palette.containerBg}` : ``;

        const textContentHTML = parts.hasText ? `
            <div class="p-2 @xs:p-4 @sm:p-6 flex-grow flex flex-col${bgThemeClass} text-${config.textHAlign}">
                ${parts.authorCode}${parts.dateCode}
                ${parts.titleCode}
                ${parts.snippetCode}
            </div>
            ${parts.ctaButtonCode}
        ` : '';

        return `<article class="@container col-span-1 inline-flex w-full relative" role="article"><div class="flex flex-col w-full ${config.palette.containerBg} ${config.palette.containerText} h-full ${config.cornerStyle} ${config.interactionClasses}">${parts.finalImageCode}${textContentHTML}</div></article>`;
    });
}

