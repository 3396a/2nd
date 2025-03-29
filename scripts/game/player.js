import { cfg } from '../config.js';
import { AABB } from '../lib/aabb.js';
import { vec2 } from '../lib/vec2.js';
import { images } from './images.js';

export class Player {
    constructor() {
        this.pos = vec2();
        this.vel = vec2();

        this.animTime = 0;

        this.rect = new AABB(cfg.player.extents, this.pos);
    }

    /** @param {number} dt */
    update(dt) {
        this.vel.y += dt * (cfg.player.gravity - this.vel.y * cfg.player.airResistanceCoef);
        this.pos.AddScaled(this.vel, dt);

        this.animTime += dt * cfg.player.animSpeed;
        this.animTime = min(this.animTime, 3);
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        const sx = 64 * floor(this.animTime);
        const w = 8;
        const a = w / 64;
        const ddy = [0, 3, 7, 10][floor(this.animTime)] * a;
        const { x: px, y: py } = this.pos;
        const { x: ex, y: ey } = this.rect.ext;
        ctx.drawImage(images.player, sx, px, 64, 64, px - 44 * a, py + ddy - 47 * a, 10, 10);
    }

    jump() {
        audio.play(audio.flap);
        this.animTime = 0;
        this.vel.y = -cfg.player.jumpVel;
    }
}
