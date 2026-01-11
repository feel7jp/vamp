import { Weapon, Projectile } from './weapon.js';
import { GameConfig } from './game-config.js';
import { Utils } from './utils.js';

export class Bomb extends Weapon {
    constructor(game, owner) {
        super(game, owner);
        const config = GameConfig.WEAPONS.BOMB;
        this.name = config.NAME;
        this.id = config.ID;
        this.icon = config.ICON;
        this.baseDamage = config.BASE_DAMAGE;
        this.baseCooldown = config.BASE_COOLDOWN;
        this.speed = config.PROJECTILE_SPEED;
        this.area = config.EXPLOSION_RADIUS;
    }
    
    fireLogic() {
        // Throw at random nearby enemy or random direction
        let targetX, targetY;
        const nearest = this.getNearestEnemy();
        
        if (nearest) {
            targetX = nearest.x;
            targetY = nearest.y;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const dist = 200;
            targetX = this.owner.x + Math.cos(angle) * dist;
            targetY = this.owner.y + Math.sin(angle) * dist;
        }
        
        // Calculate velocity to reach target in ~1 second (60 frames)
        const timeToTarget = 60;
        const vx = (targetX - this.owner.x) / timeToTarget;
        const vy = (targetY - this.owner.y) / timeToTarget;
        
        this.game.projectiles.push(new BombProjectile(
            this.game,
            this.owner.x,
            this.owner.y,
            vx, vy,
            this.baseDamage,
            GameConfig.WEAPONS.BOMB.FUSE_TIME,
            this.id,
            this.area
        ));
    }
    
    getNearestEnemy() {
        let nearest = null;
        let minDist = Infinity;
        
        this.game.enemies.forEach(e => {
            const d = Utils.Vec2.dist(this.owner, e);
            if (d < minDist && d < 400) { // Only target reasonably close
                minDist = d;
                nearest = e;
            }
        });
        return nearest;
    }
}

export class BombProjectile extends Projectile {
    constructor(game, x, y, vx, vy, damage, life, type, area) {
        super(game, x, y, vx, vy, damage, life, type);
        this.area = area;
        this.gravity = 0.2; // Fake Z-axis gravity visual
        this.z = 0;
        this.vz = -5; // Initial upward velocity for arc
        this.groundY = y; // Roughly target Y? No, arc is visual only.
        // Actually, let's treat x/y as ground coordinates and add a visual offset Y
        
        // Re-calculate to match the target logic strictly:
        // Life defines when it explodes.
        this.maxLife = life; 
    }
    
    update(deltaTime) {
        // Normal XY movement
        super.update(deltaTime);
        
        // Visual arc simulation
        // Start at z=0, go up, come down.
        // Simple sin wave based on life?
        const progress = 1 - (this.life / this.maxLife);
        this.z = Math.sin(progress * Math.PI) * -50; // Arc height 50px
        
        // Spin logic could go here
    }
    
    render(ctx) {
        // Shadow on ground
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();
        
        // Bomb sprite (with Z offset)
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.z, GameConfig.WEAPONS.BOMB.PROJECTILE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = GameConfig.WEAPONS.BOMB.COLOR;
        ctx.fill();
        
        // Fuse
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 2, this.y + this.z - 8, 4, 4);
    }
}
