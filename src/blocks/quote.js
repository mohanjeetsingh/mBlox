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

    // Content container
    const isDarkTheme = config.mBloxTheme !== "surface";
    const bodyClass = isDarkTheme ? ` h-full opacity-90 ${config.theme.containerBg} ${config.theme.containerText}` : ` ${config.theme.containerText}`;

    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode);
    const textContentHTML = hasText ? `
        <div class="p-8 flex-grow flex flex-col">
            ${titleCode}
            ${snippetCode}
            <span class="mt-4 text-right">
                ${authorCode} ${dateCode}
            </span>
        </div>
        ${ctaButtonCode}
    ` : '';

    // Block wrapper classes
    const blockClasses = ['flex', 'flex-col', 'w-full', config.theme.containerBg, config.cornerStyle, 'text-center', 'h-full', config.interactionClasses].filter(Boolean).join(' ');

    const articleClasses = 'col-span-1 inline-flex w-full relative';

    let finalImageCode = config.showImage ? imageCode : '';
    if (!config.showHeader && !config.callToAction && config.showImage) {
        finalImageCode = `<a href="${post.url}" class="block h-full w-full after:absolute after:inset-0 z-10" aria-label="View ${post.title.replace(/"/g, '&quot;')}">${imageCode}</a>`;
    }

    return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${finalImageCode}${textContentHTML}</div></article>`;
}
