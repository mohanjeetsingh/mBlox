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
    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode);
    const textContentHTML = hasText ? `
        <div class="${config.theme.glass} backdrop-blur-xl ${config.theme.text} p-6 md:p-12 absolute z-10 flex flex-col justify-center items-center ${
            {
                top: `w-3/4 left-1/2 -translate-x-1/2 top-8 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`,
                middle: `w-3/4 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`,
                bottom: `w-3/4 left-1/2 -translate-x-1/2 bottom-8 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`,
                overlay: `w-full h-full inset-0 rounded-none`
            }[config.textVerticalAlign] || `w-3/4 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`
        }">
            ${authorCode}${dateCode}
            ${titleCode}
            ${snippetCode}
            ${ctaButtonCode}
        </div>
    ` : '';

    // Link wrapper classes
    const linkClasses = ['relative', 'block', 'w-full', 'rounded-none', 'text-center', 'h-full', config.interactionClasses].filter(Boolean).join(' ');

    const articleClasses = 'col-span-1 inline-flex w-full';
    const articleStyle = ` style="${config.articleHeight}"`;
    return `<article class="${articleClasses}"${articleStyle} role="article"><a class="${linkClasses}" href="${post.url}" title="${post.title}">${config.showImage ? imageCode : ''}${textContentHTML}</a></article>`;
}
