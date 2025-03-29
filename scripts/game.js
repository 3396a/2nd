import { cfg, settings, stats } from './config.js';
import { Bullet } from './game/bullet.js';
import { Camera } from './game/camera.js';
import { Coin } from './game/coin.js';
import { images } from './game/images.js';
import { Particle } from './game/particle.js';
import { Pipe } from './game/pipe.js';
import { Player } from './game/player.js';
import { overlap } from './lib/aabb.js';
import { Timer } from './lib/timer.js';
import { vec2 } from './lib/vec2.js';
import { audio } from './ui/audio.js';
import { canvas } from './ui/canvas.js';

export const gameMenus = {
    pause: selector('#pause-menu'),
    confirm: selector('#confirm-menu'),
    gameOver: selector('#gameover-menu'),

    /** @type {Element | null} */
    active: null,

    /** @param {Element} menu */
    show(menu) {
        this.hide();
        menu.classList.add('active');
        this.active = menu;
    },

    /** @param {Element} [menu] */
    hide(menu) {
        if (menu) assert(this.active === menu);
        this.active?.classList?.remove('active');
    },
};

export class Game {
    constructor() {
        this.lastFrameTimestamp = 0;

        this.paused = false;
        this.stopped = false;
        this.gameIsOver = false;
        this.gameOverScreenShown = false;

        this.camera = new Camera();
        this.camera.update(canvas);

        this.time = 0;
        this.score = 0;
        this.distance = 0;

        this.speed = 1;

        this.player = new Player();
        this.player.pos.y = -6;

        /** @type {Pipe[]} */
        this.pipes = [];
        this.addPipeTimer = new Timer(cfg.pipe.addDelay);

        // spawn some pipes in
        for (let i = 0; i < cfg.pipe.initialCount; i++) {
            for (const pipe of this.pipes) {
                pipe.update(this.addPipeTimer.delay * this.speed);
            }
            this.spawnPipe();
        }

        /** @type {Coin[]} */
        this.coins = [];
        this.addCoinTimer = new Timer(cfg.coin.addInterval);

        /** @type {Bullet[]} */
        this.bullets = [];
        this.bulletCooldownTimer = new Timer(stats.bullet.delay);
        this.bulletCooldownTimer.time = 0;

        this.shotgunShots = stats.shotgun.shots;
        this.shotgunTimer = new Timer(stats.shotgun.delay);
        this.shotgunTimer.time = 0;

        /** @type {Particle[]} */
        this.particles = [];

        this.mouse = vec2();

        this.backgroundOffset = 0;
    }

    /** Start the game loop (should only be called once) */
    startTick() {
        requestAnimationFrame(timestamp => {
            this.lastFrameTimestamp = timestamp;
            requestAnimationFrame(timestamp => this.tick(timestamp));
        });
        this.player.jump();
    }

    /** End the game loop permanently (should only be called once) */
    stopTick() {
        this.stopped = true;
    }

    pause() {
        assert(!this.paused, 'Tried to pause game, but it is already paused');
        this.paused = true;
        gameMenus.show(gameMenus.pause);
    }

    unpause() {
        assert(this.paused, 'Tried to unpause game, but it is already unpaused');
        this.paused = false;
        gameMenus.hide(gameMenus.pause);
    }

    isIngame() {
        return !(this.paused || this.gameIsOver || this.stopped);
    }

    /** @param {number} timestamp */
    tick(timestamp) {
        if (this.stopped) return;

        requestAnimationFrame(timestamp => this.tick(timestamp));
        const dt = min(25, timestamp - this.lastFrameTimestamp) / 1000;

        this.lastFrameTimestamp = timestamp;

        if (this.isIngame()) {
            this.time += dt;
            this.distance += dt * this.speed;
            this.update(dt);
        }
        if (this.gameIsOver && !this.gameOverScreenShown) {
            this.updateAfterGameOver(dt);
        }

        this.render();
    }

    /**
     * Update game state
     *
     * @param {number} dt
     */
    update(dt) {
        this.speed = 1 + log(1 + 2 * log(1 + this.time / 100));

        this.player.update(dt);
        this.checkGameOver();

        this.addPipeTimer.update(dt * this.speed);
        if (this.addPipeTimer.checkEvent()) this.spawnPipe();

        this.bulletCooldownTimer.update(dt);

        this.addCoinTimer.update(dt);
        if (this.addCoinTimer.checkEvent()) this.tryAddCoin();

        this.shotgunTimer.update(dt);

        for (const pipe of this.pipes) {
            pipe.update(dt * this.speed);
        }
        this.pipes = this.pipes.filter(pipe => !pipe.isOutOfScreen(this.camera));

        for (const bullet of this.bullets) {
            bullet.update(dt * this.speed);
            if (this.pipes.some(pipe => pipe.overlaps(bullet.rect))) {
                bullet.collided = true;
                audio.play(audio.bulletHit);
                break;
            }
            for (const coin of this.coins) {
                if (overlap(coin.rect, bullet.rect) && !coin.collected) {
                    bullet.collided = true;
                    coin.collect();
                    this.score += 1;
                    break;
                }
            }
        }
        for (const coin of this.coins) {
            if (overlap(coin.rect, this.player.rect) && !coin.collected) {
                coin.collect();
                this.score += 1;
            }
        }
        this.bullets = this.bullets.filter(bullet => !bullet.collided && !bullet.isOutOfScreen(this.camera));

        for (const coin of this.coins) {
            coin.update(dt, this.speed * cfg.scrollSpeed);
        }
        this.coins = this.coins.filter(coin => !coin.isOutOfScreen(this.camera));

        for (const particle of this.particles) {
            particle.update(dt);
        }
        this.particles = this.particles.filter(particle => particle.isAlive());

        this.backgroundOffset += dt * cfg.background.speed;
        this.backgroundOffset = mod(this.backgroundOffset, 1);
    }

    spawnPipe() {
        const spawnX = this.camera.size.x * (cfg.camera.xPos + 0.5 + cfg.pipe.outOfScreenCoef);
        const height = lerp(cfg.pipe.minHeight, cfg.pipe.maxHeight, random());
        const spawnY = (cfg.pipe.maxHeight - height / 2) * (2 * smoothstep(random()) - 1);
        this.pipes.push(new Pipe(vec2(spawnX, spawnY), height));
    }

    spawnBullet() {
        audio.play(audio.bullet);
        const pos = this.player.pos.clone();
        pos.x += 0.2;
        const vel = this.mouse.sub(pos).Normalize().Mul(cfg.bullet.speed);
        this.bullets.push(new Bullet(pos, vel));
    }

    tryAddCoin() {
        if (random() >= cfg.coin.addChance) return;
        console.log(1);
        const spawnX = this.camera.size.x * (cfg.camera.xPos + 0.5) + cfg.coin.extents.x * 2;
        const spawnY = (2 * smoothstep(random()) - 1) * cfg.pipe.maxY;
        const coin = new Coin(vec2(spawnX, spawnY));
        if (this.pipes.some(pipe => pipe.overlaps(coin.rect))) {
            return;
        }
        this.coins.push(coin);
    }

    /** @param {number} dt */
    updateAfterGameOver(dt) {
        this.player.update(dt);
        if (this.player.pos.y > this.camera.size.y / 2 + cfg.pipe.maxY) {
            this.showGameOverScreen();
        }
        for (const coin of this.coins) {
            coin.update(dt, 0);
        }
    }

    showGameOverScreen() {
        this.gameOverScreenShown = true;
        gameMenus.show(gameMenus.gameOver);
    }

    checkGameOver() {
        if (this.player.pos.y >= this.camera.size.y / 2 + cfg.pipe.maxY) {
            this.gameOver(true);
            return;
        }

        for (const pipe of this.pipes) {
            if (pipe.overlaps(this.player.rect)) {
                this.gameOver();
                return;
            }
        }
    }

    /** @param {boolean} quit */
    gameOver(quit = false) {
        if (quit) audio.play(audio.quitFall);
        else audio.play(audio.deathFall);

        this.gameIsOver = true;
        gameMenus.hide();
        this.player.jump();

        const plural = this.score === 1 ? '' : 's';
        selector('#gameover-score').textContent = `${this.score} point${plural}`;
        selector('#gameover-time').textContent = formatTime(this.time);

        stats.points += this.score;
        stats.update();
    }

    render() {
        const { ctx } = canvas;
        canvas.clear();
        this.camera.update(canvas);

        this.drawBackground(ctx);

        this.player.draw(ctx);

        for (const pipe of this.pipes) {
            pipe.draw(ctx, this.camera);
        }

        for (const particle of this.particles) {
            particle.draw(ctx);
        }

        for (const coin of this.coins) {
            coin.draw(ctx);
        }

        for (const bullet of this.bullets) {
            bullet.draw(ctx);
        }

        if (!this.gameIsOver) {
            this.drawInfo(ctx);
        }
    }

    /** @param {CanvasRenderingContext2D} ctx */
    drawBackground(ctx) {
        // image size
        const s = cfg.background.scale * cfg.pipe.maxY * 2;
        const nx = (this.camera.size.x * this.camera.fov) / s + 1;

        const mx0 = (cfg.camera.xPos - 0.5) * this.camera.size.x;
        const cy = (this.camera.size.y * cfg.background.centerY) / 2;

        // top
        ctx.drawImage(images.background, 0, 0, 256, 1, mx0, -this.camera.size.y / 2, this.camera.size.x, cy + this.camera.size.y / 2);

        // bottom
        ctx.drawImage(images.background, 255, 255, 1, 1, mx0, cy, this.camera.size.x, cy + this.camera.size.y / 2);
        // center
        ctx.drawImage(images.background, 0, 0, 1, 256, mx0 - 1, cy - s / 2, this.camera.size.x + 1, s);

        for (let dx = 0; dx < nx; dx++) {
            const mx = mx0 + s * (dx - this.backgroundOffset);
            // bottom
            ctx.drawImage(images.background, 0, 255, 256, 1, mx, cy, s, this.camera.size.y / 2);
            // center
            ctx.drawImage(images.background, mx, cy - s / 2, s, s);
        }
    }

    /** @param {CanvasRenderingContext2D} ctx */
    drawInfo(ctx) {
        const x = this.camera.size.x * (cfg.camera.xPos - 0.5) + 3;
        const y = -this.camera.size.y / 2 + 3;
        const m = ctx.measureText('Score');
        const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
        ctx.font = '1.5px Atkinson Hyperlegible Mono';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'black';
        ctx.fillText(`Score: ${this.score}`, x, y);
        ctx.fillText(`Time: ${formatTime(this.time)}`, x, y + 2 * h);

        this.drawProgressBar(ctx, this.bulletCooldownTimer, 'rgb(145, 68, 13)', 'rgb(240, 170, 58)', 0);
        if (stats.shotgun.shots !== 0) {
            this.drawProgressBar(ctx, this.shotgunTimer, 'rgb(50 60 100)', 'rgb(255 30 0)', 2);
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Timer} timer
     * @param {string} outerColor
     * @param {string} innerColor
     * @param {number} offset
     */
    drawProgressBar(ctx, timer, outerColor, innerColor, offset) {
        const { x: w, y: h } = cfg.cooldownBarSize;
        const x = this.camera.size.x * (cfg.camera.xPos - 0.5) + 3;
        const y = this.camera.size.y / 2 - 3 - offset * h;
        ctx.beginPath();
        ctx.rect(x, y - h, w, h);
        ctx.strokeStyle = outerColor;
        ctx.fillStyle = outerColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.fill();

        const t = 1 - timer.time / timer.delay;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - h);
        ctx.lineTo(x + w * t, y - h);
        ctx.lineTo(x + w * t, y);
        ctx.closePath();
        ctx.fillStyle = innerColor;
        ctx.fill();
    }

    tryShotgun() {
        if (this.shotgunShots === 0) {
            if (stats.shotgun.shots !== 0) {
                audio.play(audio.deny);
            }
            return;
        }
        if (!this.shotgunTimer.checkEvent()) return;
        this.shotgunShots -= 1;
        this.shootShotgun();
    }

    shootShotgun() {
        audio.play(audio.shotgunReload);
        const target = this.pipes.find(pipe => pipe.pos.x + cfg.pipe.width / 2 > -this.player.rect.ext.x);
        this.pipes = this.pipes.filter(pipe => pipe !== target);

        if (!target) return;
        let size = vec2(cfg.pipe.width, this.camera.size.y);
        let min = vec2(target.pos.x, 0).AddScaled(size, -0.5);
        for (let i = 0; i < 100; i++) {
            let pos = vec2(random(), random()).Mul(size).Add(min);
            if (abs(pos.y - target.pos.y) < target.height / 2) {
                i++;
                continue;
            }
            let vel = vec2(lerp(-1, 1, random()), -10)
                .Normalize()
                .Mul(50);
            vel.x -= this.speed * cfg.scrollSpeed;
            this.particles.push(new Particle(pos, vel, 0.2, 'green'));
        }
    }

    /** @param {KeyboardEvent} e */
    keydown(e) {
        if (e.repeat) return;
        if (this.gameIsOver) return;

        if (settings.spaceToPause && e.code === 'Space') {
            if (!this.paused) this.pause();
            else {
                if (gameMenus.active === gameMenus.pause) this.unpause();
            }
        }

        if (!this.isIngame()) return;
        if (e.code === 'KeyS') this.player.jump();
        if (e.code === 'KeyD') this.tryShotgun();
    }

    /** @param {KeyboardEvent} e */
    keyup(e) {}

    /** @param {MouseEvent} e */
    mousemove(e) {
        this.mouse.Set(e.clientX, e.clientY);
        this.camera.transformPoint(canvas, this.mouse);
    }

    /** @param {MouseEvent} e */
    mousedown(e) {
        if (!this.isIngame()) return;
        if (this.bulletCooldownTimer.checkEvent()) {
            this.spawnBullet();
        }
    }

    /** @param {MouseEvent} e */
    mouseup(e) {}
}

/** @param {number} s Seconds */
function formatTime(s) {
    s = round(s);
    const seconds = mod(s, 60) + '';
    const minutes = floor(s / 60);
    if (minutes === 0) {
        return `${seconds}s`;
    } else {
        return `${minutes}m ${seconds.padStart(2, '0')}s`;
    }
}
