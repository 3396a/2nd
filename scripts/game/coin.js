import { cfg } from '../config.js';
import { AABB } from '../lib/aabb.js';
import { vec2, Vec2 } from '../lib/vec2.js';
import { Camera } from './camera.js';
import { images } from './images.js';

export class Coin {
    /** @param {Vec2} pos */
    constructor(pos) {
        this.collected = false;
        this.rect = new AABB(cfg.coin.extents, pos);
        this.pos = pos;
        this.vel = vec2();
        this.animTime = 2;
    }

    collect() {
        audio.play(audio.coin);
        this.collected = true;
        this.vel.y = -cfg.coin.jumpVel;
    }

    /**
     * @param {number} dt
     * @param {number} speed
     */
    update(dt, speed) {
        this.rect.pos.x -= dt * speed;
        if (this.collected) {
            this.vel.y += dt * cfg.coin.gravity;
            this.pos.AddScaled(this.vel, dt);

            this.animTime += dt * cfg.coin.animSpeed;
            this.animTime = mod(this.animTime, 6);
        }
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        const sx = 16 * floor(this.animTime);
        const { x, y } = this.rect.pos;
        const { x: dx, y: dy } = this.rect.ext;
        ctx.drawImage(images.coin, sx, 0, 16, 16, x - dx, y - dy, dx * 2, dy * 2);
    }

    /** @param {Camera} camera */
    isOutOfScreen(camera) {
        const screenMinX = camera.size.x * (cfg.camera.xPos - 0.5 - cfg.pipe.outOfScreenCoef);
        const screenMaxY = camera.size.y;
        return this.pos.x < screenMinX || this.pos.y - this.rect.ext.y > screenMaxY;
    }
}
