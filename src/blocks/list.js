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

    // Content container (renders a Latest header bar, then falls through to card content overlay)
    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode);
    const textContentHTML = hasText ? `
        <div class="p-2 pt-0 md:p-4 flex flex-col justify-center">
            ${authorCode}${dateCode}
            ${titleCode}
            ${snippetCode}
            ${ctaButtonCode}
        </div>
    ` : '';

    // Block wrapper classes
    const bgClasses = (postID === 0 && !config.showImage) ? [config.theme.containerBg, config.theme.containerText] : [];
    const blockClasses = ['relative', 'block', config.cornerStyle, config.aspectRatio.trim(), 'w-full', 'h-full', ...bgClasses, config.interactionClasses].filter(Boolean).join(' ');
    
    const articleClasses = `col-span-1 inline-flex w-full h-full relative ${config.layout.mb}`;

    let finalImageCode = config.showImage ? imageCode : '';
    if (!config.showHeader && !config.callToAction && config.showImage) {
        finalImageCode = `<a href="${post.url}" class="block h-full w-full after:absolute after:inset-0 z-10" aria-label="View ${post.title.replace(/"/g, '&quot;')}">${imageCode}</a>`;
    }

    return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${finalImageCode}${textContentHTML}</div></article>`;
}
