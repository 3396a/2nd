import { vec2 } from './lib/vec2.js';

/** Hard-coded config values */
export const cfg = {
    camera: {
        baseVisibleWidth: 50,
        maxFovScale: 2,
        xPos: 0.25,
    },

    pipe: {
        width: 4,
        minHeight: 5,
        maxHeight: 8,
        maxY: 10,

        initialCount: 2,
        addDelay: 2,

        outOfScreenCoef: 0.25,
    },

    player: {
        extents: vec2(0.6, 0.5),
        gravity: 70,
        jumpVel: 25,
        airResistanceCoef: 1.5,
        animSpeed: 12,
    },

    coin: {
        extents: vec2(1, 1),
        gravity: 140,
        jumpVel: 25,
        animSpeed: 12,

        addInterval: PI / 6,
        addChance: 0.2,
    },

    bullet: {
        extents: vec2(0.5625),
        speed: 20,
        gravity: 5,
    },

    particle: {
        gravity: 5,
        speed: 30,
        lifetime: 1,
    },

    background: {
        scale: 1.5,
        height: 0,
        centerY: 0.8,
        speed: 0.02,
    },

    cooldownBarSize: vec2(7, 0.8),

    scrollSpeed: 10,
};

/** @type {HTMLInputElement} */
const buyShotgun = selector('#buy-shotgun');
/** @type {HTMLElement} */
const ownsShotgun = selector('#owns-shotgun');
const pointsCounter = selector('#points-counter');
/** Mutable config values */
export const stats = {
    bullet: {
        delay: 0.5,
    },

    shotgun: {
        shots: 0,
        delay: 5,
        auto: false,
    },
    points: 0,

    load() {
        Object.assign(this, JSON.parse(localStorage.getItem('stats') ?? '{}'));
    },
    update() {
        localStorage.setItem('stats', JSON.stringify(this));
        pointsCounter.textContent = `${this.points}`;
        buyShotgun.disabled = this.points < 15;
        const owned = this.shotgun.shots === 0;
        buyShotgun.style.display = owned ? 'initial' : 'none';
        ownsShotgun.style.display = owned ? 'none' : 'initial';
    },
    // pbScore: {
    //     score: 0,
    //     time: 0,
    // },
    // pbTime: {
    //     score: 0,
    //     time: 0,
    // },
};
stats.load();
stats.update();

buyShotgun.addEventListener('click', () => {
    stats.shotgun.shots = Infinity;
    stats.points -= 15;
    stats.update();
});

// Managing user settings

/** @type {HTMLInputElement} */
const volumeInput = selector('#volume-input');
const volumeDisplay = selector('#volume-display');
const spacePauseDisplay = selector('#space-pause-display');

/** User settings */
export const settings = {
    volume: 1,
    spaceToPause: true,

    load() {
        Object.assign(this, JSON.parse(localStorage.getItem('settings') ?? '{}'));
    },

    update() {
        localStorage.setItem('settings', JSON.stringify(this));
        volumeDisplay.textContent = `${round(100 * this.volume)}`;
        volumeInput.value = volumeDisplay.textContent;
        spacePauseDisplay.textContent = this.spaceToPause ? 'yes' : 'no';
    },
};
settings.load();
settings.update();

volumeInput.addEventListener('input', () => {
    volumeDisplay.textContent = volumeInput.value;
});
volumeInput.addEventListener('change', () => {
    settings.volume = parseInt(volumeInput.value) / 100;
    settings.update();
    audio.play(audio.click);
});

const spacePauseButton = selector('#space-pause');
spacePauseButton.addEventListener('click', () => {
    settings.spaceToPause = !settings.spaceToPause;
    settings.update();
});
