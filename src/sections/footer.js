import { BLOCK_COVER } from '../core/config.js';
export function renderBlockFooter(config, response) {
    if (config.moreText === "" && config.blockType === BLOCK_COVER) return '';
    let moreLinkHTML = '';
    if (config.moreText !== "") {
        if (response.feedUrl) {
            moreLinkHTML = `<a class="inline-block border-0 font-bold no-underline" href="${config.siteURL}search?max-results=9" title="View all">
                            ${config.moreText} <svg class="inline-block align-text-bottom" fill="currentColor" height="1.2em" viewBox="0 0 16 16" width="1.2em" xmlns="http://www.w3.org/2000/svg"><use href="#icon-caret-right"></use></svg></a>`;
        }
    }
    return `<div class="st${config.stageID} mblox-footer w-full p-8 @lg:px-12 text-right">${moreLinkHTML}</div>`;
}
