import { Utils } from './utils.js';

export class Explosion {
    constructor(game, x, y, radius, damage) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.damage = damage;
        this.life = 0.5; // seconds
        this.maxLife = 0.5;
        this.active = true; // Damage applied once
    }
    
    update(deltaTime) {
        if (this.active) {
            // Apply damage
            this.game.enemies.forEach(e => {
                if (Utils.Collision.circleRect({x: this.x, y: this.y, radius: this.radius}, 
                    {x: e.x - e.width/2, y: e.y - e.height/2, w: e.width, h: e.height})) {
                    e.takeDamage(this.damage);
                    this.game.spawnDamageNumber(e.x, e.y, this.damage);
                }
            });
            
            this.game.screenShake.trigger(5, 200);
            this.active = false; // Only once
        }
        
        this.life -= deltaTime / 1000;
        if (this.life <= 0) this.markedForDeletion = true;
    }
    
    render(ctx) {
        const progress = 1 - (this.life / this.maxLife);
        const currentRadius = this.radius * Math.sin(progress * Math.PI); // Expand then shrink
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 0, ${this.life / this.maxLife})`; // Fade out orange
        ctx.fill();
        
        // Inner white flash
        if (progress < 0.2) {
             ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 200, ${1 - progress*5})`;
            ctx.fill();
        }
    }
}
