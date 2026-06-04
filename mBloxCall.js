/*!
 * mBlocks for Blogger - Initializer
 * CIA.RealHappinessCenter.com
 * @version 2.0.0
 */

let isFirstScriptLoad = true;

/**
 * Loads the core library and initializes blocks.
 * Uses window.mBloxConfig to determine the design system.
 */
function loadScripts(blockItem, isFirstLoad) {
    if (isFirstLoad) {
        const config = window.mBloxConfig || {};

        // 1. Inject CSS for M3E
        const cssUrl = config.cssSrc || '../dist/mBloxM3E.css';
        if (!document.querySelector(`link[href*="${cssUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        // 2. Inject mBlox Unified Bundle (Engine + Blocks)
        const jsUrl = config.jsSrc || '../dist/mBloxM3E.js';
        const existingScript = document.querySelector(`script[src*="${jsUrl}"]`);
        
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.type = 'module';
            script.addEventListener('load', () => {
                if (window.mBlocks) {
                    window.mBlocks(blockItem).then(() => { isFirstScriptLoad = false; });
                }
            });
            document.head.appendChild(script);
        } else if (window.mBlocks) {
            window.mBlocks(blockItem).then(() => { isFirstScriptLoad = false; });
        } else {
            // Script tag exists but hasn't finished loading. Queue the execution.
            existingScript.addEventListener('load', () => {
                if (window.mBlocks) {
                    window.mBlocks(blockItem).then(() => { isFirstScriptLoad = false; });
                }
            });
        }
    } else {
        if (window.mBlocks) {
            window.mBlocks(blockItem);
        }
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

window.loadScripts = loadScripts;