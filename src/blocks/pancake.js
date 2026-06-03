import { BLOCK_PANCAKE } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_PANCAKE, post, postID, config, (parts, config) => {
        const bgThemeClass = (config.mBloxTheme !== "surface") ? ` h-full opacity-90 ${config.theme.containerBg} ${config.theme.containerText}` : ` ${config.theme.containerText}`;
        
        const textContentHTML = parts.hasText ? `
            <div class="p-4 flex-grow flex flex-col${bgThemeClass} text-${config.textHAlign}">
                ${parts.authorCode}${parts.dateCode}
                ${parts.titleCode}
                ${parts.snippetCode}
            </div>
            ${parts.ctaButtonCode}
        ` : '';

        return `<article class="col-span-1 inline-flex w-full relative" role="article"><div class="flex flex-col w-full ${config.theme.containerBg} h-full ${config.cornerStyle} ${config.interactionClasses}">${parts.finalImageCode}${textContentHTML}</div></article>`;
    });
}

