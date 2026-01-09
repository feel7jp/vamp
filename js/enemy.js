import { Utils } from './utils.js';

export class Enemy {
    constructor(game, x, y, type = 'normal') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Stats based on type
        this.width = 20;
        this.height = 20;
        this.color = '#ff4757'; // Red
        this.speed = 1.5;
        this.hp = 10;
        this.damage = 10;
        this.expValue = 10;
        
        this.markedForDeletion = false;
        
        this.setupStats();
    }
    
    setupStats() {
        switch(this.type) {
            case 'fast':
                this.speed = 2.5;
                this.hp = 5;
                this.color = '#ffd700'; // Gold/Yellow
                this.width = 15;
                this.height = 15;
                break;
            case 'tank':
                this.speed = 1.0;
                this.hp = 30;
                this.color = '#2ed573'; // Green
                this.width = 30;
                this.height = 30;
                this.expValue = 30;
                break;
            case 'boss':
                this.speed = 2.0;
                this.hp = 500;
                this.width = 80;
                this.height = 80;
                this.color = '#8e44ad'; // Purple
                this.expValue = 1000;
                this.damage = 25;
                break;
            default: // normal
                break;
        }
        
        // Scale with game time slightly
        const difficultyMultiplier = 1 + (this.game.gameTime / 60000) * 0.2;
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
                this.game.screenShake.trigger(10, 500); // Intense shake
                // More particles for boss
                 for (let i = 0; i < 20; i++) {
                    this.game.spawnHitParticles(this.x, this.y, this.color);
                 }
            }
        }
    }
}
