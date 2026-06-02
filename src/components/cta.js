import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

export function renderCTA(finalType, config, postTitle, postUrl) {
    if (!config.callToAction || finalType === BLOCK_GALLERY) return '';

    if (finalType === BLOCK_COMMENT) {
        return `<span class="${config.theme.text} text-label-md no-underline font-bold hover:underline cursor-pointer">${config.callToAction}</span>`;
    }

    const align = config.ctaAlign || 'right';
    let specificClasses = '';

    if (finalType === BLOCK_CARD || finalType === BLOCK_LIST) {
        if (align === 'left') specificClasses = 'bottom-0 left-0 ml-4 mb-6 block absolute w-auto';
        else if (align === 'center') specificClasses = 'bottom-0 left-1/2 -translate-x-1/2 mb-6 block absolute w-auto';
        else specificClasses = 'bottom-0 right-0 mr-4 mb-6 block absolute w-auto';
    } else if (finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) {
        if (align === 'left') specificClasses = 'py-2 px-6 self-start text-left';
        else if (align === 'center') specificClasses = 'py-2 px-6 self-center text-center';
        else specificClasses = 'py-2 px-6 self-end text-right';
    } else if (finalType === BLOCK_STACK) {
        if (align === 'left') specificClasses = 'mt-auto self-start';
        else if (align === 'center') specificClasses = 'mt-auto self-center';
        else specificClasses = 'mt-auto self-end';
    } else if (finalType === BLOCK_COVER) {
        if (align === 'left') specificClasses = 'p-2 px-6 mx-0 md:mx-10 mt-6 self-start';
        else if (align === 'center') specificClasses = 'p-2 px-6 mx-0 md:mx-10 mt-6 self-center';
        else specificClasses = 'p-2 px-6 mx-0 md:mx-10 mt-6 self-end';
    } else if (finalType === BLOCK_SHOWCASE) {
        specificClasses = ''; // Handled by showcase container
    }

    const isSharp = config.cornerStyle === " rounded-none" || finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE;
    const themeClasses = (finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) ? `w-full ${config.theme.hoverBg} ${config.theme.hoverText}` : `${config.theme.bg} ${config.theme.text}`;
    const baseClasses = `inline-block text-label-lg font-bold no-underline px-4 py-2 hover:opacity-90 transition-opacity opacity-90 ${themeClasses} ${isSharp ? 'rounded-none' : 'rounded-full'}`;

    return `<a href="${postUrl}" class="${baseClasses} ${specificClasses} after:absolute after:inset-0 z-10" aria-label="View ${postTitle.replace(/"/g, '&quot;')}">${config.callToAction}</a>`;
}
