import './lib/globals.js';
import { screens } from './ui/screens.js';

import { Game, gameMenus } from './game.js';

/** @type {Game | null} */
let game = null;

window.addEventListener('keydown', e => game?.keydown(e));
window.addEventListener('keyup', e => game?.keyup(e));
window.addEventListener('mousemove', e => game?.mousemove(e));
window.addEventListener('mousedown', e => game?.mousedown(e));
window.addEventListener('mouseup', e => game?.mouseup(e));
window.addEventListener('blur', () => {
    if (game && game.isIngame()) {
        game.pause();
    }
});

selector('#newgame-button').addEventListener('click', () => {
    game = new Game();
    globalThis.game = game;
    game.startTick();
    screens.setActive(screens.game);
});

selector('#resume-button').addEventListener('click', () => {
    assert(game !== null);
    game.unpause();
});

selector('#end-game-button').addEventListener('click', () => {
    gameMenus.show(gameMenus.confirm);
});

selector('#confirm-menu .esc').addEventListener('click', () => {
    gameMenus.show(gameMenus.pause);
});

selector('#gameover-menu #restart').addEventListener('click', () => {
    game?.stopTick();
    game = null;
    gameMenus.hide(gameMenus.gameOver);
    game = new Game();
    globalThis.game = game;
    game.startTick();
});

selector('#gameover-menu .esc').addEventListener('click', () => {
    assert(!!game?.gameIsOver);
    game.stopTick();
    game = null;
    gameMenus.hide(gameMenus.gameOver);
});

selector('#confirm-end-game-button').addEventListener('click', () => {
    assert(game !== null);
    game.gameOver(true);
});

//

// Escape key manager

/** @type {HTMLButtonElement[]} */
const escapeButtons = selectorAll('.esc');
window.addEventListener('keydown', e => {
    if (e.repeat || e.code !== 'Escape') return;

    if (game && game.isIngame()) {
        game.pause();
        return;
    }

    for (const button of escapeButtons) {
        if (button.checkVisibility()) {
            button.click();
            return;
        }
    }
});
