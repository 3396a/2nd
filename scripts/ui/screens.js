export const screens = {
    title: selector('#title-screen'),
    store: selector('#store-screen'),
    settings: selector('#settings-screen'),
    game: selector('#game-screen'),
    active: selector('.active.screen'),

    /** @param {Element} screen */
    setActive(screen) {
        this.active.classList.remove('active');
        screen.classList.add('active');
        this.active = screen;
    },
};

/** @type {HTMLButtonElement[]} */
const buttons = selectorAll('button[data-target]');
for (const button of buttons) {
    const target = selector(unwrap(button.dataset.target));
    button.addEventListener('click', () => screens.setActive(target));
}
