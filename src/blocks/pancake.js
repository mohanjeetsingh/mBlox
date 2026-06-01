import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_PANCAKE } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_PANCAKE;

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
    const bgThemeClass = (config.dataTheme !== "surface") ? ` h-full opacity-90 ${config.theme.bg} ${config.theme.text}` : ` text-on-surface`;
    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode);
    const textContentHTML = hasText ? `
        <div class="p-4 flex-grow flex flex-col${bgThemeClass}">
            ${authorCode}${dateCode}
            ${titleCode}
            ${snippetCode}
        </div>
        ${ctaButtonCode}
    ` : '';

    // Link wrapper classes
    return `<article class="col-span-1 inline-flex w-full" role="article"><a class="flex flex-col w-full ${config.theme.bg} h-full ${config.cornerStyle} ${config.interactionClasses}" href="${post.url}" title="${post.title}">${config.showImage ? imageCode : ''}${textContentHTML}</a></article>`;
}
