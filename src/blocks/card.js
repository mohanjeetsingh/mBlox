import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { BLOCK_CARD } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_CARD;

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
    const textContentHTML = config.showHeader ? `
        <div class="absolute inset-0 flex flex-col p-0 border-0 ${
            { top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign] || ''
        }">
            <div class="${(config.textVerticalAlign === 'overlay' || !({ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign])) ? 'h-full ' : ''}${config.theme.glass} backdrop-blur-xl ${config.theme.text} rounded-none p-8">
                ${authorCode}${dateCode}
                ${titleCode}
                ${snippetCode}
                ${ctaButtonCode}
            </div>
        </div>
    ` : '';

    // Link wrapper classes
    const linkClasses = ['relative', 'block', config.cornerStyle, config.aspectRatio.trim(), 'h-full', config.interactionClasses].filter(Boolean).join(' ');

    const articleClasses = 'col-span-1 inline-flex w-full';
    return `<article class="${articleClasses}" role="article"><a class="${linkClasses}" href="${post.url}" title="${post.title}">${config.showImage ? imageCode : ''}${textContentHTML}</a></article>`;
}
