import { renderHeaderTitle } from '../components/header-title.js';
import { renderHeaderDescription } from '../components/header-description.js';

export function renderBlockHeader(config) {
    if (!config.mBlockTitle) return '';
    return `<div class="p-8 @lg:px-12">${renderHeaderTitle(config)}${renderHeaderDescription(config)}</div>`;
}
