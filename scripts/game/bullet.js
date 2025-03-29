import { cfg } from '../config.js';
import { AABB } from '../lib/aabb.js';
import { Vec2 } from '../lib/vec2.js';
import { Camera } from './camera.js';
import { images } from './images.js';

export class Bullet {
    /**
     * @param {Vec2} pos
     * @param {Vec2} vel
     */
    constructor(pos, vel) {
        this.collided = false;
        this.rect = new AABB(cfg.bullet.extents, pos);
        this.pos = pos;
        this.vel = vel;
    }

    /** @param {number} dt */
    update(dt) {
        this.vel.y += dt * cfg.bullet.gravity;
        this.pos.AddScaled(this.vel, dt);
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        const { x: ex, y: ey } = cfg.bullet.extents;
        const { x, y } = this.pos;
        ctx.drawImage(images.bullet, 0, 0, 9, 9, x - ex, y - ey, ex * 2, ey * 2);
    }

    /** @param {Camera} camera */
    isOutOfScreen(camera) {
        const screenMinX = camera.size.x * (cfg.camera.xPos - 0.5 - cfg.pipe.outOfScreenCoef);
        return this.pos.x < screenMinX;
    }
}
