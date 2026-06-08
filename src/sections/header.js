import { renderHeaderTitle } from '../components/header-title.js';
import { renderHeaderDescription } from '../components/header-description.js';

export function renderBlockHeader(config) {
    if (!config.mBlockTitle) return '';
    return `<div class="py-8 ${config.layout.px}">${renderHeaderTitle(config)}${renderHeaderDescription(config)}</div>`;
}
