/*!
 * mBlocks for Blogger
 * CIA.RealHappinessCenter.com
 * @version 1.0.0
 * Copyright (c) 2022-2024, Mohanjeet Singh
 * Released under the MIT license
 */

let isFirstScriptLoad = !0;

/**
 * Loads the main mBloxScript.js file if it's the first call, then initializes the blocks.
 * Subsequent calls directly initialize blocks without reloading the script.
 * @param {string|HTMLElement} blockItem The selector or element to pass to mBlocks.
 * @param {boolean} isFirstLoad A flag indicating if this is the first time scripts are being loaded.
 */
function loadScripts(blockItem, isFirstLoad) {
    if (isFirstLoad) {
        window.mBloxCssSrc = 'mBlox.css';
        const scriptElement = document.createElement('script');
        scriptElement.src = 'mBloxScript.js';
        document.head.append(scriptElement);

        scriptElement.onload = () => { mBlocks(blockItem); isFirstLoad = !1; }
    } else { console.log(isFirstLoad, blockItem); mBlocks(blockItem); }
}

//Intersection Observer for Lazy Loading
window.addEventListener("load", (event) => {
    document.getElementsByClassName("mBlock").length && (loadScripts('.mBlock', isFirstScriptLoad));

    const options = { rootMargin: '500px', threshold: 0.0 },
        lazyLoadTargets = document.getElementsByClassName("mBlockL");
    let observer = new IntersectionObserver(intersectionCallback, options);
    Array.prototype.forEach.call(lazyLoadTargets, function (observedElement) { observer.observe(observedElement) });
}, false);

/**
 * Callback function for the IntersectionObserver.
 * @param {IntersectionObserverEntry[]} entries An array of entries, each representing a target element.
 * @param {IntersectionObserver} observer The observer instance.
 */
const intersectionCallback = (entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            (entry.target).classList.contains("mBlockL") && (loadScripts(entry.target, isFirstScriptLoad));
            observer.unobserve(entry.target);
        }
    });
};