export function fadeIn(el) {
    if (!el) return;
    el.style.opacity = 0;
    el.classList.remove('d-none', 'hidden');
    el.style.display = '';
    (function fade() {
        let val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

export function fadeOut(el) {
    if (!el) return;
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = 'none';
        } else {
            requestAnimationFrame(fade);
        }
    })();
}
