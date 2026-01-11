export class UIManager {
    constructor(game) {
        this.game = game;
        this.screens = {
            start: document.getElementById('screen-start'),
            gameover: document.getElementById('screen-gameover'),
            levelup: document.getElementById('screen-levelup'),
            pause: document.getElementById('screen-pause')
        };
        
        this.hud = {
            level: document.getElementById('hud-level'),
            timer: document.getElementById('hud-timer'),
            kills: document.getElementById('hud-kills'),
            hpFill: document.getElementById('hud-hp-fill'),
            hpText: document.getElementById('hud-hp-text'),
            expFill: document.getElementById('hud-exp-fill'),
            weapons: document.getElementById('hud-weapons')
        };

        this.setupResultButtons();
    }
    
    setupResultButtons() {
        // 再スタートボタンはGameクラスで処理しているが、ここに移すこともできる
        // 既存コードとの一貫性のため、イベントリスナーはGame initに配置
    }

    showScreen(screenName) {
        // すべての画面を非表示
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        
        // 指定された画面を表示
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }
    
    hideAllScreens() {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
    }
    
    updateHUD() {
        if (!this.game.player) return;
        
        this.hud.level.textContent = `LV ${this.game.player.level}`;
        this.hud.timer.textContent = `${(this.game.gameTime/1000).toFixed(1)}s`;
        this.hud.kills.textContent = this.game.killCount;
        
        const hpPercent = Math.max(0, (this.game.player.hp / this.game.player.maxHp) * 100);
        this.hud.hpFill.style.width = `${hpPercent}%`;
        this.hud.hpText.textContent = `${Math.ceil(Math.max(0, this.game.player.hp))} / ${this.game.player.maxHp}`;
        
        const expPercent = (this.game.player.exp / this.game.player.nextLevelExp) * 100;
        this.hud.expFill.style.width = `${expPercent}%`;
    }
    
    updateWeaponSlots() {
        if (!this.game.player) return;
        
        const container = this.hud.weapons;
        container.innerHTML = '';
        this.game.player.weapons.forEach(w => {
            const el = document.createElement('div');
            el.className = 'weapon-icon';
            el.textContent = w.icon;
            el.title = `LV ${w.level} ${w.name}`;
            container.appendChild(el);
        });
    }
    
    showLevelUpOptions(options) {
        const container = document.getElementById('upgrade-container');
        container.innerHTML = '';
        
        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.onclick = () => {
                this.game.selectUpgrade(opt);
                this.hideAllScreens();
            };
            
            const icon = document.createElement('div');
            icon.className = 'upgrade-icon';
            icon.textContent = opt.icon;
            
            const title = document.createElement('div');
            title.className = 'upgrade-title';
            title.textContent = opt.isNew ? `NEW! ${opt.name}` : opt.name;
            
            const type = document.createElement('div');
            type.className = 'weapon-type';
            type.textContent = opt.type === 'weapon' ? 'WEAPON' : 'PASSIVE';
            
            const desc = document.createElement('div');
            desc.className = 'upgrade-desc';
            desc.textContent = opt.description;
            
            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(type);
            card.appendChild(desc);
            
            container.appendChild(card);
        });
        
        this.showScreen('levelup');
    }
    
    showGameOver(stats) {
        document.getElementById('result-time').textContent = stats.time;
        document.getElementById('result-level').textContent = stats.level;
        document.getElementById('result-kills').textContent = stats.kills;
        
        this.showScreen('gameover');
    }
}
