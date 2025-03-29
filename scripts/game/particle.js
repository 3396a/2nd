import { cfg } from '../config.js';
import { Vec2 } from '../lib/vec2.js';

export class Particle {
    /**
     * @param {Vec2} pos
     * @param {Vec2} vel
     * @param {number} size
     * @param {string} color
     */
    constructor(pos, vel, size, color) {
        this.pos = pos;
        this.vel = vel;
        this.size = size;
        this.color = color;
        this.lifetime = cfg.particle.lifetime;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        const { x, y } = this.pos;
        const s = this.size;
        ctx.fillStyle = this.color;
        ctx.fillRect(x - s, y - s, 2 * s, 2 * s);
    }

    /** @param {number} dt */
    update(dt) {
        this.vel.y += cfg.particle.gravity;
        this.pos.AddScaled(this.vel, dt);
        this.lifetime -= dt;
    }

    isAlive() {
        return this.lifetime > 0;
    }
}
