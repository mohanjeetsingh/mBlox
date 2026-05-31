import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_COVER } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_COVER;
    
    // Render parts
    const authorCode = renderAuthor(finalType, config, post.authorName, post.authorUri);
    const dateCode = renderDate(config, post.publishedDate);
    const titleCode = renderTitle(finalType, config, post.title);
    const snippetCode = renderSnippet(finalType, config, post.content);
    const ctaButtonCode = renderCTA(finalType, config, post.title);
    
    const { imageCode } = renderImage(finalType, postID, config, {
        postSnippet: post.content,
        videoID: post.videoId,
        postTitle: post.title,
        thumbnailUrl: post.thumbnailUrl,
        authorImage: post.authorImage
    });

    // Content container
    let textContentHTML = '';
    if (config.showHeader) {
        const cornerClass = (config.cornerStyle === " rounded" && config.textVerticalAlign !== "overlay") ? ' rounded-5' : config.cornerStyle;
        textContentHTML += `<div class="text-bg-${config.dataTheme} bg-opacity-75 p-4 p-sm-5 position-absolute w-75 ${cornerClass} start-50 translate-middle`;
        switch (config.textVerticalAlign) {
            case "top": textContentHTML += '-x mt-5">'; break;
            case "middle": textContentHTML += ' top-50">'; break;
            case "bottom": textContentHTML += '-x bottom-0 mb-5">'; break;
            case "overlay": textContentHTML += ' top-50 h-100 w-100">'; break;
            default: textContentHTML += ' top-50">'; break;
        }
        textContentHTML += `${authorCode}${dateCode}`;
        textContentHTML += titleCode;
        textContentHTML += snippetCode;
        textContentHTML += ctaButtonCode;
        textContentHTML += `</div>`;
    }

    // Link wrapper classes
    const classes = ['overflow-hidden', 'w-100', 'shadow-sm', 'text-decoration-none', 'fw-bold'];
    classes.push('rounded-0');
    classes.push('card');
    classes.push(config.hasRoundedBorder ? `border border-3 border-opacity-75 border-${config.dataTheme}` : 'border-0');
    classes.push('text-center');
    classes.push('h-100');
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col d-inline-flex';
    const articleStyle = ` style="${config.articleHeight}"`;
    return `<article class="${articleClasses}"${articleStyle} role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
}
