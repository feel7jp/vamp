import { Utils } from './utils.js';

export class Weapon {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.level = 1;
        this.cooldown = 0;
        this.canShoot = true;
        
        // Stats to be overridden
        this.baseDamage = 5;
        this.baseCooldown = 1000; // ms
        this.name = "Unknown Weapon";
        this.id = "unknown";
        this.icon = "❓";
        this.color = "#fff";
        this.range = 200;
        this.area = 1; // Size multiplier
        this.speed = 5;
        this.duration = 1000;
        this.amount = 1; // Number of projectiles
    }
    
    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        } else {
            this.canShoot = true;
            this.shoot();
        }
    }
    
    shoot() {
        if (!this.canShoot) return;
        
        // Logic specific to weapon type
        this.fireLogic();
        
        // Reset cooldown
        this.canShoot = false;
        this.cooldown = this.baseCooldown;
    }
    
    fireLogic() {
        console.log("Bang!");
    }
    
    levelUp() {
        this.level++;
        this.baseDamage *= 1.2;
        // Specific upgrades in subclasses
        console.log(`${this.name} leveled up to ${this.level}`);
    }
}

export class Knife extends Weapon {
    constructor(game, owner) {
        super(game, owner);
        this.name = "Knife";
        this.id = "knife";
        this.icon = "🔪";
        this.baseDamage = 10;
        this.baseCooldown = 300; // Much faster
        this.speed = 10; // Faster projectiles
        this.amount = 1;
    }
    
    fireLogic() {
        for (let i = 0; i < this.amount; i++) {
            // Always target nearest enemy
            let vx = 0;
            let vy = 0;
            
            const nearest = this.getNearestEnemy();
            if (nearest) {
                const angle = Utils.Vec2.angle(this.owner, nearest);
                vx = Math.cos(angle);
                vy = Math.sin(angle);
            } else {
                // No enemies, shoot right
                vx = 1;
                vy = 0;
            }
            
            // Normalize
            const mag = Math.sqrt(vx*vx + vy*vy);
            if (mag > 0) {
                vx = (vx / mag) * this.speed;
                vy = (vy / mag) * this.speed;
            }
            
            // Add spread if amount > 1
            if (this.amount > 1) {
                const spread = 0.2 * (i - (this.amount-1)/2);
                // Rotate vector logic roughly
                // ... simplified for now
            }
            
            this.game.projectiles.push(new Projectile(
                this.game, 
                this.owner.x, 
                this.owner.y, 
                vx, vy, 
                this.baseDamage, 
                1000, // life
                this.id
            ));
        }
    }
    
    getNearestEnemy() {
        let nearest = null;
        let minDist = Infinity;
        
        this.game.enemies.forEach(e => {
            const d = Utils.Vec2.dist(this.owner, e);
            if (d < minDist) {
                minDist = d;
                nearest = e;
            }
        });
        return nearest;
    }
    
    levelUp() {
        super.levelUp();
        if (this.level % 2 === 0) this.amount++; // +1 knife every 2 levels
        this.baseCooldown *= 0.9;
    }
}

export class Garlic extends Weapon {
    constructor(game, owner) {
        super(game, owner);
        this.name = "Garlic";
        this.id = "garlic";
        this.icon = "🧄";
        this.baseDamage = 3; // Increased from 2
        this.baseCooldown = 100; // Faster tick rate (was 200)
        this.range = 60;
        this.active = true; // Always active
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        // Visual effect creates a persistent aura
        // handled in projectile or special rendering? 
        // For garlic, it's easier to just check collisions here or assume a persistent projectile attached to player
    }
    
    fireLogic() {
        // Create an aura projectile that follows player if not exists
        const exists = this.game.projectiles.find(p => p.type === 'garlic' && !p.markedForDeletion);
        if (!exists) {
            this.game.projectiles.push(new AuraProjectile(
                this.game,
                this.owner,
                this.range,
                this.baseDamage,
                this.id
            ));
        }
    }
    
    levelUp() {
        super.levelUp();
        this.range *= 1.2;
        this.baseDamage += 1;
    }
}

// Projectile Classes

export class Projectile {
    constructor(game, x, y, vx, vy, damage, life, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.life = life;
        this.type = type;
        this.radius = 5;
        this.markedForDeletion = false;
        
        this.color = '#fff';
        if (type === 'knife') this.color = '#f0f';
    }
    
    update(deltaTime) {
        const timeScale = deltaTime / (1000/60);
        this.x += this.vx * timeScale;
        this.y += this.vy * timeScale;
        
        this.life -= deltaTime;
        if (this.life <= 0) this.markedForDeletion = true;
    }
    
    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Trail effect
        // ...
    }
}

export class AuraProjectile extends Projectile {
    constructor(game, owner, radius, damage, type) {
        super(game, owner.x, owner.y, 0, 0, damage, 100, type); // Short life, renewed constanty or logic handled differently
        this.owner = owner;
        this.radius = radius;
        this.maxLife = Infinity; // Persists
        this.life = Infinity;
        this.tickTimer = 0;
        this.tickRate = 200; // Damage every 200ms
    }
    
    update(deltaTime) {
        this.x = this.owner.x;
        this.y = this.owner.y;
        this.radius = this.owner.weapons.find(w => w.id === 'garlic').range; // Sync range
        this.damage = this.owner.weapons.find(w => w.id === 'garlic').baseDamage;
        
        // Garlic logic: Check all enemies in range
        this.tickTimer += deltaTime;
        if (this.tickTimer >= this.tickRate) {
            this.tickTimer = 0;
            this.game.enemies.forEach(e => {
                if (Utils.Collision.circleRect(this, {x: e.x - e.width/2, y: e.y - e.height/2, w: e.width, h: e.height})) {
                     // Deal damage
                     // We need to return this event to the game loop or handle it here
                     // For simplicity, let's mark it 'hit' so game loop processes it? 
                     // Or just apply damage directly if we have access
                     e.takeDamage(this.damage);
                     this.game.spawnDamageNumber(e.x, e.y, this.damage);
                }
            });
        }
    }
    
    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 100, 100, 0.1)'; // Faint red aura
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
