import { settings } from '../config.js';

/**
 * @param {string} filename
 * @param {number} volume
 */
function load(filename, volume) {
    const audio = new Audio(`./assets/sounds/${filename}.mp3`);
    audio.volume = volume;
    return audio;
}

export const audio = {
    bulletHit: load('bullet_hit', 0.5),
    bullet: load('bullet', 1),
    click: load('click', 1),
    coin: load('coin', 1),
    deathFall: load('death_fall', 1),
    deny: load('deny', 1),
    quitFall: load('fall', 1),
    flap: load('flap', 0.3),
    hover: load('hover', 0.2),
    shotgun: load('shotgun', 0.6),
    shotgunReload: load('shotgun_reload', 0.6),

    /** @param {HTMLAudioElement} a */
    play(a) {
        const a0 = a.cloneNode();
        assert(a0 instanceof HTMLAudioElement);
        a0.volume = a.volume * settings.volume;
        a0.play();
    },
};
globalThis.audio = audio;

for (const button of selectorAll('button')) {
    button.addEventListener('mouseover', () => audio.play(audio.hover));
    button.addEventListener('focus', () => audio.play(audio.hover));
    button.addEventListener('click', () => audio.play(audio.click));
}

for (const input of selectorAll('input[type=range]')) {
    input.addEventListener('mouseover', () => audio.play(audio.hover));
    input.addEventListener('focus', () => audio.play(audio.hover));
}
