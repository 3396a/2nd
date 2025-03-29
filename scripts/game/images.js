/** @param {string} filename */
function load(filename) {
    const img = new Image();
    img.src = `assets/images/${filename}.png`;
    img.style.imageRendering = 'pixelated';
    return img;
}

export const images = {
    background: load('background'),
    bullet: load('bullet'),
    cartridge: load('cartridge'),
    player: load('player'),
    coin: load('coin'),
    pipes: load('pipes'),
};
