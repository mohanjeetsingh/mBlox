/*!
 * mBlocks for Blogger
 * CIA.RealHappinessCenter.com
 * @version 1.0.0
 * Copyright (c) 2022-2024, Mohanjeet Singh
 * Released under the MIT license
 */

let isFirstScriptLoad = !0;

function loadScripts(m, s) {
    if (s) {
        const e = document.createElement('script');
        e.src = 'mBloxScript.js';
        document.head.append(e);

        e.onload = () => { mBlocks(m); s = !1; }
    } else { console.log(s,m); mBlocks(m); }
}

//Intersection Observer for Lazy Loading
window.addEventListener("load", (event) => {
    document.getElementsByClassName("mBlock").length && (loadScripts('.mBlock',isFirstScriptLoad));

    const options = { rootMargin: '500px', threshold: 0.0 },
        T = document.getElementsByClassName("mBlockL");
    let observer = new IntersectionObserver(cFn, options);
    Array.prototype.forEach.call(T, function (m) { observer.observe(m) });
}, false);

const cFn = (entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            (entry.target).classList.contains("mBlockL") && (loadScripts(entry.target,isFirstScriptLoad));
            observer.unobserve(entry.target);
        }
    });
};