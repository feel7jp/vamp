import { Utils } from './utils.js';

export class Particle {
    constructor(game, x, y, color, speed, size, life) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.markedForDeletion = false;
    }
    
    update(deltaTime) {
        const timeScale = deltaTime / (1000/60);
        
        this.x += this.vx * timeScale;
        this.y += this.vy * timeScale;
        
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
        
        // Shrink over time
        this.currentSize = this.size * (this.life / this.maxLife);
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export class DamageNumber {
    constructor(game, x, y, damage) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.damage = Math.floor(damage);
        this.life = 800; // ms
        this.maxLife = 800;
        this.vy = -1; // Float up
        this.markedForDeletion = false;
        
        // Random offset for visual variety
        this.x += Utils.Math.randRange(-10, 10);
    }
    
    update(deltaTime) {
        this.y += this.vy * (deltaTime / 16);
        this.life -= deltaTime;
        if (this.life <= 0) this.markedForDeletion = true;
    }
    
    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(this.damage, this.x, this.y);
        ctx.fillText(this.damage, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

export class ExpOrb {
    constructor(game, x, y, value) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 4;
        this.color = '#4facfe'; // Cyan
        if (value > 10) {
            this.radius = 6;
            this.color = '#a0e6ff'; // Lighter cyan
        }
        if (value > 100) {
            this.radius = 8;
            this.color = '#ff4757'; // Red gem
        }
        
        this.markedForDeletion = false;
        this.isCollected = false;
        this.speed = 8; // Fly speed when collected
    }
    
    update(deltaTime) {
        if (!this.game.player) return;
        // Check magnet range
        const dist = Utils.Vec2.dist(this, this.game.player);
        const magnetRange = GameConfig.PICKUP.MAGNET_RANGE;
        
        if (dist < magnetRange || this.isCollected) {
            this.isCollected = true;
            
            // Fly to player
            const angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
            this.x += Math.cos(angle) * this.speed * (deltaTime / 16);
            this.y += Math.sin(angle) * this.speed * (deltaTime / 16);
            
            // Accelerate
            this.speed += 0.5;
            
            if (dist < this.game.player.radius) {
                this.markedForDeletion = true;
                this.game.player.gainExp(this.value);
                // Play sound (optional)
            }
        }
    }
    
    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
