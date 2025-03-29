import { cfg } from '../config.js';
import { vec2, Vec2 } from '../lib/vec2.js';
import { Canvas } from '../ui/canvas.js';

export class Camera {
    constructor() {
        this.fov = 1.0;
        this.size = vec2();
    }

    /** @param {Canvas} canvas */
    update(canvas) {
        canvas.ctx.resetTransform();

        this.size.x = this.fov * cfg.camera.baseVisibleWidth;
        this.size.y = this.size.x * (canvas.size.y / canvas.size.x);
        const scale = canvas.size.x / this.size.x;
        canvas.ctx.scale(scale, scale);

        const dx = cfg.camera.xPos * this.size.x;
        const dy = canvas.size.y / scale / 2;
        canvas.ctx.translate(dx, dy);
    }

    /**
     * @param {Canvas} canvas
     * @param {Vec2} pos
     */
    transformPoint(canvas, pos) {
        pos.Mul(window.devicePixelRatio);
        pos.Div(canvas.size.x / this.size.x);
        pos.AddScaled(this.size, -0.5);
        pos.x += cfg.camera.xPos * this.size.x;
    }
}
