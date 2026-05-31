import { BLOCK_COVER } from '../core/config.js';
export function renderBlockFooter(config, response) {
    if (config.moreText === "" && config.blockType === BLOCK_COVER) return '';
    let moreLinkHTML = '';
    if (config.moreText !== "") {
        if (response.feedUrl) {
            moreLinkHTML = `<a class="border-0 font-bold no-underline" href="${config.siteURL}search?max-results=9" title="View all">
                            ${config.moreText} <svg class="inline-block" fill="currentColor" height="1em" viewBox="0 0 16 16" width="1em" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg></a>`;
        }
    }
    return `<div class="st${config.stageID} mblox-footer w-full pr-5 py-8 flex justify-end ${config.theme.bg}">${moreLinkHTML}</div>`;
}
