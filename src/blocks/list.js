import { BLOCK_LIST } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_LIST, post, postID, config, (parts, config) => {
        let textContentHTML = '';
        const paddingClass = postID === 0 ? 'p-4 @xs:p-6 @sm:p-8' : 'p-2 @xs:p-4 @sm:p-6';

        if (parts.hasText) {
            const ctaHTML = parts.ctaRowCode ? `<div class="mt-4 w-full">${parts.ctaRowCode}</div>` : '';

            if (config.showImage) {
                textContentHTML = `
                    <div class="absolute inset-0 flex flex-col p-0 border-0 pointer-events-none ${{ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign] || ''
                    }">
                        <div class="pointer-events-auto ${(config.textVerticalAlign === 'overlay' || !({ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign])) ? 'h-full ' : ''}${parts.hasTextContent ? `${config.palette.containerGlass} backdrop-blur-xl ` : ''}${config.palette.containerText} rounded-none ${paddingClass} text-${config.textHAlign}">
                            ${parts.authorCode}
                            ${parts.labelsCode}
                            ${parts.titleCode}
                            ${parts.snippetCode}
                            ${ctaHTML}
                        </div>
                    </div>
                `;
            } else {
                textContentHTML = `
                    <div class=" ${paddingClass} w-full text-${config.textHAlign}">
                        ${parts.authorCode}
                        ${parts.labelsCode}
                        ${parts.titleCode}
                        ${parts.snippetCode}
                        ${ctaHTML}
                    </div>
                `;
            }
        }

        const bgClasses = (!config.showImage) ? [config.palette.containerBg, config.palette.containerText] : [];
        const displayClass = (config.showImage) ? 'block' : 'flex flex-col justify-center';
        const blockClasses = ['relative', displayClass, config.cornerStyle, config.aspectRatio.trim(), 'w-full', 'h-full', ...bgClasses, config.interactionClasses].filter(Boolean).join(' ');
        const articleClasses = `@container col-span-1 inline-flex w-full h-full relative ${config.layout.mb}`;

        const featuredBadgeHTML = (postID === 0) ? `<div class="absolute top-0 left-0 z-20 pointer-events-none backdrop-blur-xl ${config.palette.containerGlass} ${config.palette.containerText} px-6 py-3 text-label-lg font-bold w-full">Featured</div>` : '';

        return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${parts.finalImageCode}${featuredBadgeHTML}${textContentHTML}</div></article>`;
    });
}
