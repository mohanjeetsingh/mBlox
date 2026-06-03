import { BLOCK_CARD } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_CARD, post, postID, config, (parts, config) => {
        const textContentHTML = parts.hasText ? `
            <div class="absolute inset-0 flex flex-col p-0 border-0 ${{ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign] || ''
            }">
                <div class="${(config.textVerticalAlign === 'overlay' || !({ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign])) ? 'h-full ' : ''}${parts.hasTextContent ? `${config.palette.containerGlass} backdrop-blur-xl ` : ''}${config.palette.containerText} rounded-none p-2 @xs:p-4 @sm:p-6 flex flex-col text-${config.textHAlign}">
                    ${parts.authorCode}${parts.dateCode}
                    ${parts.titleCode}
                    ${parts.snippetCode}
                    ${parts.ctaButtonCode}
                </div>
            </div>
        ` : '';

        const blockClasses = ['relative', 'block', 'w-full', config.cornerStyle, config.aspectRatio.trim(), 'h-full', config.interactionClasses].filter(Boolean).join(' ');
        const articleClasses = '@container col-span-1 inline-flex w-full relative';

        return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${parts.finalImageCode}${textContentHTML}</div></article>`;
    });
}
