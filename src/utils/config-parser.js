import { 
    BLOCK_COVER, BLOCK_SHOWCASE, BLOCK_LIST, BLOCK_CARD, BLOCK_GALLERY, 
    BLOCK_PANCAKE, BLOCK_STACK, BLOCK_QUOTE, BLOCK_COMMENT,
    DEFAULT_COLUMN_COUNTS, M3E_THEMES, LAYOUT_CLASSES, ASPECT_RATIO_CLASSES
} from '../core/config.js';

export function calculateLayout(config, postsInFeed) {
    let newConfig = { ...config };
    if (newConfig.postsPerBlock <= 1 || newConfig.blockType === BLOCK_LIST) newConfig.isCarousel = false;
    if (newConfig.isCarousel) {
        if (newConfig.blockRows > Math.ceil(postsInFeed / newConfig.columnCount)) {
            newConfig.blockRows = Math.ceil(postsInFeed / newConfig.columnCount);
        }
        if (postsInFeed <= (newConfig.columnCount * newConfig.blockRows)) {
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
        rawTheme = getVal("theme", "theme", "light").toLowerCase(),
        showHeader = componentList.includes("h"),
        showImage = componentList.includes("i"),
        showSnippet = componentList.includes("s"),
        showAuthor = componentList.includes("a"),
        showDate = componentList.includes("d");

    const stageID = getIntVal("s", "s", 1);
    const firstInstance = !rawElement.hasAttribute("data-s") && jsonConfig.s === undefined;
    const postsPerBlock = getIntVal("posts", "posts", 3);

    // Map legacy themes to M3E semantic tokens
    const dataTheme = rawTheme === 'dark' ? 'surface-variant' : (rawTheme === 'light' ? 'surface' : rawTheme);
    const theme = M3E_THEMES[dataTheme] || M3E_THEMES['surface'];

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
        theme,
        gutterSize: getVal("gutter", "gutter", ((blockType == "v") ? 0 : 3)),
        textVerticalAlign: textVerticalAlign,
        cornerStyle: (getVal("corner", "corner", "").toLowerCase() == "sharp") ? " rounded-none" : " rounded-2xl",
        aspectRatio: ` ${ASPECT_RATIO_CLASSES[getVal("ar", "ar", "1/1").replace('x', '/').toLowerCase()] || 'aspect-square'}`,
        isImageFixed: dataIFix === "true" || jsonConfig.iFix === true ? true : (dataIFix === "false" || jsonConfig.iFix === false ? false : null),
        lowContrast: getBoolVal("lowContrast", "lowContrast", false),
        hasRoundedBorder: getBoolVal("iBorder", "iBorder", false),
        snippetSize: getIntVal("snippetSize", "snippetSize", 150),
        callToAction: getVal("CTAText", "CTAText", ""),
        moreText: getVal("moreText", "moreText", ""),
        stageID, firstInstance, postsPerBlock, mBlockID: sanitizedMBlockID, dateFormatter,
        containsNavigation: false, actualColumnCount: 0,
    };
    config.layout = LAYOUT_CLASSES[config.gutterSize * 2] || LAYOUT_CLASSES[6];
    return applyDefaultConfig(config);
}
