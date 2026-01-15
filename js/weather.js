import { Utils } from './utils.js';

export class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.type = 'clear'; // 晴れ、雨、雪
        this.opacity = 0;
        this.particles = [];
        this.timer = 0;
        this.changeInterval = 30000; // 30秒ごとに変更
    }
    
    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.changeInterval) {
            this.changeWeather();
            this.timer = 0;
        }
        
        // パーティクルを更新（カメラ座標基準）
        this.particles.forEach(p => {
            p.y += p.speed;
            p.x += p.drift;
            
            // ループ（画面外に出たら上から再表示）
            const screenBottom = this.game.camera.y + this.game.logicalHeight;
            const screenTop = this.game.camera.y;
            const screenLeft = this.game.camera.x;
            const screenRight = this.game.camera.x + this.game.logicalWidth;
            
            if (p.y > screenBottom) {
                p.y = screenTop - 10;
                p.x = screenLeft + Math.random() * this.game.logicalWidth;
            }
            if (p.x > screenRight) p.x = screenLeft;
            if (p.x < screenLeft) p.x = screenRight;
        });
    }
    
    changeWeather() {
        const types = ['clear', 'rain', 'snow'];
        // const nextInfo = types[Math.floor(Math.random() * types.length)];
        // デモ用に固定順でサイクル: 晴れ → 雨 → 雪
        if (this.type === 'clear') this.type = 'rain';
        else if (this.type === 'rain') this.type = 'snow';
        else this.type = 'clear';
        
        this.initParticles();
        console.log("Weather changed to:", this.type);
    }
    
    initParticles() {
        this.particles = [];
        if (this.type === 'rain') {
            // パフォーマンス最適化: パーティクル数を100→50に削減
            // 視覚的な品質を維持しつつ、レンダリング負荷を半減
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: this.game.camera.x + Math.random() * this.game.logicalWidth,
                    y: this.game.camera.y + Math.random() * this.game.logicalHeight,
                    speed: Utils.Math.randRange(10, 20), // 速い
                    drift: -2, // 左への弱い風
                    length: Utils.Math.randRange(10, 20)
                });
            }
        } else if (this.type === 'snow') {
            // 雪は元々50個なので変更なし
             for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: this.game.camera.x + Math.random() * this.game.logicalWidth,
                    y: this.game.camera.y + Math.random() * this.game.logicalHeight,
                    speed: Utils.Math.randRange(1, 3), // 遅い
                    drift: Utils.Math.randRange(-1, 1), // ゆらゆら
                    size: Utils.Math.randRange(2, 4)
                });
            }
        }
    }
    
    render(ctx) {
        if (this.type === 'clear') return;
        
        ctx.fillStyle = this.type === 'rain' ? 'rgba(100, 150, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        
        this.particles.forEach(p => {
            if (this.type === 'rain') {
               ctx.moveTo(p.x, p.y);
               ctx.lineTo(p.x + p.drift, p.y + p.length);
            } else {
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            }
        });
        
        if (this.type === 'rain') {
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.fill();
        }
        
        // 画面全体の色調補正（カメラ座標基準）
        if (this.type === 'rain') {
            ctx.fillStyle = 'rgba(0, 0, 50, 0.1)';
            ctx.fillRect(this.game.camera.x, this.game.camera.y, this.game.logicalWidth, this.game.logicalHeight);
        } else if (this.type === 'snow') {
             ctx.fillStyle = 'rgba(200, 200, 255, 0.1)';
            ctx.fillRect(this.game.camera.x, this.game.camera.y, this.game.logicalWidth, this.game.logicalHeight);
        }
    }
}
