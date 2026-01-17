import { Utils } from './utils.js';
import { GameConfig } from './game-config.js';

export class Enemy {
    constructor(game, x, y, type = 'normal') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        
        // デフォルトは通常敵のステータス
        const defaults = GameConfig.ENEMY.NORMAL;
        this.width = defaults.WIDTH;
        this.height = defaults.HEIGHT;
        this.color = defaults.COLOR;
        this.speed = defaults.SPEED;
        this.hp = defaults.HP;
        this.maxHp = defaults.HP;
        this.damage = defaults.DAMAGE;
        this.expValue = defaults.EXP_VALUE;
        this.knockbackForce = defaults.KNOCKBACK_FORCE;
        this.knockbackDuration = defaults.KNOCKBACK_DURATION;
        
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
        
        // 設定を適用
        this.speed = config.SPEED;
        this.hp = config.HP;
        this.maxHp = config.HP;
        this.width = config.WIDTH;
        this.height = config.HEIGHT;
        this.color = config.COLOR;
        this.expValue = config.EXP_VALUE;
        this.damage = config.DAMAGE;
        this.knockbackForce = config.KNOCKBACK_FORCE;
        this.knockbackDuration = config.KNOCKBACK_DURATION;
        
        // ゲーム時間に応じて難易度を少し上昇
        const difficultyMultiplier = 1 + (this.game.gameTime / 60000) * GameConfig.BALANCE.DIFFICULTY_INCREASE_PER_MINUTE;
        this.maxHp *= difficultyMultiplier;
        this.hp = this.maxHp;
    }
    
    update(deltaTime) {
        // プレイヤーへの方向を見つける
        if (!this.game.player) return;
        
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        // 距離を正規化（単位ベクトル化）
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let moveX = 0;
        let moveY = 0;
        
        if (dist > 0) {
            moveX = (dx / dist) * this.speed;
            moveY = (dy / dist) * this.speed;
        }
        
        // 敵同士の分離ロジック（重ならないようにする）
        // パフォーマンス最適化: 近くの敵のみチェック（O(N²)の負荷軽減）
        // ボスは他の敵に邪魔されないようにスキップ
        if (this.type !== 'boss') {
            const separationRadius = this.width * 1.5; // 分離判定の距離
            const separationForce = 0.5; // 分離する力の強さ
            const maxCheckDistance = separationRadius * 2; // 早期リターン用の距離閾値
            
            this.game.enemies.forEach(other => {
                if (other === this) return; // 自分自身は除外
                
                // パフォーマンス最適化: マンハッタン距離で早期リターン（sqrt計算を回避）
                const roughDist = Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
                if (roughDist > maxCheckDistance) return; // 遠い敵はスキップ
                
                // 詳細な距離計算（近い敵のみ）
                const otherDx = this.x - other.x;
                const otherDy = this.y - other.y;
                const otherDist = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                
                // 近すぎる場合は押し出す
                if (otherDist < separationRadius && otherDist > 0) {
                    const pushX = (otherDx / otherDist) * separationForce;
                    const pushY = (otherDy / otherDist) * separationForce;
                    moveX += pushX;
                    moveY += pushY;
                }
            });
        }
        
        const timeScale = deltaTime / (1000/60);
        
        this.x += moveX * timeScale;
        this.y += moveY * timeScale;
    }
    
    render(ctx) {
        // パフォーマンス最適化: shadowBlurは非常に重い処理
        // 大量の敵がいる場合、毎フレーム shadowBlur を設定すると GPU 負荷が高い
        // ボスのみ特別な演出として使用し、通常敵は単純な色で描画
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);

        // 体力バー（満タン時は非表示）
        const hpRatio = this.maxHp > 0 ? Math.max(0, this.hp) / this.maxHp : 0;
        if (hpRatio < 1) {
            const barWidth = this.width;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.height / 2 - 8;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = '#33dd55';
            ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        }
        
        // ボスの場合のみ、枠線で強調（shadowBlurより軽量）
        if (this.type === 'boss') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
        
        // 方向を示す目を描画（可愛い演出）
        // ctx.fillStyle = 'white';
        // ... （シンプルな形状を保つため、詳細は省略）
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        
        // 白い点滅効果はrenderで処理可能
        
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            // this.game.player.gainExp(this.expValue); // 旧方式：直接経験値を付与
            this.game.spawnExpOrb(this.x, this.y, this.expValue); // 新方式：拾えるアイテムを生成
            this.game.killCount++;
            this.game.spawnHitParticles(this.x, this.y, this.color);
            
            if (this.type === 'boss') {
                this.game.screenShake.trigger(
                    GameConfig.BALANCE.BOSS_SCREEN_SHAKE_INTENSITY,
                    GameConfig.BALANCE.BOSS_SCREEN_SHAKE_DURATION
                );
                // ボスの倒した時はパーティクルを増やす
                for (let i = 0; i < 100; i++) {
                    this.game.spawnHitParticles(this.x, this.y, this.color);
                }
            }
        }
    }
}
