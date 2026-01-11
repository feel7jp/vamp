import { Utils } from './utils.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Particle, DamageNumber, ExpOrb } from './particle.js';
import { UIManager } from './ui.js';
import { ScreenShake } from './effects.js';
import { Bomb, BombProjectile } from './bomb.js';
import { Explosion } from './explosion.js';
import { WeatherSystem } from './weather.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.ui = new UIManager(this);
        this.screenShake = new ScreenShake();
        this.weather = new WeatherSystem(this);
        
        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        
        this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER, LEVELUP
        
        // Game entities
        this.player = null;
        this.enemies = [];
        this.particles = [];
        this.pickups = []; // XP orbs, health packs
        this.projectiles = []; // Player weapons projectiles
        this.damageNumbers = []; // Floating damage numbers
        
        // Game progress
        this.score = 0;
        this.gameTime = 0;
        this.killCount = 0;
        this.level = 1;
        
        // Spawning
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1000; // Start with 1 sec
        
        this.bossSpawnTimer = 0;
        this.bossSpawnInterval = 60000; // 60 sec
        this.bossActive = false;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Setup simple input handling for start screen
        document.getElementById('btn-start').addEventListener('click', () => this.startGame());
        document.getElementById('btn-restart').addEventListener('click', () => this.resetGame());
        
        // Initial render
        this.renderStartScreen();
        
        console.log("Game initialized");
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    startGame() {
        this.state = 'PLAYING';
        this.ui.hideAllScreens();
        
        // Initialize game objects
        this.player = new Player(this, this.width / 2, this.height / 2);
        this.enemies = [];
        this.particles = [];
        this.pickups = [];
        this.projectiles = [];
        this.explosions = []; // New
        this.damageNumbers = [];
        
        this.score = 0;
        this.gameTime = 0;
        this.killCount = 0;
        this.level = 1;
        
        this.ui.updateHUD();
        this.ui.updateWeaponSlots();
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1000;
        
        this.bossSpawnTimer = 0;
        this.bossActive = false;

        this.lastTime = performance.now();
        requestAnimationFrame((ts) => this.gameLoop(ts));
        
        console.log("Game started");
    }

    resetGame() {
        this.startGame();
    }

    gameLoop(timeStamp) {
        if (this.state !== 'PLAYING' && this.state !== 'LEVELUP') return;

        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (this.state === 'PLAYING') {
            this.update(deltaTime);
        }
        
        this.render();

        if (this.state !== 'GAMEOVER') {
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;
        
        // Update Effects
        this.screenShake.update(deltaTime);
        this.weather.update(deltaTime);
        
        // Update Player
        if (this.player) {
            this.player.update(deltaTime);
            if (this.player.hp <= 0) {
                this.gameOver();
                return;
            }
        }
        
        // Boss Spawning Logic
        this.bossSpawnTimer += deltaTime;
        if (this.bossSpawnTimer >= this.bossSpawnInterval && !this.bossActive) {
            this.showBossWarning();
            this.bossSpawnTimer = 0;
            this.bossActive = true;
            setTimeout(() => this.spawnBoss(), 3000); // Spawn after 3s warning
        }
        
        // Spawn Enemies (Normal)
        if (!this.bossActive) { // Pause normal spawning during boss intro maybe? Or keep it chaotic
            this.enemySpawnTimer += deltaTime;
            if (this.enemySpawnTimer > this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
                // Decrease interval slightly over time
                this.enemySpawnInterval = Math.max(200, 1000 - (this.gameTime / 1000) * 5); 
            }
        }
        
        // Update Enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Check boss death
        if (this.bossActive) {
            const boss = this.enemies.find(e => e.type === 'boss');
            if (!boss) {
                this.bossActive = false; // Boss killed
                this.bossSpawnTimer = 0; // Reset timer for next boss
            }
        }
        
        // Update Projectiles
        this.projectiles.forEach(p => p.update(deltaTime));
        this.explosions.forEach(e => e.update(deltaTime));
        
        // Update Particles & Pickups & Text
        this.particles.forEach(p => p.update(deltaTime));
        this.pickups.forEach(p => p.update(deltaTime));
        this.damageNumbers.forEach(d => d.update(deltaTime));
        
        // フレーム毎のクリーンアップ: 削除マークされたエンティティを配列から除外
        // Note: filter()は新しい配列を生成するため、大量のエンティティがある場合はGC負荷あり
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.explosions = this.explosions.filter(e => !e.markedForDeletion);
        this.particles = this.particles.filter(p => !p.markedForDeletion);
        this.pickups = this.pickups.filter(p => !p.markedForDeletion);
        this.damageNumbers = this.damageNumbers.filter(d => !d.markedForDeletion);
        
        // 衝突判定: 発射物 vs 敵
        // Note: O(n*m)の計算量。大量のエンティティがある場合は空間分割を検討
        this.projectiles.forEach(proj => {
            if (proj.type === 'garlic') return; // Handled internally
            
            this.enemies.forEach(enemy => {
                if (!proj.markedForDeletion && !enemy.markedForDeletion) {
                    if (Utils.Collision.circleRect(proj, {x: enemy.x - enemy.width/2, y: enemy.y - enemy.height/2, w: enemy.width, h: enemy.height})) {
                        enemy.takeDamage(proj.damage);
                        this.spawnDamageNumber(enemy.x, enemy.y, proj.damage);
                        this.spawnHitParticles(enemy.x, enemy.y, enemy.color);
                        proj.markedForDeletion = true; // Destroy projectile (unless piercing)
                        
                        // Extra shake on big hits
                        if (proj.damage > 20) this.screenShake.trigger(2, 100);
                    }
                }
            });
            
            // Bomb explosion trigger on expiration
            if (proj.markedForDeletion && proj.type === 'bomb') {
                 this.spawnExplosion(proj.x, proj.y, proj.area, proj.damage);
            }
        });
        
        // 衝突判定: 敵 vs プレイヤー（接触ダメージ）
        this.enemies.forEach(enemy => {
            if (Utils.Collision.circleRect(this.player, {x: enemy.x - enemy.width/2, y: enemy.y - enemy.height/2, w: enemy.width, h: enemy.height})) {
                 this.player.takeDamage(10 * deltaTime/1000); // Continuous damage
                 this.screenShake.trigger(2, 200); // Shake on damage
            }
        });
        
        // Update UI logic
        this.ui.updateHUD();
    }
    
    showBossWarning() {
        const warning = document.getElementById('boss-warning');
        warning.classList.add('active');
        this.screenShake.trigger(5, 3000); // Shake during warning
        setTimeout(() => warning.classList.remove('active'), 3000);
    }
    
    spawnBoss() {
        // Spawn boss far away
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(this.width, this.height);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        
        this.enemies.push(new Enemy(this, x, y, 'boss'));
        console.log("BOSS SPAWNED");
    }
    
    spawnExplosion(x, y, radius, damage) {
        this.explosions.push(new Explosion(this, x, y, radius, damage));
    }
    
    spawnDamageNumber(x, y, amount) {
        this.damageNumbers.push(new DamageNumber(this, x, y, amount));
    }
    
    spawnHitParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(this, x, y, color, Utils.Math.randRange(1, 3), Utils.Math.randRange(2, 4), Utils.Math.randRange(200, 400)));
        }
    }
    
    spawnExpOrb(x, y, value) {
        this.pickups.push(new ExpOrb(this, x, y, value));
    }
    
    updateWeaponHUD() {
        this.ui.updateWeaponSlots();
    }
    
    triggerLevelUp() {
        this.state = 'LEVELUP';
        
        // Generate options (simplified logic for now)
        const options = [
            {
                id: 'knife',
                name: 'Throwing Knife',
                description: 'Throws a knife at nearby enemies.',
                icon: '🔪',
                type: 'weapon',
                isNew: !this.player.weapons.find(w => w.id === 'knife')
            },
            {
                id: 'garlic',
                name: 'Garlic Aura',
                description: 'Damages enemies in an area around you.',
                icon: '🧄',
                type: 'weapon',
                isNew: !this.player.weapons.find(w => w.id === 'garlic')
            },
            {
                id: 'bomb',
                name: 'Cherry Bomb',
                description: 'Throws bombs that explode in a large area.',
                icon: '💣',
                type: 'weapon',
                isNew: !this.player.weapons.find(w => w.id === 'bomb')
            },
            {
                id: 'heal',
                name: 'Full Health',
                description: 'Recover 100% HP.',
                icon: '❤️',
                type: 'passive',
                isNew: false
            }
        ];
        
        this.ui.showLevelUpOptions(options);
    }
    
    selectUpgrade(option) {
        if (option.type === 'weapon') {
            this.player.addWeapon(option.id);
        } else if (option.id === 'heal') {
            this.player.hp = this.player.maxHp;
        }
        
        // Resume game
        this.state = 'PLAYING';
        this.lastTime = performance.now(); // Reset delta so we don't jump
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    gameOver() {
        this.state = 'GAMEOVER';
        this.ui.showGameOver({
            time: `${(this.gameTime/1000).toFixed(1)}s`,
            level: this.player.level,
            kills: this.killCount
        });
    }

    spawnEnemy() {
        // Spawn randomly outside screen
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        const padding = 50;
        
        switch(edge) {
            case 0: // top
                x = Math.random() * this.width;
                y = -padding;
                break;
            case 1: // right
                x = this.width + padding;
                y = Math.random() * this.height;
                break;
            case 2: // bottom
                x = Math.random() * this.width;
                y = this.height + padding;
                break;
            case 3: // left
                x = -padding;
                y = Math.random() * this.height;
                break;
        }
        
        // Determine type based on game time
        let type = 'normal';
        if (this.gameTime > 30000 && Math.random() < 0.2) type = 'fast';
        if (this.gameTime > 60000 && Math.random() < 0.1) type = 'tank';
        
        this.enemies.push(new Enemy(this, x, y, type));
    }

    drawGrid() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        const gridSize = 100;
        
        const offsetX = 0;
        const offsetY = 0;

        for (let x = offsetX % gridSize; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = offsetY % gridSize; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    renderStartScreen() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.drawGrid();
    }
    
    render() {
        // Clear screen
        this.ctx.fillStyle = '#1a1a2e'; // Match CSS bg-color
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Apply Shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);

        // Draw basic grid for reference
        this.drawGrid();

        // Render entities
        this.particles.forEach(p => p.render(this.ctx));
        this.pickups.forEach(p => p.render(this.ctx));
        this.explosions.forEach(e => e.render(this.ctx)); // Behind enemies/player? or top? top for effect
        this.enemies.forEach(e => e.render(this.ctx));
        this.projectiles.forEach(p => p.render(this.ctx));
        
        if (this.player) this.player.render(this.ctx);
        
        this.damageNumbers.forEach(d => d.render(this.ctx));
        
        this.weather.render(this.ctx); // Overlay
        
        this.ctx.restore();
    }
}

window.onload = () => {
    const game = new Game();
};
