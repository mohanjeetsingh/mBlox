export function fadeIn(el, duration = 160) {
    if (!el) return;
    
    // Ensure element is visible before animating
    el.classList.remove('d-none', 'hidden');
    el.style.display = '';
    
    // Web Animations API
    const animation = el.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: duration,
        easing: 'ease-out',
        fill: 'forwards' // Keeps the end state until the onfinish handler sets the final style
    });

    animation.onfinish = () => {
        el.style.opacity = '1';
    };
}

export function fadeOut(el, duration = 160) {
    if (!el) return;
    
    const animation = el.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: duration,
        easing: 'ease-in',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        el.style.opacity = '0';
        el.style.display = 'none';
    };
}
