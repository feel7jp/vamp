import { Utils } from './utils.js';

export class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.type = 'clear'; // clear, rain, snow
        this.opacity = 0;
        this.particles = [];
        this.timer = 0;
        this.changeInterval = 30000; // Change every 30s
    }
    
    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.changeInterval) {
            this.changeWeather();
            this.timer = 0;
        }
        
        // Update particles
        this.particles.forEach(p => {
            p.y += p.speed;
            p.x += p.drift;
            
            // Loop
            if (p.y > this.game.height) {
                p.y = -10;
                p.x = Math.random() * this.game.width;
            }
            if (p.x > this.game.width) p.x = 0;
            if (p.x < 0) p.x = this.game.width;
        });
    }
    
    changeWeather() {
        const types = ['clear', 'rain', 'snow'];
        // const nextInfo = types[Math.floor(Math.random() * types.length)];
        // Force cycle for demo: clear -> rain -> snow
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
            for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: Math.random() * this.game.width,
                    y: Math.random() * this.game.height,
                    speed: Utils.Math.randRange(10, 20), // Fast
                    drift: -2, // Slight left wind
                    length: Utils.Math.randRange(10, 20)
                });
            }
        } else if (this.type === 'snow') {
            // 雪は元々50個なので変更なし
             for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: Math.random() * this.game.width,
                    y: Math.random() * this.game.height,
                    speed: Utils.Math.randRange(1, 3), // Slow
                    drift: Utils.Math.randRange(-1, 1), // Wobbly
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
        
        // Overlay tint
        if (this.type === 'rain') {
            ctx.fillStyle = 'rgba(0, 0, 50, 0.1)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        } else if (this.type === 'snow') {
             ctx.fillStyle = 'rgba(200, 200, 255, 0.1)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
    }
}
