export function loadOptimalImages(rawElement) {
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
                const img = new Image();
                img.onload = () => {
                    el.style.backgroundImage = `url("${finalUrl}")`;
                    if (isFixed) {
                        el.style.backgroundAttachment = 'fixed';
                        el.style.backgroundPosition = 'center center';
                        el.style.backgroundSize = 'cover';
                    }
                };
                img.onerror = () => {
                    import('../core/config.js').then(({ noImg }) => {
                        el.style.backgroundImage = `url("${noImg}")`;
                        el.setAttribute('data-img-high', noImg);
                    });
                };
                img.src = finalUrl;
            } else {
                el.onerror = () => {
                    import('../core/config.js').then(({ noImg }) => {
                        el.src = noImg;
                        el.setAttribute('data-img-high', noImg);
                        el.onerror = null;
                    });
                };
                el.src = finalUrl;
            }

            observer.unobserve(el);
        });
    }, { rootMargin: "0px 0px 200px 0px" });

    imagePlaceholders.forEach(el => {
        observer.observe(el);
    });
}
