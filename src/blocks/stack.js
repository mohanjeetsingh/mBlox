import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_STACK } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_STACK;
    
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
        if (config.showImage) {
            textContentHTML += '<div class="col-8 h-100">';
        }
        
        const isDarkTheme = config.dataTheme !== "light";
        // Stack block's internal layout uses card-body
        const bodyClass = isDarkTheme ? ` h-100 bg-opacity-75 text-bg-${config.dataTheme}` : ` text-${config.inverseTheme}`;
        textContentHTML += `<div class="card-body${bodyClass}">`;
        textContentHTML += `${authorCode}${dateCode}`;
        textContentHTML += titleCode;
        textContentHTML += snippetCode;
        textContentHTML += ctaButtonCode;
        textContentHTML += `</div>`;
        
        if (config.showImage) {
            textContentHTML += `</div>`;
        }
    }

    // Link wrapper classes
    const classes = ['overflow-hidden', 'w-100', 'shadow-sm', 'text-decoration-none', 'fw-bold'];
    classes.push(config.cornerStyle);
    classes.push('card');
    classes.push(config.hasRoundedBorder ? `border border-3 border-opacity-75 border-${config.dataTheme}` : 'border-0');
    classes.push('h-100');
    classes.push('row', 'g-0');
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col d-inline-flex';
    return `<article class="${articleClasses}" role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
}
