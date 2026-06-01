import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_COMMENT } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_COMMENT;

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

    const textContentHTML = `
        <div class="w-full pl-14 pt-2">
            ${authorCode}${dateCode}
            ${titleCode}
            ${snippetCode}
            ${ctaButtonCode}
        </div>
    `;

    const linkClasses = `rounded-none ${config.theme.bg} flex flex-row items-start ${config.interactionClasses}`;

    return `
        <article class="col-span-1 inline-flex w-full" role="article">
            <a class="${linkClasses}" href="${post.url}" title="${post.title}">
                ${config.showImage ? imageCode : ''}
                ${textContentHTML}
            </a>
        </article>
    `;
}
