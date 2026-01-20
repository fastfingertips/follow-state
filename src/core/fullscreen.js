/**
 * Flow State - Fullscreen Module
 */

export function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen?.();
    } else {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    }
}

export function isFullscreen() {
    return !!document.fullscreenElement;
}

export function initFullscreen(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.addEventListener('click', toggleFullscreen);
        
        document.addEventListener('fullscreenchange', () => {
            btn.classList.toggle('active', isFullscreen());
        });
    }
}
