import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_CARD } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_CARD;
    
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
        textContentHTML += `<div class="card-img-overlay d-flex flex-column p-0 border-0`;
        switch (config.textVerticalAlign) {
            case "top": textContentHTML += ' justify-content-start"><div class="text-bg-'; break;
            case "middle": textContentHTML += ' justify-content-center"><div class="text-bg-'; break;
            case "bottom": textContentHTML += ' justify-content-end"><div class="text-bg-'; break;
            case "overlay": textContentHTML += '"><div class="h-100 text-bg-'; break;
            default: textContentHTML += '"><div class="h-100 text-bg-'; break;
        }
        textContentHTML += `${config.dataTheme} bg-opacity-75 rounded-0 p-5">`;
        textContentHTML += `${authorCode}${dateCode}`;
        textContentHTML += titleCode;
        textContentHTML += snippetCode;
        textContentHTML += ctaButtonCode;
        textContentHTML += `</div></div>`;
    }

    // Link wrapper classes
    const classes = ['overflow-hidden', 'w-100', 'shadow-sm', 'text-decoration-none', 'fw-bold'];
    classes.push(config.cornerStyle);
    classes.push('card');
    classes.push(config.hasRoundedBorder ? `border border-3 border-opacity-75 border-${config.dataTheme}` : 'border-0');
    classes.push(config.aspectRatio.trim());
    classes.push('h-100');
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col d-inline-flex';
    return `<article class="${articleClasses}" role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
}
