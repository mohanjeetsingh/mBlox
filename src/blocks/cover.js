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
        const cornerClass = (config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl';
        textContentHTML += `<div class="${config.theme.glass} backdrop-blur-sm ${config.theme.text} p-6 md:p-12 absolute z-10 flex flex-col justify-center items-center`;
        switch (config.textVerticalAlign) {
            case "top": textContentHTML += ` w-3/4 left-1/2 -translate-x-1/2 top-8 ${cornerClass}">`; break;
            case "middle": textContentHTML += ` w-3/4 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${cornerClass}">`; break;
            case "bottom": textContentHTML += ` w-3/4 left-1/2 -translate-x-1/2 bottom-8 ${cornerClass}">`; break;
            case "overlay": textContentHTML += ` w-full h-full inset-0 rounded-none">`; break;
            default: textContentHTML += ` w-3/4 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${cornerClass}">`; break;
        }
        textContentHTML += `${authorCode}${dateCode}`;
        textContentHTML += titleCode;
        textContentHTML += snippetCode;
        textContentHTML += ctaButtonCode;
        textContentHTML += `</div>`;
    }

    // Link wrapper classes
    const classes = ['overflow-hidden', 'w-full', 'no-underline', 'font-bold', 'relative', 'block'];
    classes.push('rounded-none');

    classes.push('text-center');
    classes.push('h-full');
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col-span-1 inline-flex w-full';
    const articleStyle = ` style="${config.articleHeight}"`;
    return `<article class="${articleClasses}"${articleStyle} role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
}
