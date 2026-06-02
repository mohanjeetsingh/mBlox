import { BLOCK_LIST } from '../core/config.js';
import { buildCard } from '../utils/card-builder.js';

export function render(post, postID, config) {
    return buildCard(BLOCK_LIST, post, postID, config, (parts, config) => {
        let textContentHTML = '';
        const paddingClass = postID === 0 ? 'p-6 md:p-8' : 'p-4 md:p-6';

        if (parts.hasText) {
            const ctaAlignClass = config.ctaAlign === 'left' ? 'text-left' : (config.ctaAlign === 'center' ? 'text-center' : 'text-right');
            const ctaHTML = parts.ctaButtonCode ? `<div class="mt-4 ${ctaAlignClass}">${parts.ctaButtonCode}</div>` : '';

            if (config.showImage) {
                textContentHTML = `
                    <div class="absolute inset-0 flex flex-col p-0 border-0 ${
                        { top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign] || ''
                    }">
                        <div class="${(config.textVerticalAlign === 'overlay' || !({ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign])) ? 'h-full ' : ''}${parts.hasTextContent ? `${config.theme.containerGlass} backdrop-blur-xl ` : ''}${config.theme.containerText} rounded-none ${paddingClass}">
                            ${parts.authorCode}${parts.dateCode}
                            ${parts.titleCode}
                            ${parts.snippetCode}
                            ${ctaHTML}
                        </div>
                    </div>
                `;
            } else {
                textContentHTML = `
                    <div class="${paddingClass} w-full">
                        ${parts.authorCode}${parts.dateCode}
                        ${parts.titleCode}
                        ${parts.snippetCode}
                        ${ctaHTML}
                    </div>
                `;
            }
        }

        const bgClasses = (!config.showImage) ? [config.theme.containerBg, config.theme.containerText] : [];
        const displayClass = (config.showImage) ? 'block' : 'flex flex-col justify-center';
        const blockClasses = ['relative', displayClass, config.cornerStyle, config.aspectRatio.trim(), 'w-full', 'h-full', ...bgClasses, config.interactionClasses].filter(Boolean).join(' ');
        const articleClasses = `col-span-1 inline-flex w-full h-full relative ${config.layout.mb}`;

        const featuredBadgeHTML = (postID === 0) ? `<div class="absolute top-0 left-0 z-20 pointer-events-none backdrop-blur-xl ${config.theme.containerGlass} ${config.theme.containerText} px-6 py-2 text-label-lg font-bold w-full">Featured</div>` : '';

        return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${parts.finalImageCode}${featuredBadgeHTML}${textContentHTML}</div></article>`;
    });
}
