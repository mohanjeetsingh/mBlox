import { BLOCK_COVER } from '../core/config.js';

export function renderSnippet(finalType, config, postContent) {
    if (!config.showSnippet || !postContent) return '';
    
    const doc = new DOMParser().parseFromString(postContent, 'text/html');
    let snippetText = doc.body.textContent || "";
    if (snippetText.length > config.snippetSize) {
        snippetText = snippetText.substring(0, config.snippetSize) + "...";
    }

    const paddingClass = (finalType === BLOCK_COVER) ? 'py-6 d-block mx-lg-5' : '';
    const textMutedClass = (config.dataTheme === 'light') ? 'text-muted' : 'opacity-75';
    const contrastClass = config.lowContrast ? 'opacity-75' : '';

    return `<summary class="list-unstyled ${textMutedClass} ${paddingClass} ${contrastClass}">${snippetText}</summary>`;
}
