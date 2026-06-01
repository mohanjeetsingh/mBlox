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

        contentWrapper.addEventListener('click', function (event) {
            const clickedPost = event.target.closest('.sPost');
            if (!clickedPost) return; 

            const postIndex = clickedPost.getAttribute('data-index');
            if (postIndex === null || !postData[postIndex]) return;

            const data = postData[postIndex];

            // --- Update the main feature image ---
            if (figureNode) {
                let playIcon = figureNode.querySelector('svg');
                if (data.vidid && data.vidid !== 'noVideo') {
                    // Play video icon logic (adapted from legacy)
                    if (!playIcon) {
                        figureNode.insertAdjacentHTML('beforeend', `<svg class="position-absolute top-50 start-50 translate-middle z-10 drop-shadow-md" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>`);
                    } else if (playIcon.style.display === 'none') {
                        fadeIn(playIcon);
                    }
                    figureNode.title = "Click here to load the video!";
                } else if (playIcon) {
                    fadeOut(playIcon);
                    figureNode.title = data.title;
                }
                figureNode.setAttribute('data-vidid', data.vidid);
                figureNode.style.backgroundImage = `url(${data.imgHigh})`;
                figureNode.style.backgroundSize = 'cover';
            }

            // --- Reset any playing video and show the figure ---
            fadeOut(iFrameNode);
            if (iFrameNode) iFrameNode.innerHTML = ''; // Ensure iframe is cleared
            fadeIn(figureNode);

            // --- Update the content overlay ---
            if (contentNode) {
                fadeIn(contentNode);
                const h5 = contentNode.querySelector('h5');
                if (h5) h5.textContent = data.title;
                const summary = contentNode.querySelector('.list-none') || contentNode.querySelector('div.text-body-md');
                if (summary) summary.innerHTML = data.summary;
            }

            // --- Update the main link and button ---
            const link = featuredImageNode.querySelector('a');
            if (link) {
                link.style.display = ''; // Restore link visibility
                link.href = data.link;
                link.title = data.title;
            }
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
