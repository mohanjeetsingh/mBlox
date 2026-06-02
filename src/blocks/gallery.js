import { renderImage } from '../components/image.js';
import { BLOCK_GALLERY } from '../core/config.js';

export function render(post, postID, config) {
    const finalType = BLOCK_GALLERY;
    
    const { imageCode } = renderImage(finalType, postID, config, {
        postSnippet: post.content,
        videoID: post.videoId,
        postTitle: post.title,
        thumbnailUrl: post.thumbnailUrl,
        authorImage: post.authorImage
    });

    // Link wrapper classes
    const linkClasses = ['block', 'relative', 'w-full', config.cornerStyle, config.aspectRatio.trim(), config.interactionClasses].filter(Boolean).join(' ');
    
    const articleClasses = 'col-span-1 inline-flex w-full';
    return `<article class="${articleClasses}" role="article"><a class="${linkClasses}" href="${post.url}" title="${post.title}" aria-label="View ${post.title.replace(/"/g, '&quot;')}">${config.showImage ? imageCode : ''}</a></article>`;
}
