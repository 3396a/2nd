export class Timer {
    /** @param {number} delay */
    constructor(delay) {
        assert(delay > 0);
        this.delay = delay;
        this.time = delay;
    }

    /** @param {number} dt */
    update(dt) {
        this.time -= dt;
        this.time = max(0, this.time);
    }

    checkEvent() {
        if (this.time == 0) {
            this.time = this.delay;
            return true;
        }
        return false;
    }
}
