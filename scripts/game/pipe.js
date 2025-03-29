import { cfg } from '../config.js';
import { AABB } from '../lib/aabb.js';
import { Vec2 } from '../lib/vec2.js';
import { Camera } from './camera.js';
import { images } from './images.js';

export class Pipe {
    /**
     * @param {Vec2} pos
     * @param {number} height
     */
    constructor(pos, height) {
        this.pos = pos;
        this.height = height;
    }

    /** @param {number} dt */
    update(dt) {
        this.pos.x -= dt * cfg.scrollSpeed;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        const maxY = camera.size.y / 2;
        const dx = cfg.pipe.width / 2;
        const dy = this.height / 2;
        const { x, y } = this.pos;
        const ey = (20 / 32) * dy;

        // vertical segments
        ctx.drawImage(images.pipes, 0, 35, 32, 10, x - dx, -camera.size.y / 2, dx * 2, camera.size.y / 2 + y - this.height / 2 - ey / 2);
        ctx.drawImage(images.pipes, 0, 35, 32, 10, x - dx, y + this.height / 2 + ey / 2, dx * 2, camera.size.y);

        // top opening
        ctx.drawImage(images.pipes, 0, 60, 32, 20, x - dx, y - this.height / 2 - ey, dx * 2, ey);

        // bottom opening
        ctx.drawImage(images.pipes, 0, 0, 32, 20, x - dx, y + this.height / 2, dx * 2, ey);
    }

    /** @param {Camera} camera */
    isOutOfScreen(camera) {
        const screenMinX = camera.size.x * (cfg.camera.xPos - 0.5 - cfg.pipe.outOfScreenCoef);
        return this.pos.x < screenMinX;
    }

    /** @param {AABB} rect */
    overlaps(rect) {
        const xOverlap = rect.pos.x + rect.ext.x > this.pos.x - cfg.pipe.width / 2 && rect.pos.x - rect.ext.x < this.pos.x + cfg.pipe.width / 2;
        const yOverlap = rect.pos.y + rect.ext.y > this.pos.y + this.height / 2 || rect.pos.y - rect.ext.y < this.pos.y - this.height / 2;
        return xOverlap && yOverlap;
    }
}
