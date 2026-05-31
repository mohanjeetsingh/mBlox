/*!
 * mBlocks for Blogger - Modular Entry Point
 * CIA.RealHappinessCenter.com
 * @version 2.0.0
 */

import { mBlocks } from './src/core/engine.js';

let isFirstScriptLoad = true;

/**
 * Loads the core engine and initializes blocks.
 * Uses window.mBloxConfig to determine the design system.
 */
function loadScripts(blockItem, isFirstLoad) {
    if (isFirstLoad) {
        const config = window.mBloxConfig || { designSystem: 'bs' };
        const isM3E = config.designSystem === 'm3e';

        // 1. Inject CSS for the chosen design system
        const cssUrl = isM3E ? (config.cssSrc || '../dist/mBloxM3E.css') : (config.cssSrc || '../dist/mBloxBS.css');
        if (!document.querySelector(`link[href*="${cssUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        // 2. Inject Bootstrap JS if needed (M3E doesn't need Bootstrap JS)
        if (!isM3E && (!window.bootstrap || !window.bootstrap.Carousel)) {
            const bsJsUrl = config.bsJsSrc || '../dist/mBloxBS.js';
            const script = document.createElement('script');
            script.src = bsJsUrl;
            script.onload = () => {
                mBlocks(blockItem).then(() => { isFirstScriptLoad = false; });
            };
            document.head.appendChild(script);
        } else {
            mBlocks(blockItem).then(() => { isFirstScriptLoad = false; });
        }
    } else {
        mBlocks(blockItem);
    }
}

// Intersection Observer for Lazy Loading
window.addEventListener("load", (event) => {
    if (document.getElementsByClassName("mBlock").length) {
        loadScripts('.mBlock', isFirstScriptLoad);
    }

    const config = window.mBloxConfig || {};
    const threshold = config.lazyLoadThreshold !== undefined ? config.lazyLoadThreshold : 0.0;
    const rootMargin = config.lazyLoadRootMargin || '500px';

    const options = { rootMargin: rootMargin, threshold: threshold };
    const lazyLoadTargets = document.getElementsByClassName("mBlockL");
    
    let observer = new IntersectionObserver(intersectionCallback, options);
    Array.prototype.forEach.call(lazyLoadTargets, function (observedElement) { 
        observer.observe(observedElement);
    });
}, false);

const intersectionCallback = (entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if ((entry.target).classList.contains("mBlockL")) {
                loadScripts(entry.target, isFirstScriptLoad);
            }
            observer.unobserve(entry.target);
        }
    });
};

// Expose globally for manual calls
window.mBlocks = mBlocks;
window.loadScripts = loadScripts;