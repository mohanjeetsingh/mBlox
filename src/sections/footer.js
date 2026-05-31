import { BLOCK_COVER } from '../core/config.js';
export function renderBlockFooter(config, response) {
    if (config.moreText === "" && config.blockType === BLOCK_COVER) return '';
    let moreLinkHTML = '';
    if (config.moreText !== "") {
        if (response.feedUrl) {
            moreLinkHTML = `<a class="${config.theme.bg} ${config.theme.text} border-0 font-bold no-underline ${config.lowContrast ? "opacity-50" : "opacity-75"}" href="${config.siteURL}search?max-results=30" title="View all">
                            ${config.moreText} <svg class="bi bi-caret-right-fill" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></a>`;
        }
    }
    return `<div class="st${config.stageID} mblox-footer w-full pr-5 py-8 flex justify-end ${config.theme.bg}">${moreLinkHTML}</div>`;
}
