/**
 * mBlox Core Engine
 */

import { fetchJSONP, mapWordPressResponseToStandardFormat, mapRssResponseToStandardFormat, mapBloggerResponseToStandardFormat } from './data-fetcher.js';

const BLOCK_COVER = 'v', BLOCK_SHOWCASE = 's', BLOCK_LIST = 'l', BLOCK_CARD = 'c', BLOCK_GALLERY = 'g', BLOCK_PANCAKE = 'p', BLOCK_STACK = 't', BLOCK_QUOTE = 'q', BLOCK_COMMENT = 'm';
const CACHE_DURATION_MS = 15 * 60 * 1000;
const feedCache = new Map();

const DEFAULT_COLUMN_COUNTS = {
    [BLOCK_COVER]: 1,
    [BLOCK_COMMENT]: 1,
    [BLOCK_STACK]: 1,
    [BLOCK_PANCAKE]: 3,
    [BLOCK_CARD]: 4,
    [BLOCK_QUOTE]: 4,
    [BLOCK_GALLERY]: 5,
    [BLOCK_LIST]: 2,
    [BLOCK_SHOWCASE]: 6
};

async function _fetchWithProxy(apiUrl) {
    const proxies = [
        { url: `https://api.codetabs.com/v1/proxy?quest=${apiUrl}`, type: 'raw' },
        { url: `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`, type: 'raw' },
        { url: `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`, type: 'json' }
    ];
    for (const proxy of proxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); 
            const response = await fetch(proxy.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
                let text;
                if (proxy.type === 'json') {
                    const data = await response.json();
                    text = data.contents;
                } else {
                    text = await response.text();
                }
                if (text && text.length > 0) {
                    // If it is a WordPress request, verify that the response is actually valid JSON
                    if (apiUrl.includes('/wp-json')) {
                        const trimmed = text.trim();
                        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                            console.warn(`mBlox: Proxy ${proxy.url} returned non-JSON HTML for WordPress: ${trimmed.substring(0, 100)}`);
                            continue;
                        }
                    }
                    return { text, response };
                }
            }
        } catch (e) {
            console.warn(`mBlox: Proxy attempt failed for ${apiUrl}: ${e.message}`);
        }
    }
    throw new Error(`All CORS proxies failed for ${apiUrl}`);
}

class WordPressProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() {
        let baseUrl = this.config.siteURL;
        baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        if (!baseUrl.endsWith('/posts/')) baseUrl += 'wp/v2/posts/';
        let apiUrl = `${baseUrl}?_embed&per_page=${this.config.postsPerBlock}&page=${this.config.stageID}`;
        if (this.config.contentType === 'label' && !isNaN(parseInt(this.config.dataLabel, 10))) apiUrl += `&categories=${this.config.dataLabel}`;
        return apiUrl;
    }
    async fetch() {
        const apiUrl = this._buildFeedUrl();
        const cached = feedCache.get(apiUrl);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const { text: responseText, response } = await _fetchWithProxy(apiUrl);
        try {
            const rawData = JSON.parse(responseText);
            const formattedData = mapWordPressResponseToStandardFormat(rawData, response.headers);
            feedCache.set(apiUrl, { data: formattedData, timestamp: Date.now() });
            return formattedData;
        } catch (e) {
            console.error("mBlox: Failed to parse WordPress JSON.", e);
            throw new Error("Invalid JSON response from WordPress feed.");
        }
    }
}

class RssProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() { return this.config.siteURL; }
    async fetch() {
        const apiUrl = this._buildFeedUrl();
        const cached = feedCache.get(apiUrl);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const { text: xmlString } = await _fetchWithProxy(apiUrl);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length) throw new Error("Failed to parse RSS feed.");
        const formattedData = mapRssResponseToStandardFormat(xmlDoc);
        feedCache.set(apiUrl, { data: formattedData, timestamp: Date.now() });
        return formattedData;
    }
}

class BloggerProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() {
        let feedURL = this.config.siteURL + "feeds/";
        switch (this.config.contentType) {
            case "recent": feedURL += "posts" + (this.config.showImage ? "/default" : "/summary"); break;
            case "comments": feedURL += "comments" + (this.config.showImage ? "/default" : "/summary"); break;
            default: feedURL += "posts" + (this.config.showImage ? "/default" : "/summary") + "/-/" + this.config.dataLabel;
        }
        feedURL += `?alt=json-in-script&start-index=${(this.config.stageID - 1) * this.config.postsPerBlock + 1}&max-results=${this.config.postsPerBlock}`;
        return feedURL;
    }
    async fetch() {
        const url = this._buildFeedUrl();
        const cached = feedCache.get(url);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const rawData = await fetchJSONP(url);
        const formattedData = mapBloggerResponseToStandardFormat(rawData);
        feedCache.set(url, { data: formattedData, timestamp: Date.now() });
        return formattedData;
    }
}

function _getProvider(config) {
    const url = config.siteURL.toLowerCase();
    if (url.includes('/wp-json')) return new WordPressProvider(config);
    if (url.endsWith('.xml') || url.includes('/feed')) return new RssProvider(config);
    return new BloggerProvider(config);
}

const BREAKPOINTS = { sm: 576, md: 768, lg: 992, xl: 1200 };
function _getBreakpointIndex(width) {
    if (width < BREAKPOINTS.sm) return 0;
    if (width < BREAKPOINTS.md) return 1;
    if (width < BREAKPOINTS.lg) return 2;
    if (width < BREAKPOINTS.xl) return 3;
    return 4;
}

const RESPONSIVE_COLUMN_MAP = {
    1: [1, 1, 1, 1, 1], 2: [1, 1, 2, 2, 2], 3: [1, 1, 2, 3, 3], 4: [1, 2, 3, 4, 4], 5: [2, 3, 4, 4, 5], 6: [3, 4, 4, 5, 6]
};

function _calculateLayout(config, postsInFeed) {
    let newConfig = { ...config };
    if (newConfig.postsPerBlock <= 1 || newConfig.blockType === BLOCK_LIST) newConfig.isCarousel = false;
    if (newConfig.isCarousel) {
        const baseCols = Math.max(1, Math.min(6, newConfig.columnCount));
        const breakpointIndex = _getBreakpointIndex(window.innerWidth);
        const columnMap = RESPONSIVE_COLUMN_MAP[baseCols] || RESPONSIVE_COLUMN_MAP[6];
        newConfig.actualColumnCount = columnMap[breakpointIndex];
        if (newConfig.blockRows > Math.ceil(postsInFeed / newConfig.columnCount)) newConfig.blockRows = Math.ceil(postsInFeed / newConfig.columnCount);
        if (postsInFeed <= (newConfig.actualColumnCount * newConfig.blockRows)) {
            newConfig.isCarousel = false;
            newConfig.containsNavigation = true;
        }
    }
    return newConfig;
}

function _applyDefaultConfig(config) {
    if (!config.sectionHeight) {
        if (config.blockType === BLOCK_COVER) config.sectionHeight = "100vh";
        else if (config.blockType === BLOCK_SHOWCASE) config.sectionHeight = "70vh";
        else config.sectionHeight = "m";
    }
    config.articleHeight = config.sectionHeight === 'm' ? '' : `height:${config.sectionHeight}!important;`;
    if (config.isImageFixed === null) config.isImageFixed = (config.blockType === BLOCK_SHOWCASE || config.blockType === BLOCK_COVER);
    if (config.blurImage === null) {
        const excludedBlurTypes = [BLOCK_SHOWCASE, BLOCK_LIST, BLOCK_STACK, BLOCK_PANCAKE, BLOCK_QUOTE];
        config.blurImage = config.showHeader && !excludedBlurTypes.includes(config.blockType);
    }
    if (!config.textVerticalAlign) {
        if (config.blockType === 'v') config.textVerticalAlign = "middle";
        else if (config.blockType === 'l') config.textVerticalAlign = "bottom";
        else config.textVerticalAlign = 'overlay';
    }
    if (config.columnCount === null || typeof config.columnCount === 'undefined') {
        config.columnCount = DEFAULT_COLUMN_COUNTS[config.blockType] || 3;
    } else {
        config.columnCount = parseInt(config.columnCount, 10);
    }
    return config;
}

function _parseBlockConfig(rawElement) {
    let jsonConfig = {};
    const scriptTag = rawElement.querySelector('script[type="application/json"]');
    if (scriptTag) {
        try {
            jsonConfig = JSON.parse(scriptTag.textContent);
        } catch (e) {
            console.error("mBlox: Failed to parse embedded JSON configuration.", e);
        }
    }

    const getVal = (attrName, jsonKey, defaultValue) => {
        if (jsonConfig[jsonKey] !== undefined) return jsonConfig[jsonKey];
        const attrVal = rawElement.getAttribute(`data-${attrName}`);
        return attrVal !== null ? attrVal : defaultValue;
    };

    const getBoolVal = (attrName, jsonKey, defaultValue) => {
        if (jsonConfig[jsonKey] !== undefined) return !!jsonConfig[jsonKey];
        const attrVal = rawElement.getAttribute(`data-${attrName}`);
        return attrVal !== null ? (attrVal.toLowerCase() === 'true') : defaultValue;
    };

    const getIntVal = (attrName, jsonKey, defaultValue) => {
        if (jsonConfig[jsonKey] !== undefined) return parseInt(jsonConfig[jsonKey], 10);
        const attrVal = rawElement.getAttribute(`data-${attrName}`);
        return attrVal !== null ? parseInt(attrVal, 10) : defaultValue;
    };

    const dataLabel = getVal("label", "label", "Label Name missing"),
        contentType = getVal("contentType", "contentType", "recent").toLowerCase(),
        siteURL = getVal("feed", "feed", "/"),
        dataTitle = getVal("title", "title", ""),
        dataDescription = getVal("description", "description", ""),
        dataType = getVal("type", "type", "v-ih").toLowerCase(),
        blockType = dataType.substring(0, 1),
        componentList = dataType.substring(1),
        dataTheme = getVal("theme", "theme", "light").toLowerCase(),
        showHeader = componentList.includes("h"),
        showImage = componentList.includes("i"),
        showSnippet = componentList.includes("s"),
        showAuthor = componentList.includes("a"),
        showDate = componentList.includes("d");

    const stageID = getIntVal("s", "s", 1);
    const firstInstance = !rawElement.hasAttribute("data-s") && jsonConfig.s === undefined;
    const postsPerBlock = getIntVal("posts", "posts", 3);

    const inverseTheme = (dataTheme == "light" ? "primary" : "light");
    let textVerticalAlign = getVal("textVAlign", "textVAlign", "").toLowerCase();

    const dataBlur = getVal("iBlur", "iBlur", "").toLowerCase();
    const dataIFix = getVal("iFix", "iFix", "").toLowerCase();
    const widget = rawElement.closest(".widget");
    const mBlockID = widget ? widget.getAttribute("ID") : (dataTitle + dataType + dataLabel);
    const sanitizedMBlockID = mBlockID.replace(/[\s#.&?,[\]]/g, '-');

    const dateFormatter = showDate ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

    const columnCountVal = getVal("cols", "cols", null);
    const blockRowsVal = getVal("rows", "rows", "1");

    let config = {
        dataLabel, contentType, siteURL, dataTitle, dataDescription, blockType, dataTheme,
        showHeader, showImage, showSnippet, showAuthor, showDate,
        columnCount: columnCountVal !== null ? parseInt(columnCountVal, 10) : null,
        blockRows: parseInt(blockRowsVal, 10),
        isCarousel: getBoolVal("isCarousel", "isCarousel", false),
        sectionHeight: getVal("iHeight", "iHeight", null),
        articleHeight: '',
        blurImage: dataBlur === "true" || jsonConfig.iBlur === true ? true : (dataBlur === "false" || jsonConfig.iBlur === false ? false : null),
        inverseTheme,
        textVerticalAlign: textVerticalAlign,
        cornerStyle: (getVal("corner", "corner", "").toLowerCase() == "sharp") ? " rounded-0" : " rounded",
        aspectRatio: ` ratio ratio-${getVal("ar", "ar", "1x1").toLowerCase()}`,
        gutterSize: getVal("gutter", "gutter", ((blockType == "v") ? 0 : 3)),
        isImageFixed: dataIFix === "true" || jsonConfig.iFix === true ? true : (dataIFix === "false" || jsonConfig.iFix === false ? false : null),
        lowContrast: getBoolVal("lowContrast", "lowContrast", false),
        hasRoundedBorder: getBoolVal("iBorder", "iBorder", false),
        snippetSize: getIntVal("snippetSize", "snippetSize", 150),
        callToAction: getVal("CTAText", "CTAText", ""),
        moreText: getVal("moreText", "moreText", ""),
        stageID, firstInstance, postsPerBlock, mBlockID: sanitizedMBlockID, dateFormatter,
        containsNavigation: false, actualColumnCount: 0,
    };
    return _applyDefaultConfig(config);
}

// Global renderer instance
let rendererInstance = null;

async function _getRenderer() {
    if (rendererInstance) return rendererInstance;
    const isM3E = (window.mBloxConfig && window.mBloxConfig.designSystem === 'm3e');
    if (isM3E) {
        const { M3ERenderer } = await import('../renderers/ui-m3e.js');
        rendererInstance = new M3ERenderer();
    } else {
        const { BootstrapRenderer } = await import('../renderers/ui-bootstrap.js');
        rendererInstance = new BootstrapRenderer();
    }
    return rendererInstance;
}

export async function mBlocks(blockItem) {
    const renderer = await _getRenderer();
    const elements = (typeof blockItem === 'string') ? document.querySelectorAll(blockItem) : [blockItem];

    for (const rawElement of elements) {
        let blockConfig = _parseBlockConfig(rawElement);

        // Listen for pagination events fired by the renderer
        if (!rawElement._mbloxPaginateListener) {
            rawElement.addEventListener('mblox:loadNextPage', (e) => {
                mBlocks(e.target);
            });
            rawElement._mbloxPaginateListener = true;
        }

        try {
            const provider = _getProvider(blockConfig);
            const response = await provider.fetch();
            blockConfig.isBloggerFeed = provider instanceof BloggerProvider;

            if (response.posts && response.posts.length > 0) {
                const postsInFeed = response.posts.length;
                if (blockConfig.contentType === "comments") blockConfig.moreText = "";

                if (blockConfig.firstInstance) {
                    rawElement.setAttribute("data-s", blockConfig.stageID);
                    rawElement.insertAdjacentHTML('beforeend', renderer.createBlockHeader(blockConfig));
                }

                blockConfig = _calculateLayout(blockConfig, postsInFeed);

                const { blockBody, carouselIndicators, showcaseHTML } = await renderer.buildBlockBody(response, blockConfig);

                const isCurrentStage = blockConfig.stageID === parseInt(rawElement.getAttribute("data-s") || "1", 10);
                const displayClass = isCurrentStage ? '' : ' d-none';
                
                let renderOutput = `<div class="st${blockConfig.stageID}${displayClass}" id="m${blockConfig.mBlockID}-st${blockConfig.stageID}">`;
                if (blockConfig.blockType === BLOCK_SHOWCASE && blockConfig.firstInstance) {
                    renderOutput += showcaseHTML;
                }
                
                renderOutput += renderer.createCarouselWrapper(blockBody, carouselIndicators, blockConfig, response);
                renderOutput += renderer.createBlockFooter(blockConfig, response);
                renderOutput += `</div>`;
                
                rawElement.insertAdjacentHTML('beforeend', renderOutput);
                renderer.bindEvents(rawElement, blockConfig);

                _loadOptimalImages(rawElement);
            }
        } catch (e) {
            console.error(e);
        }
    }
}

function _loadOptimalImages(rawElement) {
    const imagePlaceholders = Array.from(rawElement.querySelectorAll('.m-blox-image-to-load'));
    if (!imagePlaceholders.length) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const isBg = el.tagName === 'FIGURE';
            const isFixed = el.getAttribute('data-is-fixed') === 'true';
            const highResUrl = el.getAttribute('data-img-high');
            let finalUrl = highResUrl;

            const dpr = window.devicePixelRatio || 1;
            let requiredDimension;

            if (isFixed) {
                requiredDimension = Math.max(window.innerWidth, window.innerHeight) * dpr;
            } else {
                requiredDimension = el.getBoundingClientRect().width * dpr;
            }

            if (requiredDimension > 0 && highResUrl && highResUrl.includes('/s1600')) {
                const optimalSize = Math.min(1600, Math.max(100, Math.ceil(requiredDimension / 100) * 100));
                finalUrl = highResUrl.replace('/s1600', `/s${optimalSize}`);
            }

            if (isBg) {
                el.style.backgroundImage = `url(${finalUrl})`;
                if (isFixed) {
                    el.style.backgroundAttachment = 'fixed';
                    el.style.backgroundPosition = 'center center';
                    el.style.backgroundSize = 'cover';
                }
            } else {
                el.src = finalUrl;
            }

            observer.unobserve(el);
        });
    }, { rootMargin: "0px 0px 200px 0px" });

    imagePlaceholders.forEach(el => {
        observer.observe(el);
    });
}

