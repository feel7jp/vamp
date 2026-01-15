import { Utils } from './utils.js';

export class Explosion {
    constructor(game, x, y, radius, damage, damageColor = '#ffffff') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.damage = damage;
        this.damageColor = damageColor;
        this.life = 0.5; // 秒
        this.maxLife = 0.5;
        this.active = true; // ダメージは1回だけ適用
    }
    
    update(deltaTime) {
        // パフォーマンス最適化: activeフラグで1回だけダメージ判定を実行
        // 問題: 爆発が複数ある場合、activeがfalseでも毎フレームこのメソッドが呼ばれていた
        if (this.active) {
            // Apply damage - この処理は爆発発生時の1回だけ実行される
            this.game.enemies.forEach(e => {
                if (Utils.Collision.circleRect({x: this.x, y: this.y, radius: this.radius}, 
                    {x: e.x - e.width/2, y: e.y - e.height/2, w: e.width, h: e.height})) {
                    e.takeDamage(this.damage);
                    this.game.spawnDamageNumber(e.x, e.y, this.damage, this.damageColor);
                }
            });
            
            this.game.screenShake.trigger(5, 200);
            this.active = false; // Only once - これ以降はダメージ処理をスキップ
        }
        
        // アニメーションの更新のみ（軽量）
        this.life -= deltaTime / 1000;
        if (this.life <= 0) this.markedForDeletion = true;
    }
    
    render(ctx) {
        const progress = 1 - (this.life / this.maxLife);
        const currentRadius = this.radius * Math.sin(progress * Math.PI); // 膨らんでから縮む
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 0, ${this.life / this.maxLife})`; // オレンジ色でフェードアウト
        ctx.fill();
        
        // 内側の白い閃光
        if (progress < 0.2) {
             ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 200, ${1 - progress*5})`;
            ctx.fill();
        }
    }
}
