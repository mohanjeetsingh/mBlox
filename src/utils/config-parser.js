import {
    BLOCK_COVER, BLOCK_SHOWCASE, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY,
    BLOCK_PANCAKE, BLOCK_STACK, BLOCK_QUOTE, BLOCK_COMMENT,
    DEFAULT_COLUMN_COUNTS, M3E_PALETTES, LAYOUT_CLASSES, ASPECT_RATIO_CLASSES,
    RESPONSIVE_COLUMN_MAP, getBreakpointIndex
} from '../core/config.js';

export function calculateLayout(config, postsInFeed) {
    let newConfig = { ...config };
    if (newConfig.postsPerBlock <= 1 || newConfig.blockType === BLOCK_LIST) newConfig.isCarousel = false;
    if (newConfig.isCarousel) {
        const baseCols = Math.max(1, Math.min(6, newConfig.columnCount)); // Clamp between 1 and 6
        const breakpointIndex = getBreakpointIndex(window.innerWidth);
        const columnMap = RESPONSIVE_COLUMN_MAP[baseCols] || RESPONSIVE_COLUMN_MAP[6];
        newConfig.actualColumnCount = columnMap[breakpointIndex];

        if (newConfig.blockRows > Math.ceil(postsInFeed / newConfig.actualColumnCount)) {
            newConfig.blockRows = Math.ceil(postsInFeed / newConfig.actualColumnCount);
        }
        if (postsInFeed <= (newConfig.actualColumnCount * newConfig.blockRows)) {
            newConfig.isCarousel = false;
            newConfig.containsNavigation = true;
        }
    }
    return newConfig;
}

export function applyDefaultConfig(config) {
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
    if (!config.ctaAlign) {
        config.ctaAlign = config.blockType === BLOCK_COVER ? "center" : "right";
    }
    if (!config.textHAlign) {
        config.textHAlign = config.blockType === BLOCK_COVER ? "center" : "left";
    }
    if (config.columnCount === null || typeof config.columnCount === 'undefined') {
        config.columnCount = DEFAULT_COLUMN_COUNTS[config.blockType] || 3;
    } else {
        config.columnCount = parseInt(config.columnCount, 10);
    }
    return config;
}

export function parseBlockConfig(rawElement) {
    let jsonConfig = {};
    const scriptTag = rawElement.querySelector('script[type="application/json"]');
    if (scriptTag) {
        try {
            let textContent = scriptTag.textContent || "";
            // Remove CDATA tags often automatically injected by CMS platforms like Blogger
            textContent = textContent.replace(/(?:\/\/\s*)?<!\[CDATA\[/g, '')
                                     .replace(/(?:\/\/\s*)?\]\]>/g, '')
                                     .trim();
            jsonConfig = JSON.parse(textContent);
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

    const labelName = getVal("label", "label", "Label Name missing"),
        contentType = String(getVal("contentType", "contentType", "recent")).toLowerCase();

    let siteURL = getVal("feed", "feed", "/");
    if (!siteURL || siteURL === "/") {
        siteURL = window.location.origin + "/";
    } else {
        if (!/^https?:\/\//i.test(siteURL)) {
            if (siteURL.startsWith('/')) {
                siteURL = window.location.origin + siteURL;
            } else {
                siteURL = "https://" + siteURL;
            }
        }
        // Ensure trailing slash if it's likely a base URL and not a specific file or query
        if (!siteURL.endsWith('/') && !siteURL.match(/\.(xml|rss|json)$/i) && !siteURL.includes('?')) {
            siteURL += '/';
        }
    }

    const mBloxTitle = getVal("title", "title", ""),
        mBloxDescription = getVal("description", "description", ""),
        rawType = getVal("type", "type", "v-ih"),
        mBloxType = String(rawType).toLowerCase(),
        bloxType = mBloxType.substring(0, 1),
        componentList = mBloxType.substring(1),
        rawComponentList = String(rawType).substring(1),
        rawTheme = String(getVal("theme", "theme", "auto")).toLowerCase(),

        showHeader = componentList.includes("h"),
        showImage = componentList.includes("i"),
        showSnippet = componentList.includes("s"),
        showAuthor = componentList.includes("a"),
        showDate = componentList.includes("d"),
        showOverlay = componentList.includes("o"),
        showLabels = componentList.includes("l");

    const dateStyle = rawComponentList.includes("D") ? 'long' : 'short';

    const stageID = getIntVal("s", "s", 1);
    const firstInstance = !rawElement.hasAttribute("data-s") && jsonConfig.s === undefined;
    const postsPerBlock = getIntVal("posts", "posts", 3);

    const validThemes = ['light', 'dark', 'auto'];
    const mBloxTheme = validThemes.includes(rawTheme) ? rawTheme : 'auto';

    const colorPalette = String(getVal("palette", "palette", "surface")).toLowerCase();
    
    let finalPaletteName = colorPalette;
    if (!M3E_PALETTES[finalPaletteName]) {
        finalPaletteName = 'surface';
    }
    const palette = M3E_PALETTES[finalPaletteName];
    let textVerticalAlign = String(getVal("textVAlign", "textVAlign", "")).toLowerCase();

    const imageBlur = String(getVal("iBlur", "iBlur", "")).toLowerCase();
    const imageFixed = String(getVal("iFix", "iFix", "")).toLowerCase();
    const widget = rawElement.closest(".widget");
    const mBlockID = widget ? widget.getAttribute("ID") : (mBloxTitle + mBloxType + labelName);
    const sanitizedMBlockID = mBlockID.replace(/[\s#.&?,[\]]/g, '-');

    const dateOptions = dateStyle === 'long' 
        ? { year: 'numeric', month: 'short', day: 'numeric' } 
        : { month: 'short', day: 'numeric' };
    const dateFormatter = showDate ? new Intl.DateTimeFormat('en-US', dateOptions) : null;

    const columnCountVal = getVal("cols", "cols", null);
    const blockRowsVal = getVal("rows", "rows", "1");
    
    const overlayItemsRaw = String(getVal("overlay-items", "overlayItems", "vcasb")).toLowerCase();
    const overlayItems = overlayItemsRaw.split('');

    let config = {
        labelName: labelName, contentType, siteURL, mBlockTitle: mBloxTitle, mBlockDescription: mBloxDescription, blockType: bloxType,
        showHeader, showImage, showSnippet, showAuthor, showDate, showOverlay, showLabels,
        columnCount: columnCountVal !== null ? parseInt(columnCountVal, 10) : null,
        blockRows: parseInt(blockRowsVal, 10),
        isCarousel: getBoolVal("isCarousel", "isCarousel", false),
        sectionHeight: getVal("iHeight", "iHeight", null),
        articleHeight: '',
        blurImage: imageBlur === "true" || jsonConfig.iBlur === true ? true : (imageBlur === "false" || jsonConfig.iBlur === false ? false : null),
        palette,
        spaceSize: getVal("space", "space", ((bloxType == "v") ? 0 : 3)),
        textVerticalAlign: textVerticalAlign,
        cornerStyle: (String(getVal("corner", "corner", "")).toLowerCase() == "sharp") ? " rounded-none" : " rounded-3xl",
        aspectRatio: ` ${ASPECT_RATIO_CLASSES[String(getVal("ar", "ar", "1/1")).replace('x', '/').toLowerCase()] || 'aspect-square'}`,
        isImageFixed: imageFixed === "true" || jsonConfig.iFix === true ? true : (imageFixed === "false" || jsonConfig.iFix === false ? false : null),
        hasRoundedBorder: getBoolVal("iBorder", "iBorder", false),
        snippetSize: getIntVal("snippetSize", "snippetSize", 150),
        callToAction: getVal("CTAText", "CTAText", ""),
        ctaAlign: getVal("ctaAlign", "ctaAlign", ""),
        textHAlign: getVal("textHAlign", "textHAlign", ""),
        moreText: getVal("moreText", "moreText", ""),
        stageID, firstInstance, postsPerBlock, mBlockID: sanitizedMBlockID, dateFormatter, dateStyle,
        paletteName: colorPalette, mBloxTheme,
        interactionClasses: colorPalette === 'colorful'
            ? `transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${bloxType === 'p' || bloxType === 'q' ? '' : 'hover:bg-tertiary hover:text-on-tertiary '}hover:scale-[1.02] hover:opacity-100 overflow-hidden no-underline font-bold`
            : `transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:scale-[1.02] ${bloxType === 'p' || bloxType === 'q' ? '' : 'hover:bg-surface-variant '}overflow-hidden no-underline font-bold`,
        containsNavigation: false, actualColumnCount: 0,
        overlayItems,
    };
    config.layout = LAYOUT_CLASSES[config.spaceSize * 2] || LAYOUT_CLASSES[6];
    return applyDefaultConfig(config);
}
