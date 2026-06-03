/**
 * mBlox Bootstrap 5 Renderer - Modular
 */

import { renderBlockHeader } from '../sections/header.js';
import { renderBlockFooter } from '../sections/footer.js';
import { renderStageLayout } from '../layouts/stage.js';
import { renderCarouselIndicators, initCarousel } from '../components/carousel.js';
import { renderNavigationControls } from '../components/navigation.js';
import { 
    BLOCK_COVER, BLOCK_SHOWCASE, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY,
    BLOCK_PANCAKE, BLOCK_STACK, BLOCK_QUOTE, BLOCK_COMMENT,
    RESPONSIVE_GRID_CLASSES_M3E, noImg
} from '../core/config.js';
import { fadeIn, fadeOut } from '../utils/dom.js';
import { getVideoIframe } from '../components/video.js';

const BLOCK_NAME_MAP = {
    [BLOCK_COVER]: 'cover',
    [BLOCK_SHOWCASE]: 'showcase',
    [BLOCK_LIST]: 'list',
    [BLOCK_CARD]: 'card',
    [BLOCK_GALLERY]: 'gallery',
    [BLOCK_PANCAKE]: 'pancake',
    [BLOCK_STACK]: 'stack',
    [BLOCK_QUOTE]: 'quote',
    [BLOCK_COMMENT]: 'comment'
};

function getBlockScriptUrl(blockName) {
    let baseUrl = import.meta.url;
    baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
    
    // In dev: engine/renderer is in src/core or src/design, blocks are in src/blocks
    if (baseUrl.includes('/src/core') || baseUrl.includes('/src/design')) {
        const base = baseUrl.includes('/src/core') ? baseUrl.replace('/src/core', '') : baseUrl.replace('/src/design', '');
        return `${base}/src/blocks/${blockName}.js`;
    } else {
        // Prod: assets in /dist
        const capitalizedBlockName = blockName.charAt(0).toUpperCase() + blockName.slice(1);
        return `${baseUrl}/mBlox${capitalizedBlockName}.js`;
    }
}

export class M3ERenderer {
    
    async buildBlockBody(response, config) {
        let blockBody = '';
        let showcaseHTML = '';
        let carouselIndicators = null;
        const postsInFeed = response.posts.length;
        const isComplexLayout = (config.blockType === BLOCK_LIST || config.blockType === BLOCK_SHOWCASE);

        if (config.isCarousel) {
            carouselIndicators = null; // Disabled for CSS Scroll Snap implementation
        }

        // Determine all block types needed
        const neededTypes = new Set([config.blockType]);
        if (config.blockType === BLOCK_LIST) {
            neededTypes.add(config.showHeader ? BLOCK_STACK : BLOCK_CARD);
        }

        // Dynamically import all needed block renderers
        const renderers = {};
        await Promise.all(Array.from(neededTypes).map(async (type) => {
            const blockName = BLOCK_NAME_MAP[type];
            if (blockName) {
                const url = getBlockScriptUrl(blockName);
                const module = await import(url);
                renderers[type] = module;
            }
        }));

        if (config.blockType === BLOCK_SHOWCASE && postsInFeed > 0) {
            if (config.firstInstance) {
                // First post is feature post (renders big feature block)
                showcaseHTML = renderers[BLOCK_SHOWCASE].render(response.posts[0], 0, config);
            }

            const renderedBlocks = [];
            for (let postID = 0; postID < postsInFeed; postID++) {
                let thumbHTML = renderers[BLOCK_SHOWCASE].renderThumbnail(response.posts[postID], config);
                if (config.isCarousel) {
                    thumbHTML = thumbHTML.replace('<article class="', '<article class="snap-start ');
                }
                renderedBlocks.push(thumbHTML);
            }
            return { renderedBlocks, carouselIndicators, showcaseHTML };
        }

        const renderedBlocks = [];
        for (let postID = 0; postID < postsInFeed; postID++) {
            const post = response.posts[postID];
            let currentColumnCount = config.columnCount;
            
            let finalType = config.blockType; 
            if (config.blockType === BLOCK_LIST && postID > 0) {
                finalType = config.showHeader ? BLOCK_STACK : BLOCK_CARD;
                if (postID === 1 && config.showHeader) currentColumnCount--;
            }

            let postHTML = renderers[finalType].render(post, postID, config);
            if (config.isCarousel) {
                postHTML = postHTML.replace('<article class="', '<article class="snap-start ');
            }

            renderedBlocks.push(postHTML);
        }

        return { renderedBlocks, carouselIndicators, showcaseHTML };
    }

    createBlockHeader(config) {
        return renderBlockHeader(config);
    }

    createBlockFooter(config, response) {
        return renderBlockFooter(config, response);
    }

    createStageWrapper(blockBody, carouselIndicators, config, response) {
        const indicators = config.isCarousel ? renderCarouselIndicators(carouselIndicators, config, response) : '';
        const nav = renderNavigationControls(config, response);
        const content = `${indicators}${blockBody}${nav}`;
        return renderStageLayout(content, config);
    }

    bindEvents(rawElement, config) {
        this._bindShowcaseEvents(rawElement, config);
        this._bindPaginationEvents(rawElement, config);
        initCarousel(rawElement, config);
    }

    _bindShowcaseEvents(rawElement, config) {
        if (rawElement.dataset.showcaseBound) return;
        
        const featuredImageNode = rawElement.closest('.mBlock, .mBlockL')?.querySelector('.feature-image');
        if (!featuredImageNode) return;
        
        rawElement.dataset.showcaseBound = "true";

        const figureNode = featuredImageNode.querySelector('figure');
        const iFrameNode = featuredImageNode.querySelector('.sIframe');
        const contentNode = featuredImageNode.querySelector('.sContent');

        if (figureNode) {
            figureNode.addEventListener('click', function () {
                const videoId = this.getAttribute('data-vidid');
                if (videoId && videoId !== "noVideo") {
                    if (iFrameNode) {
                        iFrameNode.innerHTML = getVideoIframe(videoId, config);
                        iFrameNode.style.display = '';
                        iFrameNode.style.opacity = '1';
                        iFrameNode.classList.remove('hidden');
                        
                        figureNode.style.display = 'none';
                        if (contentNode) contentNode.style.display = 'none';
                        const link = featuredImageNode.querySelector('a');
                        if (link) link.style.display = 'none';
                    }
                } else {
                    const link = featuredImageNode.querySelector('a');
                    if (link && link.href) window.location.href = link.href;
                }
            });
        }

        const mainLink = featuredImageNode.querySelector('a');
        if (mainLink) {
            mainLink.addEventListener('click', function (e) {
                if (figureNode) {
                    const videoId = figureNode.getAttribute('data-vidid');
                    if (videoId && videoId !== "noVideo") {
                        e.preventDefault();
                        figureNode.click();
                    }
                }
            });
        }

        rawElement.addEventListener('click', function (event) {
            const clickedPost = event.target.closest('.sPost');
            if (!clickedPost) return; 

            // Only act if this post is part of a showcase grid (sFeature)
            if (!clickedPost.closest('.sFeature')) return;

            const data = {
                vidid: clickedPost.getAttribute('data-vidid'),
                title: clickedPost.getAttribute('data-title'),
                summary: clickedPost.getAttribute('data-summary'),
                link: clickedPost.getAttribute('data-link'),
                imgHigh: clickedPost.getAttribute('data-img-high') || clickedPost.querySelector('img')?.getAttribute('data-img-high') || ''
            };

            // --- Check for focus state (double-click navigation) ---
            const isFocused = clickedPost.classList.contains('ring-4');
            if (isFocused) {
                window.location.href = data.link;
                return;
            }

            // --- Apply focus styling to clicked item ---
            const allPosts = rawElement.querySelectorAll('.sFeature .sPost');
            allPosts.forEach(post => {
                post.classList.remove('ring-4', 'ring-current', 'ring-inset');
            });
            clickedPost.classList.add('ring-4', 'ring-current', 'ring-inset');

            // --- Update the main feature image or launch video ---
            if (data.vidid && data.vidid !== 'noVideo') {
                if (iFrameNode) {
                    iFrameNode.innerHTML = getVideoIframe(data.vidid, config);
                    fadeIn(iFrameNode);
                }
                fadeOut(figureNode);
                fadeOut(contentNode);
                const link = featuredImageNode.querySelector('a');
                if (link) link.style.display = 'none';
            } else {
                if (iFrameNode) {
                    iFrameNode.innerHTML = '';
                    fadeOut(iFrameNode);
                }
                if (figureNode) {
                    if (data.vidid === 'noVideo' || !data.vidid) {
                        figureNode.removeAttribute('data-vidid');
                    }
                    let playIcon = figureNode.querySelector('svg');
                    if (playIcon) fadeOut(playIcon);
                    figureNode.style.backgroundImage = `url("${data.imgHigh}")`;
                    figureNode.style.backgroundSize = 'cover';
                    fadeIn(figureNode);
                }

                // --- Update the content overlay for non-video items ---
                if (contentNode) {
                    fadeIn(contentNode);
                    const h5 = contentNode.querySelector('h5');
                    if (h5) h5.textContent = data.title;
                    const summary = contentNode.querySelector('.list-none') || contentNode.querySelector('div.text-body-md');
                    if (summary) summary.innerHTML = data.summary;
                }
                const link = featuredImageNode.querySelector('a');
                if (link) {
                    link.style.display = '';
                    link.href = data.link;
                    link.title = data.title;
                }
                const button = featuredImageNode.querySelector('button');
                if (button) button.title = data.title;
            }
        });
    }

    _bindPaginationEvents(rawElement, config) {
        if (!config) return;
        const stage = config.stageID;
        const prevButtons = rawElement.querySelectorAll(`.st${stage} .nav-prev`);
        const nextButtons = rawElement.querySelectorAll(`.st${stage} .nav-next`);

        prevButtons.forEach(prevButton => {
            if (prevButton.dataset.bound) return;
            prevButton.dataset.bound = "true";
            prevButton.addEventListener('click', () => {
                const currentStage = parseInt(rawElement.getAttribute("data-s"), 10);
                if (currentStage <= 1) return;
                const prevStage = currentStage - 1;
                rawElement.setAttribute("data-s", prevStage);
                
                rawElement.style.minHeight = rawElement.clientHeight + 'px';
                
                fadeOut(rawElement.querySelector(`div#m${config.mBlockID}-st${currentStage}`));
                fadeOut(rawElement.querySelector(`div.mblox-footer.st${currentStage}`));
                
                setTimeout(() => {
                    fadeIn(rawElement.querySelector(`div#m${config.mBlockID}-st${prevStage}`));
                    fadeIn(rawElement.querySelector(`div.mblox-footer.st${prevStage}`));
                    rawElement.style.minHeight = '';
                }, 160);
            });
        });

        nextButtons.forEach(nextButton => {
            if (nextButton.dataset.bound) return;
            nextButton.dataset.bound = "true";
            nextButton.addEventListener('click', () => {
                const currentStage = parseInt(rawElement.getAttribute("data-s"), 10);
                const nextStage = currentStage + 1;
                rawElement.setAttribute("data-s", nextStage);
                
                rawElement.style.minHeight = rawElement.clientHeight + 'px';
                rawElement.classList.add('relative');

                fadeOut(rawElement.querySelector(`div#m${config.mBlockID}-st${currentStage}`));
                const currentFooter = rawElement.querySelector(`div.mblox-footer.st${currentStage}`);
                if (currentFooter) fadeOut(currentFooter);
                
                const nextStageEl = rawElement.querySelector(`div#m${config.mBlockID}-st${nextStage}`);
                
                if (nextStageEl) {
                    setTimeout(() => {
                        fadeIn(nextStageEl);
                        fadeIn(rawElement.querySelector(`div.mblox-footer.st${nextStage}`));
                        rawElement.style.minHeight = '';
                    }, 160);
                } else {
                    const skeletonHtml = `
                    <style>
                        @keyframes mblox-loader-anim {
                            0% { transform: rotate(0deg) scale(0.8); }
                            50% { transform: rotate(180deg) scale(1.1); }
                            100% { transform: rotate(360deg) scale(0.8); }
                        }
                    </style>
                    <div id="m${config.mBlockID}-st${nextStage}-loading" class="absolute inset-0 flex items-center justify-center z-10" style="min-height: 200px;">
                        <svg class="w-12 h-12 text-current opacity-80" viewBox="0 0 56 56" style="--scroll-progress: 0; animation: mblox-loader-anim 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;"><use href="#icon-progress-m3e"></use></svg>
                    </div>`;
                    rawElement.insertAdjacentHTML('beforeend', skeletonHtml);
                    
                    const customEvent = new CustomEvent('mblox:loadNextPage', { detail: { element: rawElement } });
                    rawElement.dispatchEvent(customEvent);
                }
            });
        });
    }
}
