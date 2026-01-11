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
        
        // 軌跡エフェクト用の位置履歴（最大10点）
        this.trail = [];
        this.trailMaxLength = 10; 
    }
    
    update(deltaTime) {
        // 通常のXY方向の移動
        super.update(deltaTime);
        
        // 放物線の視覚的なシミュレーション
        // z=0から始まり、上昇して下降する
        // 寿命に基づいた単純なsin波
        const progress = 1 - (this.life / this.maxLife);
        this.z = Math.sin(progress * Math.PI) * -50; // 放物線の高さ50px
        
        // 軌跡の記録（現在の位置を追加）
        this.trail.push({ x: this.x, y: this.y + this.z });
        if (this.trail.length > this.trailMaxLength) {
            this.trail.shift(); // 古い位置を削除
        }
    }
    
    render(ctx) {
        // 軌跡を描画（グラデーションで薄くなる）
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i + 1) / this.trail.length; // 古いほど薄い
            ctx.beginPath();
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.6})`; // 黄色い軌跡
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
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
        
        // 外周の光（視認性向上）
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 導火線（点滅アニメーション）
        const flickerAlpha = Math.random() > 0.5 ? 1.0 : 0.6;
        ctx.fillStyle = `rgba(255, 50, 50, ${flickerAlpha})`;
        ctx.fillRect(this.x - 2, this.y + this.z - 8, 4, 4);
    }
}
