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
        
        // ノックバック状態
        this.knockbackVelocityX = 0;
        this.knockbackVelocityY = 0;
        this.knockbackTimer = 0;
        
        // ダメージクールダウン（無敵時間）
        this.lastDamageTime = 0;
        this.damageCooldown = 500; // ミリ秒（0.5秒）
        
        // 入力リスナーの設定
        this.setupInput();
    }
    
    setupInput() {
        // イベントハンドラの参照を保存（メモリリーク防止のため）
        this.keydownHandler = (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'w': case 'W': this.keys.up = true; break;
                case 'ArrowDown': case 's': case 'S': this.keys.down = true; break;
                case 'ArrowLeft': case 'a': case 'A': this.keys.left = true; break;
                case 'ArrowRight': case 'd': case 'D': this.keys.right = true; break;
            }
        };
        
        this.keyupHandler = (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'w': case 'W': this.keys.up = false; break;
                case 'ArrowDown': case 's': case 'S': this.keys.down = false; break;
                case 'ArrowLeft': case 'a': case 'A': this.keys.left = false; break;
                case 'ArrowRight': case 'd': case 'D': this.keys.right = false; break;
            }
        };
        
        // キーボード操作
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
        
        // タッチ操作
        const canvas = this.game.canvas;
        
        this.touchstartHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            
            // 画面座標からワールド座標への変換
            const physicalX = touch.clientX - rect.left;
            const physicalY = touch.clientY - rect.top;
            // スケールを考慮して論理座標に変換
            const logicalX = physicalX / this.game.scale;
            const logicalY = physicalY / this.game.scale;
            // カメラオフセットを加算してワールド座標に変換
            this.touchX = logicalX + this.game.camera.x;
            this.touchY = logicalY + this.game.camera.y;
            this.isTouching = true;
        };
        
        this.touchmoveHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            
            // 画面座標からワールド座標への変換
            const physicalX = touch.clientX - rect.left;
            const physicalY = touch.clientY - rect.top;
            // スケールを考慮して論理座標に変換
            const logicalX = physicalX / this.game.scale;
            const logicalY = physicalY / this.game.scale;
            // カメラオフセットを加算してワールド座標に変換
            this.touchX = logicalX + this.game.camera.x;
            this.touchY = logicalY + this.game.camera.y;
        };
        
        this.touchendHandler = () => {
            this.isTouching = false;
        };
        
        canvas.addEventListener('touchstart', this.touchstartHandler);
        canvas.addEventListener('touchmove', this.touchmoveHandler);
        canvas.addEventListener('touchend', this.touchendHandler);
        
        // マウス操作（タッチと同じロジック）
        this.mousedownHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            
            // 画面座標からワールド座標への変換
            const physicalX = e.clientX - rect.left;
            const physicalY = e.clientY - rect.top;
            // スケールを考慮して論理座標に変換
            const logicalX = physicalX / this.game.scale;
            const logicalY = physicalY / this.game.scale;
            // カメラオフセットを加算してワールド座標に変換
            this.touchX = logicalX + this.game.camera.x;
            this.touchY = logicalY + this.game.camera.y;
            this.isTouching = true;
        };
        
        this.mousemoveHandler = (e) => {
            if (this.isTouching) {
                const rect = canvas.getBoundingClientRect();
                
                // 画面座標からワールド座標への変換
                const physicalX = e.clientX - rect.left;
                const physicalY = e.clientY - rect.top;
                // スケールを考慮して論理座標に変換
                const logicalX = physicalX / this.game.scale;
                const logicalY = physicalY / this.game.scale;
                // カメラオフセットを加算してワールド座標に変換
                this.touchX = logicalX + this.game.camera.x;
                this.touchY = logicalY + this.game.camera.y;
            }
        };
        
        this.mouseupHandler = () => {
            this.isTouching = false;
        };
        
        this.mouseleaveHandler = () => {
            this.isTouching = false;
        };
        
        canvas.addEventListener('mousedown', this.mousedownHandler);
        canvas.addEventListener('mousemove', this.mousemoveHandler);
        canvas.addEventListener('mouseup', this.mouseupHandler);
        canvas.addEventListener('mouseleave', this.mouseleaveHandler);
    }
    
    // メモリリーク防止: イベントリスナーをクリーンアップ
    destroy() {
        // キーボードイベントの削除
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
        
        // タッチイベントの削除
        const canvas = this.game.canvas;
        canvas.removeEventListener('touchstart', this.touchstartHandler);
        canvas.removeEventListener('touchmove', this.touchmoveHandler);
        canvas.removeEventListener('touchend', this.touchendHandler);
        
        // マウスイベントの削除
        canvas.removeEventListener('mousedown', this.mousedownHandler);
        canvas.removeEventListener('mousemove', this.mousemoveHandler);
        canvas.removeEventListener('mouseup', this.mouseupHandler);
        canvas.removeEventListener('mouseleave', this.mouseleaveHandler);
    }
    
    update(deltaTime) {
        // 時間スケールで調整（60fps基準）
        const timeScale = deltaTime / (1000/60);
        
        // ノックバックタイマーを更新
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= deltaTime;
            
            // ノックバック移動を適用
            this.x += this.knockbackVelocityX * timeScale;
            this.y += this.knockbackVelocityY * timeScale;
            
            // ノックバック速度を減衰
            this.knockbackVelocityX *= 0.9;
            this.knockbackVelocityY *= 0.9;
        } else {
            // 通常の移動処理
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
            
            // 移動を適用（制限なし - 無限に移動可能）
            this.x += dx * timeScale;
            this.y += dy * timeScale;
        }
        
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
    
    takeDamage(amount, currentTime) {
        // 瞬間ダメージシステム：0.5秒のクールダウン（無敵時間）
        if (currentTime - this.lastDamageTime < this.damageCooldown) {
            return; // クールダウン中はダメージを受けない
        }
        
        this.hp -= amount;
        this.lastDamageTime = currentTime;
        
        if (this.hp <= 0) {
            this.hp = 0;
            // 死亡処理はGameクラスで行う
        }
    }
    
    // ノックバックを適用（敵との接触時に呼ばれる）
    applyKnockback(enemyX, enemyY, force, duration) {
        // 敵からプレイヤーへの方向ベクトルを計算
        const dx = this.x - enemyX;
        const dy = this.y - enemyY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // 正規化して力を適用
            this.knockbackVelocityX = (dx / dist) * force;
            this.knockbackVelocityY = (dy / dist) * force;
            this.knockbackTimer = duration;
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
