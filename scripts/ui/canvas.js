import { vec2 } from '../lib/vec2.js';

export class Canvas {
    /** @param {string} s Canvas element selector */
    constructor(s) {
        /** @type {HTMLCanvasElement} */
        this.elem = selector(s);
        this.ctx = unwrap(this.elem.getContext('2d'));
        this.size = vec2();

        const resize = () => this.resize(window.innerWidth, window.innerHeight);
        resize();
        window.addEventListener('resize', resize);
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    resize(width, height) {
        this.elem.width = width * window.devicePixelRatio;
        this.elem.height = height * window.devicePixelRatio;
        this.size.Set(this.elem.width, this.elem.height);
        this.ctx.imageSmoothingEnabled = false;
    }

    /** Clear the canvas and reset transforms */
    clear() {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);
    }
}

export const canvas = new Canvas('canvas');
