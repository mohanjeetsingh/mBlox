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
    const innerContent = hasText ? `
        <div class="p-4 flex-grow flex flex-col justify-center${bodyClass}">
            ${authorCode}${dateCode}
            ${titleCode}
            ${snippetCode}
            ${ctaButtonCode}
        </div>
    ` : '';

    const isIndependentStack = config.blockType === BLOCK_STACK;
    const textWidthClass = isIndependentStack ? 'w-3/4' : 'w-2/3';

    const textContentHTML = hasText ? (config.showImage ? `<div class="${textWidthClass} h-full flex flex-col">${innerContent}</div>` : innerContent) : '';

    // Block wrapper classes
    const blockClasses = ['flex', 'flex-row', config.theme.containerBg, config.cornerStyle, 'w-full', 'h-full', config.interactionClasses].filter(Boolean).join(' ');

    const articleClasses = `col-span-1 inline-flex w-full relative h-full ${config.layout.mb}`;
    
    let finalImageCode = config.showImage ? imageCode : '';
    if (!config.showHeader && !config.callToAction && config.showImage) {
        finalImageCode = `<a href="${post.url}" class="block h-full w-full after:absolute after:inset-0 z-10" aria-label="View ${post.title.replace(/"/g, '&quot;')}">${imageCode}</a>`;
    }

    return `<article class="${articleClasses}" role="article"><div class="${blockClasses}">${finalImageCode}${textContentHTML}</div></article>`;
}
