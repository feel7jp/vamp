import { Utils } from './utils.js';
import { Knife, Garlic } from './weapon.js';
import { Bomb } from './bomb.js';

export class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = '#4facfe'; // Cyan blue
        
        // Stats
        this.speed = 3; // Pixels per frame
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.exp = 0;
        this.nextLevelExp = 100;
        
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
        
        // Setup input listeners
        this.setupInput();
    }
    
    setupInput() {
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
        
        // Basic touch controls (simple tap-to-move-towards could be added here, 
        // or a virtual joystick. For now, we'll rely on keyboard)
    }
    
    update(deltaTime) {
        // Calculate movement direction
        let dx = 0;
        let dy = 0;
        
        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;
        
        // Normalize vector to prevent faster diagonal movement
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx = dx / length * this.speed;
            dy = dy / length * this.speed;
        }
        
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
        this.nextLevelExp = Math.floor(this.nextLevelExp * 1.5);
        this.game.triggerLevelUp();
    }
}
