import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_QUOTE } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_QUOTE;

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
    const isDarkTheme = config.dataTheme !== "surface";
    const bodyClass = isDarkTheme ? ` h-full opacity-90 ${config.theme.bg} ${config.theme.text}` : ` text-on-surface`;

    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode);
    const textContentHTML = hasText ? `
        <div class="p-8 flex-grow flex flex-col items-center">
            ${titleCode}
            ${snippetCode}
            <span class="mt-4">
                ${authorCode} ${dateCode}
            </span>
        </div>
        ${ctaButtonCode}
    ` : '';

    // Link wrapper classes
    const linkClasses = ['flex', 'flex-col', config.theme.bg, config.cornerStyle, 'text-center', 'h-full', config.interactionClasses].filter(Boolean).join(' ');

    const articleClasses = 'col-span-1 inline-flex w-full';
    return `<article class="${articleClasses}" role="article"><a class="${linkClasses}" href="${post.url}" title="${post.title}">${config.showImage ? imageCode : ''}${textContentHTML}</a></article>`;
}
