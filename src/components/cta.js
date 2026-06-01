import { BLOCK_GALLERY, BLOCK_COMMENT, BLOCK_SHOWCASE, BLOCK_COVER, BLOCK_PANCAKE, BLOCK_QUOTE, BLOCK_STACK, BLOCK_CARD, BLOCK_LIST } from '../core/config.js';

const CTA_CLASSES = {
    [BLOCK_SHOWCASE]: '',
    [BLOCK_COVER]: 'p-2 px-6 mx-0 md:mx-10 mt-6',
    [BLOCK_PANCAKE]: 'py-2 px-6 w-full text-right',
    [BLOCK_QUOTE]: 'py-2 px-6 w-full text-right',
    [BLOCK_STACK]: 'mt-6 self-start',
    [BLOCK_CARD]: 'bottom-0 right-0 mr-4 mb-6 block absolute w-auto',
    [BLOCK_LIST]: 'bottom-0 right-0 mr-4 mb-6 block absolute w-auto'
};

export function renderCTA(finalType, config, postTitle) {
    if (!config.callToAction || finalType === BLOCK_GALLERY) return '';

    if (finalType === BLOCK_COMMENT) {
        return `<span class="${config.theme.text} text-label-md no-underline font-bold">${config.callToAction}</span>`;
    }

    const isSharp = config.cornerStyle === " rounded-none" || finalType === BLOCK_PANCAKE || finalType === BLOCK_QUOTE;
    const baseClasses = `inline-block text-label-lg font-bold no-underline text-center px-4 py-2 hover:opacity-80 transition-opacity opacity-75 ${config.theme.text} ${isSharp ? 'rounded-none' : 'rounded-full'}`;
    const specificClasses = CTA_CLASSES[finalType] || '';

    return `<span class="${baseClasses} ${specificClasses}" role="button" title="${postTitle}">${config.callToAction}</span>`;
}
