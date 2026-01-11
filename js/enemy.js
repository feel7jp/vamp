import { Utils } from './utils.js';
import { GameConfig } from './game-config.js';

export class Enemy {
    constructor(game, x, y, type = 'normal') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Default to NORMAL enemy stats
        const defaults = GameConfig.ENEMY.NORMAL;
        this.width = defaults.WIDTH;
        this.height = defaults.HEIGHT;
        this.color = defaults.COLOR;
        this.speed = defaults.SPEED;
        this.hp = defaults.HP;
        this.damage = defaults.DAMAGE;
        this.expValue = defaults.EXP_VALUE;
        
        this.markedForDeletion = false;
        
        this.setupStats();
    }
    
    setupStats() {
        let config;
        
        switch(this.type) {
            case 'fast':
                config = GameConfig.ENEMY.FAST;
                break;
            case 'tank':
                config = GameConfig.ENEMY.TANK;
                break;
            case 'boss':
                config = GameConfig.ENEMY.BOSS;
                break;
            default: // normal
                config = GameConfig.ENEMY.NORMAL;
                break;
        }
        
        // Apply config
        this.speed = config.SPEED;
        this.hp = config.HP;
        this.width = config.WIDTH;
        this.height = config.HEIGHT;
        this.color = config.COLOR;
        this.expValue = config.EXP_VALUE;
        this.damage = config.DAMAGE;
        
        // Scale with game time slightly
        const difficultyMultiplier = 1 + (this.game.gameTime / 60000) * GameConfig.BALANCE.DIFFICULTY_INCREASE_PER_MINUTE;
        this.hp *= difficultyMultiplier;
    }
    
    update(deltaTime) {
        // Find direction to player
        if (!this.game.player) return;
        
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        // Normalize
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let moveX = 0;
        let moveY = 0;
        
        if (dist > 0) {
            moveX = (dx / dist) * this.speed;
            moveY = (dy / dist) * this.speed;
        }
        
        // Simple separation logic (avoid overlapping with other enemies)
        // Check a few nearby enemies - simplified for performance
        // In a real optimized game, we'd use a quadtree or spatial hash
        
        const timeScale = deltaTime / (1000/60);
        
        this.x += moveX * timeScale;
        this.y += moveY * timeScale;
    }
    
    render(ctx) {
        // Boss visual flair
        if (this.type === 'boss') {
            // Glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            
            // Rotating or pulsing effect could go here
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw eyes to show direction (cute touch)
        ctx.fillStyle = 'white';
        // ... (skipping detail for now to keep it simple geometry)
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        
        // Flash white effect could be handled in render
        
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            // this.game.player.gainExp(this.expValue); // Old direct way
            this.game.spawnExpOrb(this.x, this.y, this.expValue); // New pickup way
            this.game.killCount++;
            this.game.spawnHitParticles(this.x, this.y, this.color);
            
            if (this.type === 'boss') {
                this.game.screenShake.trigger(
                    GameConfig.BALANCE.BOSS_SCREEN_SHAKE_INTENSITY,
                    GameConfig.BALANCE.BOSS_SCREEN_SHAKE_DURATION
                );
                // More particles for boss
                 for (let i = 0; i < GameConfig.BALANCE.EXPLOSION_PARTICLE_COUNT; i++) {
                    this.game.spawnHitParticles(this.x, this.y, this.color);
                 }
            }
        }
    }
}
