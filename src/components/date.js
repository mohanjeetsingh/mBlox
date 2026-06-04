import { BLOCK_COMMENT } from '../core/config.js';

export function renderDate(finalType, config, publishedDate, updatedDate) {
    if (!config.showDate) return '';
    
    const pDate = new Date(publishedDate);
    const formattedDate = config.dateFormatter.format(pDate);
    
    // For comment blocks, leave the frontend as is (long format, original layout)
    if (finalType === BLOCK_COMMENT) {
        return `<span class="text-label-md font-light">${config.showAuthor ? ' &#8226; ' : ''} ${formattedDate}</span>`;
    }

    // New format for all other blocks
    let isUpdated = false;
    if (updatedDate) {
        const uDate = new Date(updatedDate);
        // Check if updated date is at least 24 hours after published date
        if (uDate.getTime() - pDate.getTime() > 24 * 60 * 60 * 1000) {
            isUpdated = true;
        }
    }

    if (isUpdated) {
        const bgClass = config.palette.bg || 'bg-surface-variant';
        const textClass = config.palette.text || 'text-on-surface-variant';
        return `<div class="flex items-center gap-2"><span class="${bgClass} ${textClass} px-2 py-0.5 rounded-sm text-label-sm font-bold uppercase tracking-wider">Updated</span><span class="text-label-md font-light">${formattedDate}</span></div>`;
    } else {
        return `<span class="text-label-md font-light">Published ${formattedDate}</span>`;
    }
}
