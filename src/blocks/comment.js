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
    const titleCode = renderTitle(finalType, config, post.title, post.url);
    const snippetCode = renderSnippet(finalType, config, post.content);
    const ctaButtonCode = renderCTA(finalType, config, post.title, post.url);

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

    const blockClasses = `rounded-none ${config.theme.containerBg} flex flex-row items-start ${config.interactionClasses}`;

    let finalImageCode = config.showImage ? imageCode : '';
    if (!config.showHeader && !config.callToAction && config.showImage) {
        finalImageCode = `<a href="${post.url}" class="block h-full w-full after:absolute after:inset-0 z-10" aria-label="View ${post.title.replace(/"/g, '&quot;')}">${imageCode}</a>`;
    }

    return `
        <article class="col-span-1 inline-flex w-full relative" role="article">
            <div class="${blockClasses}">
                ${finalImageCode}
                ${textContentHTML}
            </div>
        </article>
    `;
}
