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
    const isDarkTheme = config.dataTheme !== "surface";
    const bodyClass = isDarkTheme ? ` h-full opacity-90 ${config.theme.bg} ${config.theme.text}` : ` text-on-surface`;

    const innerContent = `
        <div class="p-4 flex-grow flex flex-col justify-center${bodyClass}">
            ${authorCode}${dateCode}
            ${titleCode}
            ${snippetCode}
            ${ctaButtonCode}
        </div>
    `;

    const isIndependentStack = config.blockType === BLOCK_STACK;
    const textWidthClass = isIndependentStack ? 'w-3/4' : 'w-2/3';

    const textContentHTML = config.showHeader ?
        (config.showImage ? `<div class="${textWidthClass} h-full flex flex-col">${innerContent}</div>` : innerContent)
        : '';

    // Link wrapper classes
    const linkClasses = ['flex', 'flex-row', 'bg-surface', config.cornerStyle, 'w-full', 'h-full'].filter(Boolean).join(' ');

    const articleClasses = 'col-span-1 inline-flex w-full';
    return `<article class="${articleClasses}" role="article"><a class="${linkClasses}" href="${post.url}" title="${post.title}">${config.showImage ? imageCode : ''}${textContentHTML}</a></article>`;
}
