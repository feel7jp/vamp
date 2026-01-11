import { Utils } from './utils.js';
import { GameConfig } from './game-config.js';

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
        
        // 時間経過で縮小
        this.currentSize = this.size * (this.life / this.maxLife);
    }
    
    render(ctx) {
        // パフォーマンス最適化: globalAlpha の変更を最小限に
        const alpha = this.life / this.maxLife;
        if (alpha <= 0) return; // 完全に透明な場合はスキップ
        
        ctx.globalAlpha = alpha;
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
        // 内部計算はfloatのまま保持（切り捨てなし）
        this.damage = damage;
        this.life = 800; // ミリ秒
        this.maxLife = 800;
        this.vy = -1; // 上に浮かぶ
        this.markedForDeletion = false;
        
        // 見た目の多様性のためランダムにずらす
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
        // 表示時のみ切り上げ（Math.ceil）
        const displayDamage = Math.ceil(this.damage);
        ctx.strokeText(displayDamage, this.x, this.y);
        ctx.fillText(displayDamage, this.x, this.y);
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
        this.color = '#4facfe'; // シアン
        if (value > 10) {
            this.radius = 6;
            this.color = '#a0e6ff'; // 薄いシアン
        }
        if (value > 100) {
            this.radius = 8;
            this.color = '#ff4757'; // 赤い宝石
        }
        
        this.markedForDeletion = false;
        this.isCollected = false;
        this.speed = 8; // 回収時の飛行速度
    }
    
    update(deltaTime) {
        if (!this.game.player) return;
        // 磁石範囲をチェック
        const dist = Utils.Vec2.dist(this, this.game.player);
        const magnetRange = GameConfig.PICKUP.MAGNET_RANGE;
        
        if (dist < magnetRange || this.isCollected) {
            this.isCollected = true;
            
            // プレイヤーに向かって飛ぶ
            const angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
            this.x += Math.cos(angle) * this.speed * (deltaTime / 16);
            this.y += Math.sin(angle) * this.speed * (deltaTime / 16);
            
            // deltaTimeに基づいて加速、最大速度で制限
            const acceleration = 0.5 * (deltaTime / 16);
            const maxSpeed = 20; // 最大速度の上限
            this.speed = Math.min(this.speed + acceleration, maxSpeed);
            
            if (dist < this.game.player.radius) {
                this.markedForDeletion = true;
                this.game.player.gainExp(this.value);
                // サウンド再生（オプション）
            }
        }
    }
    
    render(ctx) {
        // パフォーマンス最適化: shadowBlur を削除（重い処理）
        // 大量の経験値オーブがある場合、shadowBlur は GPU に大きな負荷
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 枠線のみで視認性を確保（shadowBlurより軽量）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
