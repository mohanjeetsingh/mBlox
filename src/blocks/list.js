import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_LIST } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_LIST;
    
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

    // Content container (renders a Latest header bar, then falls through to card content overlay)
    let textContentHTML = '';
    if (config.showHeader) {
        // "Latest" header bar specific to list type
        textContentHTML += `<div class="absolute top-0 left-0 ${config.theme.glass} ${config.theme.text} backdrop-blur-sm rounded-none pl-10 py-6 w-full z-20 h-auto">Latest</div>`;
        
        // Falling through to Card content style
        textContentHTML += `<div class="absolute inset-0 flex flex-col p-0 z-10`;
        switch (config.textVerticalAlign) {
            case "top": textContentHTML += ' justify-start"><div class="'; break;
            case "middle": textContentHTML += ' justify-center"><div class="'; break;
            case "bottom": textContentHTML += ' justify-end"><div class="'; break;
            case "overlay": textContentHTML += '"><div class="h-full '; break;
            default: textContentHTML += '"><div class="h-full '; break;
        }
        textContentHTML += `${config.theme.glass} backdrop-blur-md ${config.theme.text} rounded-none p-8 pt-20">`;
        textContentHTML += `${authorCode}${dateCode}`;
        textContentHTML += titleCode;
        textContentHTML += snippetCode;
        textContentHTML += ctaButtonCode;
        textContentHTML += `</div></div>`;
    }

    // Link wrapper classes
    const classes = ['overflow-hidden', 'w-full', 'shadow-sm', 'no-underline', 'font-bold', 'relative', 'block'];
    classes.push(config.cornerStyle);

    classes.push(config.aspectRatio.trim());
    classes.push(config.layout.mt);
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col-span-1 inline-flex w-full';
    return `<article class="${articleClasses}" role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
}
