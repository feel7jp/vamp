import { Utils } from './utils.js';
import { GameConfig } from './game-config.js';
import { Knife, Garlic } from './weapon.js';
import { Bomb } from './bomb.js';

export class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = GameConfig.PLAYER.RADIUS;
        this.color = GameConfig.PLAYER.COLOR;
        
        // ステータス
        this.speed = GameConfig.PLAYER.SPEED;
        this.hp = GameConfig.PLAYER.STARTING_HP;
        this.maxHp = GameConfig.PLAYER.STARTING_HP;
        this.level = GameConfig.PLAYER.STARTING_LEVEL;
        this.exp = GameConfig.PLAYER.STARTING_EXP;
        this.nextLevelExp = GameConfig.PLAYER.INITIAL_NEXT_LEVEL_EXP;
        
        // 武器
        this.weapons = [];
        this.addWeapon('knife'); // ナイフから開始
        this.addWeapon('bomb'); // 爆弾も最初から持つ
        
        // 移動の状態
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // タッチ操作の状態
        this.touchX = 0;
        this.touchY = 0;
        this.isTouching = false;
        
        // 入力リスナーの設定
        this.setupInput();
    }
    
    setupInput() {
        // キーボード操作
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'w': case 'W': this.keys.up = true; break;
                case 'ArrowDown': case 's': case 'S': this.keys.down = true; break;
                case 'ArrowLeft': case 'a': case 'A': this.keys.left = true; break;
                case 'ArrowRight': case 'd': case 'D': this.keys.right = true; break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'w': case 'W': this.keys.up = false; break;
                case 'ArrowDown': case 's': case 'S': this.keys.down = false; break;
                case 'ArrowLeft': case 'a': case 'A': this.keys.left = false; break;
                case 'ArrowRight': case 'd': case 'D': this.keys.right = false; break;
            }
        });
        
        // タッチ操作
        const canvas = this.game.canvas;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touchX = touch.clientX - rect.left;
            this.touchY = touch.clientY - rect.top;
            this.isTouching = true;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touchX = touch.clientX - rect.left;
            this.touchY = touch.clientY - rect.top;
        });
        
        canvas.addEventListener('touchend', () => {
            this.isTouching = false;
        });
        
        // マウス操作（タッチと同じロジック）
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.touchX = e.clientX - rect.left;
            this.touchY = e.clientY - rect.top;
            this.isTouching = true;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.isTouching) {
                const rect = canvas.getBoundingClientRect();
                this.touchX = e.clientX - rect.left;
                this.touchY = e.clientY - rect.top;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isTouching = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.isTouching = false;
        });
    }
    
    update(deltaTime) {
        // 移動方向を計算
        let dx = 0;
        let dy = 0;
        
        // タッチ操作が優先
        if (this.isTouching) {
            const touchDx = this.touchX - this.x;
            const touchDy = this.touchY - this.y;
            const distance = Math.sqrt(touchDx * touchDx + touchDy * touchDy);
            
            // タッチ位置がプレイヤーから十分離れている場合のみ移動
            if (distance > GameConfig.INPUT.TOUCH_MOVE_THRESHOLD) {
                dx = touchDx / distance;
                dy = touchDy / distance;
            }
        } else {
            // キーボード操作
            if (this.keys.up) dy -= 1;
            if (this.keys.down) dy += 1;
            if (this.keys.left) dx -= 1;
            if (this.keys.right) dx += 1;
            
            // ベクトルを正規化して斜め移動が速くならないようにする
            if (dx !== 0 || dy !== 0) {
                const length = Math.sqrt(dx * dx + dy * dy);
                dx = dx / length;
                dy = dy / length;
            }
        }
        
        // 速度を適用
        dx *= this.speed;
        dy *= this.speed;
        
        // 時間スケールで調整（60fps基準）
        const timeScale = deltaTime / (1000/60);
        
        // 移動を適用
        this.x += dx * timeScale;
        this.y += dy * timeScale;
        
        // 画面端のチェック（画面外に出ないようにする）
        this.x = Utils.Math.clamp(this.x, this.radius, this.game.width - this.radius);
        this.y = Utils.Math.clamp(this.y, this.radius, this.game.height - this.radius);
        
        this.updateWeapons(deltaTime);
    }
    
    addWeapon(type) {
        let weapon;
        // すでに持っているかチェック
        const existing = this.weapons.find(w => w.id === type);
        if (existing) {
            existing.levelUp();
            return;
        }
        
        switch(type) {
            case 'knife': weapon = new Knife(this.game, this); break;
            case 'garlic': weapon = new Garlic(this.game, this); break;
            case 'bomb': weapon = new Bomb(this.game, this); break;
        }
        
        if (weapon) {
            this.weapons.push(weapon);
            // HUDを更新
            this.game.updateWeaponHUD(); 
        }
    }
    
    updateWeapons(deltaTime) {
        this.weapons.forEach(w => w.update(deltaTime));
    }
    
    render(ctx) {
        // プレイヤーの本体を描画
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // 軽い光の効果を描画
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            // 死亡処理はGameクラスで行う
        }
    }
    
    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.nextLevelExp) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.nextLevelExp;
        this.nextLevelExp = Math.floor(this.nextLevelExp * GameConfig.PLAYER.EXP_SCALING_FACTOR);
        this.game.triggerLevelUp();
    }
}
