import { Utils } from './utils.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Particle, DamageNumber, ExpOrb } from './particle.js';
import { UIManager } from './ui.js';
import { ScreenShake } from './effects.js';
import { Bomb, BombProjectile } from './bomb.js';
import { Explosion } from './explosion.js';
import { WeatherSystem } from './weather.js';
import { GameConfig } from './game-config.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // 論理解像度設定: デバイスの画面サイズに合わせて動的に調整
        // 縦向き・横向きで異なる基準値を使用
        this.baseViewWidth = 850;  // 横向き用の基準視野幅
        this.baseViewHeight = 850; // 縦向き用の基準視野高さ
        
        // 画面の向きを判定して論理解像度を設定
        const isPortrait = this.height > this.width;
        if (isPortrait) {
            // 縦向き: 高さを基準にして幅を計算
            this.logicalHeight = this.baseViewHeight;
            this.logicalWidth = this.baseViewHeight * (this.width / this.height);
            this.scale = this.height / this.logicalHeight;
        } else {
            // 横向き: 幅を基準にして高さを計算
            this.logicalWidth = this.baseViewWidth;
            this.logicalHeight = this.baseViewWidth * (this.height / this.width);
            this.scale = this.width / this.logicalWidth;
        }
        
        // カメラ座標（プレイヤー中心）
        this.camera = {
            x: 0,
            y: 0
        };
        
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
        this.explosions = []; // Explosion effects
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
        this.bossSpawnTimeoutId = null; // タイマーIDを保存（メモリリーク防止）
        this.warningTimeoutId = null; // 警告UI用タイマーID（メモリリーク防止）
        
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
        
        // 画面の向きを判定して論理解像度を再計算
        const isPortrait = this.height > this.width;
        if (isPortrait) {
            // 縦向き: 高さを基準にして幅を計算
            this.logicalHeight = this.baseViewHeight;
            this.logicalWidth = this.baseViewHeight * (this.width / this.height);
            this.scale = this.height / this.logicalHeight;
        } else {
            // 横向き: 幅を基準にして高さを計算
            this.logicalWidth = this.baseViewWidth;
            this.logicalHeight = this.baseViewWidth * (this.height / this.width);
            this.scale = this.width / this.logicalWidth;
        }
    }

    startGame() {
        this.state = 'PLAYING';
        this.ui.hideAllScreens();
        
        // 既存のタイマーをクリア（ゲーム再起動時の競合防止）
        if (this.bossSpawnTimeoutId) {
            clearTimeout(this.bossSpawnTimeoutId);
            this.bossSpawnTimeoutId = null;
        }
        if (this.warningTimeoutId) {
            clearTimeout(this.warningTimeoutId);
            this.warningTimeoutId = null;
        }
        
        // Initialize game objects
        // プレイヤーを論理解像度の中心に配置
        this.player = new Player(this, this.logicalWidth / 2, this.logicalHeight / 2);
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
        // 既存のタイマーをクリア（メモリリーク防止）
        if (this.bossSpawnTimeoutId) {
            clearTimeout(this.bossSpawnTimeoutId);
            this.bossSpawnTimeoutId = null;
        }
        if (this.warningTimeoutId) {
            clearTimeout(this.warningTimeoutId);
            this.warningTimeoutId = null;
        }
        
        // 既存のPlayerをクリーンアップ（メモリリーク防止）
        if (this.player) {
            this.player.destroy();
        }
        
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
        // パフォーマンスモニタリング: エンティティ数の追跡
        const entityCount = this.enemies.length + this.projectiles.length + this.particles.length + this.pickups.length;
        
        // デバッグ: 大量のエンティティがある場合に警告（100個以上）
        if (entityCount > 100 && Math.random() < 0.01) { // 1%の確率でログ出力（スパム防止）
            console.warn(`⚠️ パフォーマンス警告: エンティティ総数=${entityCount} (敵:${this.enemies.length}, 発射物:${this.projectiles.length}, パーティクル:${this.particles.length}, アイテム:${this.pickups.length})`);
        }
        
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
            console.log('⏱️ ボススポーンタイマー発動！ timer:', (this.bossSpawnTimer/1000).toFixed(1), 's');
            this.showBossWarning(); // showBossWarning内でボススポーンタイマーを管理
            this.bossSpawnTimer = 0;
            this.bossActive = true;
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
        // ボススポーン準備中（警告中）はチェックをスキップ
        if (this.bossActive && !this.bossSpawnTimeoutId) {
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
        // パフォーマンス最適化: splice()を使った in-place 削除（GC負荷を大幅削減）
        // 後ろから削除することでインデックスのズレを防ぐ
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].markedForDeletion) this.enemies.splice(i, 1);
        }
        // projectilesは爆発処理の後にクリーンアップ（下記参照）
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            if (this.explosions[i].markedForDeletion) this.explosions.splice(i, 1);
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].markedForDeletion) this.particles.splice(i, 1);
        }
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            if (this.pickups[i].markedForDeletion) this.pickups.splice(i, 1);
        }
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            if (this.damageNumbers[i].markedForDeletion) this.damageNumbers.splice(i, 1);
        }
        
        // 衝突判定: 発射物 vs 敵
        // Note: O(n*m)の計算量。大量のエンティティがある場合は空間分割を検討
        // パフォーマンス問題の可能性: 敵100体 × 発射物50個 = 5000回の衝突チェック
        const collisionStartTime = performance.now();
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
        
        // パフォーマンス計測: 衝突判定が1ms以上かかる場合は警告
        const collisionTime = performance.now() - collisionStartTime;
        if (collisionTime > 1.0 && Math.random() < 0.05) { // 5%の確率でログ
            console.warn(`⚠️ 衝突判定パフォーマンス: ${collisionTime.toFixed(2)}ms (敵:${this.enemies.length}, 発射物:${this.projectiles.length})`);
        }
        
        // projectilesのクリーンアップ（爆発処理の後）
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            if (this.projectiles[i].markedForDeletion) this.projectiles.splice(i, 1);
        }
        
        
        // 衝突判定: 敵 vs プレイヤー（瞬間ダメージ + ノックバック）
        this.enemies.forEach(enemy => {
            if (Utils.Collision.circleRect(this.player, {x: enemy.x - enemy.width/2, y: enemy.y - enemy.height/2, w: enemy.width, h: enemy.height})) {
                 // 瞬間ダメージ（0.5秒のクールダウン付き）
                 this.player.takeDamage(enemy.damage, this.gameTime);
                 
                 // ノックバックを適用（ボスは強い力、通常敵は弱い力）
                 const knockbackForce = enemy.type === 'boss' 
                     ? GameConfig.BALANCE.BOSS_KNOCKBACK_FORCE 
                     : GameConfig.BALANCE.NORMAL_KNOCKBACK_FORCE;
                 this.player.applyKnockback(
                     enemy.x, 
                     enemy.y, 
                     knockbackForce, 
                     GameConfig.BALANCE.KNOCKBACK_DURATION
                 );
                 
                 const shakeIntensity = enemy.type === 'boss' ? 5 : 2;
                 this.screenShake.trigger(shakeIntensity, 200); // Shake on damage
            }
        });
        
        // Update UI logic
        this.ui.updateHUD();
    }
    
    showBossWarning() {
        console.log('🚨 ボス警告表示！ gameTime:', (this.gameTime/1000).toFixed(1), 's');
        const warning = document.getElementById('boss-warning');
        warning.classList.add('active');
        this.screenShake.trigger(5, 3000); // Shake during warning
        
        // 警告UI用タイマー（メモリリーク防止のため保存）
        this.warningTimeoutId = setTimeout(() => {
            warning.classList.remove('active');
            this.warningTimeoutId = null;
        }, 3000);
        
        // ボススポーンタイマーを保存し、ゲーム状態をチェック（競合状態防止）
        this.bossSpawnTimeoutId = setTimeout(() => {
            // ゲームオーバー以外ならボスをスポーン（レベルアップ中でもOK）
            if (this.state !== 'GAMEOVER' && this.bossActive) {
                this.spawnBoss();
            } else {
                console.warn('⚠️ ボススポーン中止: state=', this.state, 'bossActive=', this.bossActive);
            }
            this.bossSpawnTimeoutId = null;
        }, 3000);
    }
    
    spawnBoss() {
        // ボスをプレイヤーのすぐ近くにスポーン（画面内に見える位置）
        const angle = Math.random() * Math.PI * 2;
        // プレイヤーから200-300pxの範囲にランダムにスポーン
        const dist = 200 + Math.random() * 100;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        
        this.enemies.push(new Enemy(this, x, y, 'boss'));
        console.log("ボススポーン");
    }
    
    spawnExplosion(x, y, radius, damage) {
        this.explosions.push(new Explosion(this, x, y, radius, damage));
    }
    
    spawnDamageNumber(x, y, amount) {
        this.damageNumbers.push(new DamageNumber(this, x, y, amount));
    }
    
    spawnHitParticles(x, y, color) {
        // パフォーマンス最適化: パーティクル数を5→3に削減
        for (let i = 0; i < 3; i++) {
            this.particles.push(new Particle(this, x, y, color, Utils.Math.randRange(1, 3), Utils.Math.randRange(2, 4), Utils.Math.randRange(200, 400)));
        }
    }
    
    spawnExpOrb(x, y, value) {
        // 経験値オーブを画面内に制限
        // カメラの表示範囲内に収める
        const margin = 50; // 画面端からのマージン
        const minX = this.camera.x + margin;
        const maxX = this.camera.x + this.logicalWidth - margin;
        const minY = this.camera.y + margin;
        const maxY = this.camera.y + this.logicalHeight - margin;
        
        // 範囲内にクランプ
        const clampedX = Math.max(minX, Math.min(maxX, x));
        const clampedY = Math.max(minY, Math.min(maxY, y));
        
        this.pickups.push(new ExpOrb(this, clampedX, clampedY, value));
    }
    
    updateWeaponHUD() {
        this.ui.updateWeaponSlots();
    }
    
    triggerLevelUp() {
        this.state = 'LEVELUP';
        
        // 各武器の現在のレベルを取得
        const knifeWeapon = this.player.weapons.find(w => w.id === 'knife');
        const garlicWeapon = this.player.weapons.find(w => w.id === 'garlic');
        const bombWeapon = this.player.weapons.find(w => w.id === 'bomb');
        
        // Generate options (simplified logic for now)
        const options = [
            {
                id: 'knife',
                name: 'ナイフ',
                description: '最も近い敵にナイフを投げる。レベルアップで投げる数が増える。',
                icon: '🔪',
                type: 'weapon',
                isNew: !knifeWeapon,
                currentLevel: knifeWeapon ? knifeWeapon.level : 0
            },
            {
                id: 'garlic',
                name: 'ガーリック',
                description: '周囲の敵に継続的にダメージを与える。レベルアップで範囲が広がる。',
                icon: '🧄',
                type: 'weapon',
                isNew: !garlicWeapon,
                currentLevel: garlicWeapon ? garlicWeapon.level : 0
            },
            {
                id: 'bomb',
                name: 'ボム',
                description: '一定時間後に爆発する爆弾を投げる。広範囲にダメージを与える。',
                icon: '💣',
                type: 'weapon',
                isNew: !bombWeapon,
                currentLevel: bombWeapon ? bombWeapon.level : 0
            },
            {
                id: 'heal',
                name: '完全回復',
                description: 'HPを100%まで回復する。',
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
        
        // ボススポーンタイマーをクリア（ゲームオーバー後のスポーン防止）
        if (this.bossSpawnTimeoutId) {
            clearTimeout(this.bossSpawnTimeoutId);
            this.bossSpawnTimeoutId = null;
        }
        
        // 警告UIタイマーをクリア（メモリリーク防止）
        if (this.warningTimeoutId) {
            clearTimeout(this.warningTimeoutId);
            this.warningTimeoutId = null;
        }
        
        // Playerのイベントリスナーをクリーンアップ（メモリリーク防止）
        if (this.player) {
            this.player.destroy();
        }
        
        this.ui.showGameOver({
            time: `${(this.gameTime/1000).toFixed(1)}s`,
            level: this.player.level,
            kills: this.killCount
        });
    }

    spawnEnemy() {
        // 画面外にランダムにスポーン（論理解像度基準）
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        const padding = 50;
        
        switch(edge) {
            case 0: // top
                x = this.camera.x + Math.random() * this.logicalWidth;
                y = this.camera.y - padding;
                break;
            case 1: // right
                x = this.camera.x + this.logicalWidth + padding;
                y = this.camera.y + Math.random() * this.logicalHeight;
                break;
            case 2: // bottom
                x = this.camera.x + Math.random() * this.logicalWidth;
                y = this.camera.y + this.logicalHeight + padding;
                break;
            case 3: // left
                x = this.camera.x - padding;
                y = this.camera.y + Math.random() * this.logicalHeight;
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
        
        // カメラ位置に基づいてグリッドを描画
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = this.camera.x + this.logicalWidth;
        const endY = this.camera.y + this.logicalHeight;

        for (let x = startX; x < endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.camera.y);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }

        for (let y = startY; y < endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.camera.x, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }

    renderStartScreen() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // スタート画面用にカメラを初期化
        this.camera.x = 0;
        this.camera.y = 0;
        
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.drawGrid();
        this.ctx.restore();
    }
    
    render() {
        // カメラをプレイヤー中心に更新
        if (this.player) {
            this.camera.x = this.player.x - this.logicalWidth / 2;
            this.camera.y = this.player.y - this.logicalHeight / 2;
        }
        
        // Clear screen
        this.ctx.fillStyle = '#1a1a2e'; // Match CSS bg-color
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.save();
        
        // スケーリングを適用（論理解像度→実際の画面）
        this.ctx.scale(this.scale, this.scale);
        
        // カメラオフセットを適用（プレイヤー中心）
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Apply Shake
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
