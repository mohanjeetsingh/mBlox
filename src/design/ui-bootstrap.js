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

const RESPONSIVE_GRID_CLASSES = {
    1: 'row-cols-1',
    2: 'row-cols-1 row-cols-sm-1 row-cols-md-2',
    3: 'row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3',
    4: 'row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4',
    5: 'row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-5',
    6: 'row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-lg-5 row-cols-xl-6'
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

export class BootstrapRenderer {
    
    async buildBlockBody(response, config) {
        let blockBody = '';
        let showcaseHTML = '';
        let carouselIndicators = null;
        const postsInFeed = response.posts.length;
        const isComplexLayout = (config.blockType === BLOCK_LIST || config.blockType === BLOCK_SHOWCASE);

        if (config.isCarousel) {
            carouselIndicators = document.createElement("div");
            carouselIndicators.classList.add('carousel-indicators');
            if (config.blockType !== BLOCK_COVER) carouselIndicators.classList.add('position-relative', 'm-0');
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
                        const activeClass = (i === 0) ? ' active' : '';
                        blockBody += `<div class="carousel-item${activeClass}">`;
                        blockBody += `<div class="row g-${config.gutterSize} mx-0 px-2 px-sm-3 px-md-4 px-lg-5 ${RESPONSIVE_GRID_CLASSES[config.columnCount] || ''}">`;

                        if (carouselIndicators) {
                            const indicatorActiveClass = (currentSlide === 0) ? ' active' : '';
                            const ariaCurrent = (currentSlide === 0) ? ' aria-current="true"' : '';
                            carouselIndicators.insertAdjacentHTML('beforeend', `<button type="button" data-bs-target="#carousel-${config.mBlockID}-st${config.stageID}" data-bs-slide-to="${currentSlide}" class="bg-${config.inverseTheme}${indicatorActiveClass}" ${ariaCurrent} aria-label="Slide ${currentSlide + 1}"></button>`);
                            currentSlide++;
                        }
                    }
                    blockBody += renderers[BLOCK_SHOWCASE].renderThumbnail(response.posts[i], config);
                }
                blockBody += `</div></div>`; 
            } else {
                blockBody += `<div class="row g-${config.gutterSize} mx-0 ${RESPONSIVE_GRID_CLASSES[config.columnCount] || ''}">`;
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

            let carouselIndicator = '';
            if (config.isCarousel && (postID % (config.actualColumnCount * config.blockRows) == 0)) {
                const slideIndex = postID / (config.actualColumnCount * config.blockRows);
                const activeClass = postID === 0 ? ' active' : '';
                const ariaCurrent = postID === 0 ? 'aria-current="true"' : '';
                 carouselIndicator = `<button type="button" data-bs-target="#carousel-${config.mBlockID}-st${config.stageID}" data-bs-slide-to="${slideIndex}" class="bg-${config.inverseTheme}${activeClass}" ${ariaCurrent} aria-label="Slide ${slideIndex + 1}"></button>`;
            }

            if (carouselIndicator && config.isCarousel) {
                carouselIndicators.insertAdjacentHTML('beforeend', carouselIndicator);
            }

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
                blockBody += `<div class="row g-${config.gutterSize} mx-0`;
                if (config.isCarousel) blockBody += ' carousel-item' + (postID === 0 ? ' active' : '');
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
                        const src = `https://www.youtube-nocookie.com/embed/${videoId}`;
                        iFrameNode.innerHTML = `<iframe src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;" width="100%" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="" style="${config.articleHeight}"></iframe>`;
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

        contentWrapper.addEventListener('click', function (event) {
            const clickedPost = event.target.closest('.sPost');
            if (!clickedPost) return; 
            const postIndex = clickedPost.getAttribute('data-index');
            if (postIndex === null || !postData[postIndex]) return;
            const data = postData[postIndex];

            if (figureNode) {
                let playIcon = figureNode.querySelector('svg');
                if (data.vidid && data.vidid !== 'noVideo') {
                    if (!playIcon) {
                        figureNode.insertAdjacentHTML('beforeend', `<svg class="position-absolute top-50 start-50 translate-middle" xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="#f00" class="bi bi-youtube" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/></svg>`);
                    } else if (playIcon.style.display === 'none') fadeIn(playIcon);
                    figureNode.title = "Click here to load the video!";
                } else if (playIcon) {
                    fadeOut(playIcon);
                    figureNode.title = data.title;
                }
                figureNode.setAttribute('data-vidid', data.vidid || 'noVideo');
                figureNode.style.backgroundImage = `url(${data.imgHigh})`;
                figureNode.style.backgroundSize = 'cover';
            }

            fadeOut(iFrameNode);
            fadeIn(figureNode);
            if (contentNode) {
                fadeIn(contentNode);
                const h5 = contentNode.querySelector('h5');
                if (h5) h5.textContent = data.title;
                const summary = contentNode.querySelector('summary');
                if (summary) summary.textContent = data.summary;
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
