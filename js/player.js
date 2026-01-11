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
        
        // Stats
        this.speed = GameConfig.PLAYER.SPEED;
        this.hp = GameConfig.PLAYER.STARTING_HP;
        this.maxHp = GameConfig.PLAYER.STARTING_HP;
        this.level = GameConfig.PLAYER.STARTING_LEVEL;
        this.exp = GameConfig.PLAYER.STARTING_EXP;
        this.nextLevelExp = GameConfig.PLAYER.INITIAL_NEXT_LEVEL_EXP;
        
        // Weapons
        this.weapons = [];
        this.addWeapon('knife'); // Start with knife
        this.addWeapon('bomb'); // Start with bomb
        
        // Movement state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Touch control state
        this.touchX = 0;
        this.touchY = 0;
        this.isTouching = false;
        
        // Setup input listeners
        this.setupInput();
    }
    
    setupInput() {
        // Keyboard controls
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
        
        // Touch controls
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
        
        // Mouse controls (same logic as touch)
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
        // Calculate movement direction
        let dx = 0;
        let dy = 0;
        
        // Touch controls take priority
        if (this.isTouching) {
            const touchDx = this.touchX - this.x;
            const touchDy = this.touchY - this.y;
            const distance = Math.sqrt(touchDx * touchDx + touchDy * touchDy);
            
            // Only move if touch is far enough from player
            if (distance > GameConfig.INPUT.TOUCH_MOVE_THRESHOLD) {
                dx = touchDx / distance;
                dy = touchDy / distance;
            }
        } else {
            // Keyboard controls
            if (this.keys.up) dy -= 1;
            if (this.keys.down) dy += 1;
            if (this.keys.left) dx -= 1;
            if (this.keys.right) dx += 1;
            
            // Normalize vector to prevent faster diagonal movement
            if (dx !== 0 || dy !== 0) {
                const length = Math.sqrt(dx * dx + dy * dy);
                dx = dx / length;
                dy = dy / length;
            }
        }
        
        // Apply speed
        dx *= this.speed;
        dy *= this.speed;
        
        // Scale by time scale (target 60fps)
        const timeScale = deltaTime / (1000/60);
        
        // Apply movement
        this.x += dx * timeScale;
        this.y += dy * timeScale;
        
        // Boundary checks
        this.x = Utils.Math.clamp(this.x, this.radius, this.game.width - this.radius);
        this.y = Utils.Math.clamp(this.y, this.radius, this.game.height - this.radius);
        
        this.updateWeapons(deltaTime);
    }
    
    addWeapon(type) {
        let weapon;
        // Check if already have it
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
            // Update HUD
            this.game.updateWeaponHUD(); 
        }
    }
    
    updateWeapons(deltaTime) {
        this.weapons.forEach(w => w.update(deltaTime));
    }
    
    render(ctx) {
        // Draw player body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Draw slight glow
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
            // Handle death in Game class
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
