import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

export function renderCTA(finalType, config, postTitle, postUrl) {
    if (!config.callToAction || finalType === BLOCK_GALLERY) return '';

    const align = config.ctaAlign || 'right';
    let specificClasses = '';

    if (finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) {
        if (align === 'left') specificClasses = 'py-2 px-6 self-start text-left';
        else if (align === 'center') specificClasses = 'py-2 px-6 self-center text-center';
        else specificClasses = 'py-2 px-6 self-end text-right';
    } else if (finalType === BLOCK_STACK || finalType === BLOCK_CARD || finalType === BLOCK_COMMENT) {
        if (align === 'left') specificClasses = 'mt-auto self-start';
        else if (align === 'center') specificClasses = 'mt-auto self-center';
        else specificClasses = 'mt-auto self-end';
    } else if (finalType === BLOCK_COVER) {
        if (align === 'left') specificClasses = 'mx-0 md:mx-10 mt-8 self-start';
        else if (align === 'center') specificClasses = 'mx-0 md:mx-10 mt-8 self-center';
        else specificClasses = 'mx-0 md:mx-10 mt-8 self-end';
    } else if (finalType === BLOCK_SHOWCASE || finalType === BLOCK_LIST) {
        specificClasses = ''; // Handled by showcase container
    }

    const isSharp = config.cornerStyle === " rounded-none" || finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE;
    const themeClasses = (finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE) ? `w-full ${config.theme.hoverBg} ${config.theme.hoverText}` : `${config.theme.bg} ${config.theme.text}`;
    const baseClasses = `inline-block text-label-lg font-bold no-underline px-4 py-2 hover:opacity-100 transition-opacity opacity-75 ${themeClasses} ${isSharp ? 'rounded-none' : 'rounded-full'}`;

    return `<a href="${postUrl}" class="${baseClasses} ${specificClasses} after:absolute after:inset-0 z-10" aria-label="View ${postTitle.replace(/"/g, '&quot;')}">${config.callToAction}</a>`;
}
