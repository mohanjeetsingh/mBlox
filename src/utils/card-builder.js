import { renderImage } from '../components/image.js';
import { renderCTA } from '../components/cta.js';
import { renderAuthor } from '../components/author.js';
import { renderDate } from '../components/date.js';
import { renderTitle } from '../components/title.js';
import { renderSnippet } from '../components/snippet.js';

/**
 * buildCard extracts the repetitive boilerplate involved in generating standard M3E block components.
 * It builds the component strings (author, title, image, etc.), processes theming, and delegates the final
 * HTML string construction to the provided layoutStrategy callback.
 * 
 * @param {string} finalType - The block type (e.g. BLOCK_STACK, BLOCK_CARD)
 * @param {object} post - The post data object
 * @param {number} postID - The index of the post
 * @param {object} config - The global block config
 * @param {function} layoutStrategy - A callback receiving (parts, config, bodyClass, post, postID) that returns the final HTML string.
 */
export function buildCard(finalType, post, postID, config, layoutStrategy) {
    // 1. Render all modular parts
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

    // 2. Resolve common styling
    const isDarkTheme = config.mBloxTheme !== "surface";
    const bodyClass = isDarkTheme ? ` h-full opacity-90 ${config.theme.containerBg} ${config.theme.containerText}` : ` ${config.theme.containerText}`;
    const hasText = Boolean(authorCode || dateCode || titleCode || snippetCode || ctaButtonCode);
    const hasTextContent = Boolean(authorCode || dateCode || titleCode || snippetCode);

    // 3. Resolve final fallback image logic (when no header or CTA is present)
    let finalImageCode = config.showImage ? imageCode : '';
    if (!config.showHeader && !config.callToAction && config.showImage) {
        finalImageCode = `<a href="${post.url}" class="block h-full w-full after:absolute after:inset-0 z-10" aria-label="View ${post.title.replace(/"/g, '&quot;')}">${imageCode}</a>`;
    }

    const parts = {
        authorCode, dateCode, titleCode, snippetCode, ctaButtonCode, imageCode, finalImageCode, hasText, hasTextContent
    };

    // 4. Delegate to the specific block's layout strategy
    return layoutStrategy(parts, config, bodyClass, post, postID);
}
