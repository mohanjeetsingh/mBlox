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

    // Content container (renders a Latest header bar, then falls through to card content overlay)
    const textContentHTML = config.showHeader ? `
        <div class="absolute top-0 left-0 ${config.theme.glass} ${config.theme.text} backdrop-blur-xl rounded-none pl-10 py-6 w-full z-20 h-auto">Latest</div>
        <div class="absolute inset-0 flex flex-col p-0 z-10 ${
            { top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign] || ''
        }">
            <div class="${(config.textVerticalAlign === 'overlay' || !({ top: 'justify-start', middle: 'justify-center', bottom: 'justify-end', overlay: '' }[config.textVerticalAlign])) ? 'h-full ' : ''}${config.theme.glass} backdrop-blur-xl ${config.theme.text} rounded-none p-8 pt-20">
                ${authorCode}${dateCode}
                ${titleCode}
                ${snippetCode}
                ${ctaButtonCode}
            </div>
        </div>
    ` : '';

    // Link wrapper classes
    const linkClasses = ['relative', 'block', config.cornerStyle, config.aspectRatio.trim(), 'w-full', 'h-full'].filter(Boolean).join(' ');
    
    const articleClasses = `col-span-1 inline-flex w-full h-full ${config.layout.mb}`;
    return `<article class="${articleClasses}" role="article"><a class="${linkClasses}" href="${post.url}" title="${post.title}">${config.showImage ? imageCode : ''}${textContentHTML}</a></article>`;
}
