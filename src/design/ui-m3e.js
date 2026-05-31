/**
 * mBlox Bootstrap 5 Renderer - Modular
 */

import { renderBlockHeader } from '../sections/header.js';
import { renderBlockFooter } from '../sections/footer.js';
import { renderCarouselControls } from '../components/navigation.js';
import { renderCarousel, initCarousel } from '../components/carousel.js';
import { 
    BLOCK_COVER, BLOCK_SHOWCASE, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY, 
    BLOCK_PANCAKE, BLOCK_STACK, BLOCK_QUOTE, BLOCK_COMMENT,
    fadeIn, fadeOut 
} from '../core/config.js';
import { getVideoIframe } from '../components/video.js';

const RESPONSIVE_GRID_CLASSES = {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
    5: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
};

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

            const itemsPerSlide = Math.min(postsInFeed, config.actualColumnCount * config.blockRows);
            let currentSlide = 0;

            if (config.isCarousel) {
                for (let i = 0; i < postsInFeed; i++) {
                    if (i % itemsPerSlide === 0) {
                        if (i > 0) blockBody += `</div></div>`; 
                        blockBody += `<div class="snap-start shrink-0 min-w-full">`;
                        blockBody += `<div class="${config.layout.gap} px-2 sm:px-3 md:px-4 lg:px-5 ${RESPONSIVE_GRID_CLASSES[config.columnCount] || ''}">`;
                    }
                    blockBody += renderers[BLOCK_SHOWCASE].renderThumbnail(response.posts[i], config);
                }
                blockBody += `</div></div>`; 
            } else {
                blockBody += `<div class="${config.layout.gap} ${RESPONSIVE_GRID_CLASSES[config.columnCount] || ''}">`;
                for (let postID = 0; postID < postsInFeed; postID++) {
                    blockBody += renderers[BLOCK_SHOWCASE].renderThumbnail(response.posts[postID], config);
                }
                blockBody += `</div>`;
            }
            return { blockBody, carouselIndicators, showcaseHTML };
        }

        for (let postID = 0; postID < postsInFeed; postID++) {
            const post = response.posts[postID];
            let currentColumnCount = config.columnCount;
            
            let finalType = config.blockType; 
            if (config.blockType === BLOCK_LIST && postID > 0) {
                finalType = config.showHeader ? BLOCK_STACK : BLOCK_CARD;
                if (postID === 1 && config.showHeader) currentColumnCount--;
            }

            const postHTML = renderers[finalType].render(post, postID, config);

            // Removed carousel indicator generation

            const isFirstItemInLoop = postID === 0;
            const startNewRow = isFirstItemInLoop ||
                (config.isCarousel && postID % (config.actualColumnCount * config.blockRows) === 0) ||
                (config.blockType === BLOCK_LIST && postID === 1);

            if (startNewRow) {
                if (postID > 0) {
                    const prevPostID = postID - 1;
                    const wasPrevLastItemInSlide = config.isCarousel && (prevPostID % (config.actualColumnCount * config.blockRows) === (config.actualColumnCount * config.blockRows - 1));
                    if (!wasPrevLastItemInSlide && !(config.blockType === BLOCK_LIST && postID === 1)) {
                        blockBody += `</div>`;
                    }
                }
                blockBody += `<div class="${config.layout.gap}`;
                if (config.isCarousel) blockBody += ' snap-start shrink-0 min-w-full';
                if (isComplexLayout && config.blockType === BLOCK_LIST) blockBody += ' col flex-grow-1';
                if (config.blockType === BLOCK_LIST) blockBody += ' px-0';
                else if (config.blockType !== BLOCK_COVER) blockBody += ' px-2 px-sm-3 px-md-4 px-lg-5';
                blockBody += ` ${RESPONSIVE_GRID_CLASSES[currentColumnCount] || RESPONSIVE_GRID_CLASSES[6]}">`;
            }

            blockBody += postHTML;
            const isLastItemInSlide = config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) === (config.actualColumnCount * config.blockRows - 1));
            const isLastPostOverall = postID === (postsInFeed - 1);
            if (isLastPostOverall || isLastItemInSlide) {
                blockBody += `</div>`;
                if (config.blockType === BLOCK_LIST) blockBody += `</div>`;
            }
        }

        return { blockBody, carouselIndicators, showcaseHTML };
    }

    createBlockHeader(config) {
        return renderBlockHeader(config);
    }

    createBlockFooter(config, response) {
        return renderBlockFooter(config, response);
    }

    createCarouselControls(config) {
        return renderCarouselControls(config);
    }

    createCarouselWrapper(blockBody, carouselIndicators, config, response) {
        const controls = this.createCarouselControls(config);
        return renderCarousel(blockBody, carouselIndicators, config, response, controls);
    }

    bindEvents(rawElement, config) {
        this._bindShowcaseEvents(rawElement, config);
        this._bindPaginationEvents(rawElement, config);
        initCarousel(rawElement, config);
    }

    _bindShowcaseEvents(rawElement, config) {
        const featuredImageNode = rawElement.closest('.mBlock, .mBlockL')?.querySelector('.feature-image');
        const contentWrapper = rawElement.querySelector('.sFeature'); 
        if (!featuredImageNode || !contentWrapper) return;
        const figureNode = featuredImageNode.querySelector('figure');
        const iFrameNode = featuredImageNode.querySelector('.sIframe');
        const contentNode = featuredImageNode.querySelector('.sContent');

        const postElements = contentWrapper.querySelectorAll('.sPost');
        const postData = Array.from(postElements).map((el, index) => {
            el.setAttribute('data-index', index); 
            return {
                vidid: el.getAttribute('data-vidid'),
                title: el.getAttribute('data-title'),
                summary: el.getAttribute('data-summary'),
                link: el.getAttribute('data-link'),
                imgHigh: el.getAttribute('data-img-high') || el.querySelector('img')?.getAttribute('data-img-high') || ''
            };
        });

        if (figureNode) {
            figureNode.addEventListener('click', function () {
                const videoId = this.getAttribute('data-vidid');
                if (videoId && videoId !== "noVideo") {
                    if (iFrameNode) {
                        iFrameNode.innerHTML = getVideoIframe(videoId, config);
                        fadeIn(iFrameNode);
                        fadeOut(figureNode);
                        if (contentNode) fadeOut(contentNode);
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

        contentWrapper.addEventListener('click', function (event) {
            const clickedPost = event.target.closest('.sPost');
            if (!clickedPost) return; 
            const postIndex = clickedPost.getAttribute('data-index');
            if (postIndex === null || !postData[postIndex]) return;
            const data = postData[postIndex];

            if (data.vidid && data.vidid !== 'noVideo') {
                if (iFrameNode) {
                    iFrameNode.innerHTML = getVideoIframe(data.vidid, config);
                    fadeIn(iFrameNode);
                }
                if (figureNode) fadeOut(figureNode);
                if (contentNode) fadeOut(contentNode);
            } else {
                if (figureNode) {
                    let playIcon = figureNode.querySelector('svg');
                    if (playIcon) fadeOut(playIcon);
                    figureNode.setAttribute('data-vidid', 'noVideo');
                    figureNode.style.backgroundImage = `url(${data.imgHigh})`;
                    figureNode.style.backgroundSize = 'cover';
                    fadeIn(figureNode);
                    figureNode.title = data.title;
                }

                if (iFrameNode) {
                    fadeOut(iFrameNode);
                    iFrameNode.innerHTML = '';
                }

                if (contentNode) {
                    fadeIn(contentNode);
                    const h5 = contentNode.querySelector('h5');
                    if (h5) h5.textContent = data.title;
                    const summary = contentNode.querySelector('summary');
                    if (summary) summary.textContent = data.summary;
                }
            }

            const link = featuredImageNode.querySelector('a');
            if (link) { link.href = data.link; link.title = data.title; }
            const button = featuredImageNode.querySelector('button');
            if (button) button.title = data.title;
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
                fadeOut(rawElement.querySelector(`div#m${config.mBlockID}-st${currentStage}`));
                fadeOut(rawElement.querySelector(`div.mblox-footer.st${currentStage}`));
                fadeIn(rawElement.querySelector(`div#m${config.mBlockID}-st${prevStage}`));
                fadeIn(rawElement.querySelector(`div.mblox-footer.st${prevStage}`));
            });
        });

        nextButtons.forEach(nextButton => {
            if (nextButton.dataset.bound) return;
            nextButton.dataset.bound = "true";
            nextButton.addEventListener('click', () => {
                const currentStage = parseInt(rawElement.getAttribute("data-s"), 10);
                const nextStage = currentStage + 1;
                rawElement.setAttribute("data-s", nextStage);
                fadeOut(rawElement.querySelector(`div#m${config.mBlockID}-st${currentStage}`));
                const currentFooter = rawElement.querySelector(`div.mblox-footer.st${currentStage}`);
                const nextStageEl = rawElement.querySelector(`div#m${config.mBlockID}-st${nextStage}`);
                if (nextStageEl) {
                    if (currentFooter) fadeOut(currentFooter);
                    fadeIn(nextStageEl);
                    fadeIn(rawElement.querySelector(`div.mblox-footer.st${nextStage}`));
                } else {
                    if (currentFooter) fadeOut(currentFooter);
                    const customEvent = new CustomEvent('mblox:loadNextPage', { detail: { element: rawElement } });
                    rawElement.dispatchEvent(customEvent);
                }
            });
        });
    }
}
