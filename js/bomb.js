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
        // 近くの敵に投げる。いなければランダムな方向へ
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
        
        // 約1秒（60フレーム）で目標に到達する速度を計算
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
            if (d < minDist && d < 400) { // 適度に近い敵だけをターゲットにする
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
        this.gravity = 0.2; // Z軸方向の疑似重力（見た目の演出）
        this.z = 0;
        this.vz = -5; // 放物線を描くための初期上向き速度
        this.groundY = y; // 地面のY座標（演出用のみ）
        // x/yを地面の座標として扱い、視覚的なオフセットYを追加
        
        // 厳密な目標ロジックに合わせて再計算:
        // life変数が爆発タイミングを決定
        this.maxLife = life; 
    }
    
    update(deltaTime) {
        // 通常のXY方向の移動
        super.update(deltaTime);
        
        // 放物線の視覚的なシミュレーション
        // z=0から始まり、上昇して下降する
        // 寿命に基づいた単純なsin波
        const progress = 1 - (this.life / this.maxLife);
        this.z = Math.sin(progress * Math.PI) * -50; // 放物線の高さ50px
        
        // 回転ロジックもここに追加可能
    }
    
    render(ctx) {
        // 地面に影を描画
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();
        
        // 爆弾本体（Z軸オフセット付き）
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.z, GameConfig.WEAPONS.BOMB.PROJECTILE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = GameConfig.WEAPONS.BOMB.COLOR;
        ctx.fill();
        
        // 導火線
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 2, this.y + this.z - 8, 4, 4);
    }
}
