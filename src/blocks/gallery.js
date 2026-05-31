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
    const classes = ['overflow-hidden', 'w-full', 'shadow-sm', 'no-underline', 'font-bold'];
    classes.push(config.cornerStyle);
    classes.push('card');
    classes.push(config.hasRoundedBorder ? `border border-3 border-opacity-75 border-${config.dataTheme}` : 'border-0');
    classes.push(config.aspectRatio.trim());
    
    const linkClasses = classes.join(' ');
    const linkWrapperStart = `<a class="${linkClasses}" href="${post.url}" title="${post.title}">`;
    const linkWrapperEnd = `</a>`;
    
    const articleClasses = 'col d-inline-flex';
    return `<article class="${articleClasses}" role="article">${linkWrapperStart}${config.showImage ? imageCode : ''}${linkWrapperEnd}</article>`;
}
