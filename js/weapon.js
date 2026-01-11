import { Utils } from './utils.js';
import { GameConfig } from './game-config.js';

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
        this.baseDamage *= GameConfig.BALANCE.WEAPON_LEVEL_DAMAGE_MULTIPLIER;
        // Specific upgrades in subclasses
        console.log(`${this.name} leveled up to ${this.level}`);
    }
}

export class Knife extends Weapon {
    constructor(game, owner) {
        super(game, owner);
        const config = GameConfig.WEAPONS.KNIFE;
        this.name = config.NAME;
        this.id = config.ID;
        this.icon = config.ICON;
        this.baseDamage = config.BASE_DAMAGE;
        this.baseCooldown = config.BASE_COOLDOWN;
        this.speed = config.PROJECTILE_SPEED;
        this.amount = config.STARTING_AMOUNT;
    }
    
    
    fireLogic() {
        for (let i = 0; i < this.amount; i++) {
            // Always target nearest enemy
            let vx = 0;
            let vy = 0;
            
            // Utils.Enemy.getNearestEnemy を使用（コードの重複を削減）
            const nearest = Utils.Enemy.getNearestEnemy(this.owner, this.game.enemies);
            if (nearest) {
                const angle = Utils.Vec2.angle(this.owner, nearest);
                // 弾に誤差を追加: ±0.15ラジアン（約±8.6度）のランダムな角度誤差
                const angleDeviation = (Math.random() - 0.5) * 0.3; // -0.15 ~ +0.15
                const adjustedAngle = angle + angleDeviation;
                vx = Math.cos(adjustedAngle);
                vy = Math.sin(adjustedAngle);
            } else {
                // No enemies, shoot right with slight randomness
                const randomAngle = (Math.random() - 0.5) * 0.3;
                vx = Math.cos(randomAngle);
                vy = Math.sin(randomAngle);
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
                GameConfig.WEAPONS.KNIFE.PROJECTILE_LIFE,
                this.id
            ));
        }
    }

    levelUp() {
        // ナイフ専用: レベルアップごとに威力を10％減らす
        this.level++;
        this.baseDamage *= 0.9; // 1つあたりの威力を10％減少
        
        // ナイフの数を増やす（2レベルごと）
        if (this.level % GameConfig.BALANCE.WEAPON_LEVEL_KNIFE_AMOUNT_INTERVAL === 0) {
            this.amount++;
        }
        
        // クールダウンを短縮
        this.baseCooldown *= GameConfig.BALANCE.WEAPON_LEVEL_COOLDOWN_MULTIPLIER;
        
        console.log(`${this.name} leveled up to ${this.level}`);
    }
}

export class Garlic extends Weapon {
    constructor(game, owner) {
        super(game, owner);
        const config = GameConfig.WEAPONS.GARLIC;
        this.name = config.NAME;
        this.id = config.ID;
        this.icon = config.ICON;
        this.baseDamage = config.BASE_DAMAGE;
        this.baseCooldown = config.BASE_COOLDOWN;
        this.range = config.STARTING_RANGE;
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
        this.range *= GameConfig.BALANCE.WEAPON_LEVEL_GARLIC_RANGE_MULTIPLIER;
        this.baseDamage += GameConfig.BALANCE.WEAPON_LEVEL_GARLIC_DAMAGE_INCREASE;
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
        this.radius = GameConfig.WEAPONS.KNIFE.PROJECTILE_RADIUS;
        this.markedForDeletion = false;
        
        this.color = '#fff';
        if (type === 'knife') this.color = GameConfig.WEAPONS.KNIFE.COLOR;
    }
    
    update(deltaTime) {
        const timeScale = deltaTime / GameConfig.TIMING.TARGET_FRAME_TIME;
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
        super(game, owner.x, owner.y, 0, 0, damage, 100, type);
        this.owner = owner;
        this.radius = radius;
        this.maxLife = Infinity; // Persists
        this.life = Infinity;
        this.tickTimer = 0;
        this.tickRate = GameConfig.WEAPONS.GARLIC.TICK_RATE;
        
        // パフォーマンス最適化: 武器への参照をキャッシュ（毎フレームfind()を呼ぶ必要なし）
        this.weaponRef = owner.weapons.find(w => w.id === 'garlic');
    }
    
    update(deltaTime) {
        this.x = this.owner.x;
        this.y = this.owner.y;
        
        // キャッシュした武器参照を使用（毎フレームの検索を回避）
        if (this.weaponRef) {
            this.radius = this.weaponRef.range;
            this.damage = this.weaponRef.baseDamage;
        } else {
            // 武器が見つからない場合は削除マークして終了
            this.markedForDeletion = true;
            return;
        }
        
        // Garlic logic: Check all enemies in range
        this.tickTimer += deltaTime;
        if (this.tickTimer >= this.tickRate) {
            this.tickTimer = 0;
            this.game.enemies.forEach(e => {
                if (Utils.Collision.circleRect(this, {x: e.x - e.width/2, y: e.y - e.height/2, w: e.width, h: e.height})) {
                     // Deal damage
                     // パフォーマンス最適化: ガーリックのダメージではパーティクルを生成しない
                     // 理由: 200msごとに全敵に対してパーティクル生成すると、
                     //       敵20体 × 5パーティクル = 100個/秒 の生成で画面が埋まる
                     e.takeDamage(this.damage);
                     this.game.spawnDamageNumber(e.x, e.y, this.damage);
                     // this.game.spawnHitParticles(e.x, e.y, e.color); // ← 削除
                }
            });
        }
    }
    
    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = GameConfig.WEAPONS.GARLIC.COLOR;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
