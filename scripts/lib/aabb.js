import { Vec2 } from './vec2.js';

export class AABB {
    /**
     * @param {Vec2} extents
     * @param {Vec2} position
     */
    constructor(extents, position) {
        assert(extents.x > 0 && extents.y > 0);
        this.ext = extents;
        this.pos = position;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    drawDebugPath(ctx) {
        const { x: px, y: py } = this.pos;
        const { x: ex, y: ey } = this.ext;
        ctx.beginPath();
        ctx.moveTo(px - ex, py - ey);
        ctx.lineTo(px - ex, py + ey);
        ctx.lineTo(px + ex, py + ey);
        ctx.lineTo(px + ex, py - ey);
        ctx.closePath();
    }
}

/**
 * @param {AABB} a
 * @param {AABB} b
 */
export function overlap(a, b) {
    const xOverlap = abs(a.pos.x - b.pos.x) < a.ext.x + b.ext.x;
    const yOverlap = abs(a.pos.y - b.pos.y) < a.ext.x + b.ext.x;
    return xOverlap && yOverlap;
}
