import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';
import { renderLabels } from '../components/labels.js';
import { BLOCK_COVER } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_COVER;

    // Render parts
    const authorCode = renderAuthor(finalType, config, post.authorName, post.authorUri);
    const dateCode = renderDate(config, post.publishedDate);
    const titleCode = renderTitle(finalType, config, post.title, post.url);
    const snippetCode = renderSnippet(finalType, config, post.content);
    const ctaButtonCode = renderCTA(finalType, config, post.title, post.url);
    const labelsCode = renderLabels(config, post.labels, config.siteURL);

    const { imageCode } = renderImage(finalType, postID, config, {
        postSnippet: post.content,
        videoID: post.videoId,
        postTitle: post.title,
        thumbnailUrl: post.thumbnailUrl,
        authorImage: post.authorImage,
        post: post
    });

    // Content container
    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode || labelsCode);
    const textContentHTML = hasText ? `
        <div class="${config.palette.containerGlass} backdrop-blur-xl ${config.palette.containerText} p-2 @xs:p-4 @sm:p-8 @md:p-12 absolute z-10 flex flex-col justify-center items-center ${{
            top: `w-3/4 left-1/2 -translate-x-1/2 top-8 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`,
            middle: `w-3/4 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`,
            bottom: `w-3/4 left-1/2 -translate-x-1/2 bottom-8 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`,
            overlay: `w-full h-full inset-0 rounded-none`
        }[config.textVerticalAlign] || `w-3/4 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${(config.cornerStyle === " rounded-none" || config.textVerticalAlign === "overlay") ? ' rounded-none' : ' rounded-3xl'}`
        }">
            ${authorCode}${dateCode}
            ${labelsCode}
            ${titleCode}
            ${snippetCode}
            ${ctaButtonCode}
        </div>
    ` : '';

    // Block wrapper classes
    const blockClasses = ['relative', 'block', 'w-full', 'rounded-none', 'text-' + config.textHAlign, 'h-full', config.interactionClasses].filter(Boolean).join(' ');

    const articleStyle = config.articleHeight ? ` style="${config.articleHeight.replace(';', '')}"` : '';
    const articleClasses = '@container col-span-1 inline-flex w-full relative';

    let finalImageCode = config.showImage ? imageCode : '';
    if (!config.showHeader && !config.callToAction) {
        finalImageCode = `<a href="${post.url}" class="absolute inset-0 z-10" aria-label="View ${post.title.replace(/"/g, '&quot;')}"></a>${imageCode}`;
    }

    return `<article class="${articleClasses}"${articleStyle} role="article"><div class="${blockClasses}">${finalImageCode}${textContentHTML}</div></article>`;
}
