import { renderHeaderTitle } from '../components/header-title.js';
import { renderHeaderDescription } from '../components/header-description.js';

export function renderBlockHeader(config) {
    if (!config.dataTitle) return '';
    return `<div class="text-center ${config.theme.bg} py-8">${renderHeaderTitle(config)}${renderHeaderDescription(config)}</div>`;
}
