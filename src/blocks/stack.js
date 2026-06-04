import { BLOCK_STACK } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_STACK, post, postID, config, (parts, config, bodyClass) => {
        const innerContent = parts.hasText ? `
            <div class="p-2 @xs:p-4 @sm:p-6 flex-grow flex flex-col${bodyClass} text-${config.textHAlign}">
                ${parts.authorCode}${parts.dateCode}
                ${parts.labelsCode}
                ${parts.titleCode}
                ${parts.snippetCode}
                ${parts.ctaButtonCode}
            </div>
        ` : '';

        const isIndependentStack = config.blockType === BLOCK_STACK;
        const textWidthClass = isIndependentStack ? 'w-3/4' : 'w-2/3';

        const textContentHTML = parts.hasText ? (config.showImage ? `<div class="${textWidthClass} h-full flex flex-col">${innerContent}</div>` : innerContent) : '';

        const blockClasses = ['flex', 'flex-row', config.palette.containerBg, config.cornerStyle, 'w-full', 'h-full', config.interactionClasses].filter(Boolean).join(' ');
        const articleClasses = `@container col-span-1 inline-flex w-full relative h-full ${config.layout.mb}`;

        return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${parts.finalImageCode}${textContentHTML}</div></article>`;
    });
}
