/*!
 * mBlocks for Blogger - Initializer
 * CIA.RealHappinessCenter.com
 * @version 2.0.0
 */

let isFirstScriptLoad = true;

const noImgSVG='<svg viewBox="0 0 1461 822" xmlns="http://www.w3.org/2000/svg"> <rect width="1461" height="822" fill="#eee"/> <path d="m918 699c-43 31-135-99-189-99-53 0-146 130-189 99-43-31 53-159 36-210-16-51-169-98-152-149 16-51 168 1 211-30s41-191 94-191c53 0 51 160 94 191 43 31 194-20 211 31 16 51-136 98-153 149-16 51 79 179 36 210z" fill="#fff"/> <path d="m870 437c3 3 18 1 17 6 0 4-13 1-17 3-13 7-30 30-41 40-7 7-24 19-33 24-8 5-24 13-33 16-8 3-24 5-32 5-9 0-25-2-33-5-8-3-24-11-32-16-9-5-26-19-33-25-9-7-27-34-40-40-4-2-17 2-17-2 0-5 14-3 17-6 3-3 3-16 7-15 4 1 0 12 1 16 4 11 23 26 32 33 14 10 41 21 65 23 32 3 32 3 66 0 10-1 52-13 64-24 11-9 28-22 33-32 2-4-3-15 1-16 4-1 4 13 8 15z" fill="#eee"/> <ellipse cx="683" cy="359" rx="20" ry="25" fill="#eee"/> <ellipse cx="781" cy="359" rx="20" ry="25" fill="#eee"/></svg>';
window.noImg = "data:image/svg+xml," + encodeURIComponent(noImgSVG);

/**
 * Loads the core library and initializes blocks.
 * Uses window.mBloxConfig to determine the design system.
 */
function loadScripts(blockItem, isFirstLoad) {
    if (isFirstLoad) {
        const config = window.mBloxConfig || {};

        // 1. Inject CSS for M3E
        // To disable this and use your site's own CSS, you can safely delete this entire CSS injection block (Step 1).
        // Alternatively, set `window.mBloxConfig = { cssSrc: "" }` in your HTML or change the cssUrl variable below to an empty string ('') before loading this script .
        let cssUrl = 'https://cdn.jsdelivr.net/npm/mblox/dist/mBloxM3E.css';
        if (config.cssSrc !== undefined) {
            cssUrl = config.cssSrc;
        }
        
        if (cssUrl && !document.querySelector(`link[href*="${cssUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        // 2. Inject mBlox Unified Bundle (Engine + Blocks)
        let jsUrl = 'https://cdn.jsdelivr.net/npm/mblox/dist/mBloxM3E.js';
        if (config.jsSrc !== undefined) {
            jsUrl = config.jsSrc;
        }
        
        if (jsUrl) {
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
        } else if (window.mBlocks) {
            window.mBlocks(blockItem).then(() => { isFirstScriptLoad = false; });
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
    const rootMargin = config.lazyLoadRootMargin !== undefined ? config.lazyLoadRootMargin : '500px';

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