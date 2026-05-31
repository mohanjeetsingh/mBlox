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
            textContentHTML += '<div class="w-2/3 h-full flex flex-col">';
        }
        
        const isDarkTheme = config.dataTheme !== "surface";
        // Stack block's internal layout uses padding instead of card-body
        const bodyClass = isDarkTheme ? ` h-full opacity-90 ${config.theme.bg} ${config.theme.text}` : ` text-on-surface`;
        textContentHTML += `<div class="p-4 flex-grow flex flex-col justify-center${bodyClass}">`;
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
    const classes = ['overflow-hidden', 'w-full', 'shadow-sm', 'no-underline', 'font-bold', 'flex', 'flex-row', 'bg-surface'];
    classes.push(config.cornerStyle);

    classes.push('h-full');
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col-span-1 inline-flex w-full';
    return `<article class="${articleClasses}" role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${textContentHTML}${linkWrapperEnd}</article>`;
}
