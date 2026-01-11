/**
 * Game Configuration
 * All game constants and balance settings in one place
 */

export const GameConfig = {
  // Player settings
  PLAYER: {
    RADIUS: 15,
    SPEED: 3,
    STARTING_HP: 100,
    COLOR: '#4facfe', // Cyan blue
    STARTING_LEVEL: 1,
    STARTING_EXP: 0,
    INITIAL_NEXT_LEVEL_EXP: 100,
    EXP_SCALING_FACTOR: 1.5
  },
  
  // Enemy settings
  ENEMY: {
    NORMAL: {
      WIDTH: 20,
      HEIGHT: 20,
      SPEED: 1.5,
      HP: 10,
      DAMAGE: 10,
      EXP_VALUE: 10,
      COLOR: '#ff4757' // Red
    },
    FAST: {
      WIDTH: 15,
      HEIGHT: 15,
      SPEED: 2.5,
      HP: 5,
      DAMAGE: 10,
      EXP_VALUE: 10,
      COLOR: '#ffd700' // Gold/Yellow
    },
    TANK: {
      WIDTH: 30,
      HEIGHT: 30,
      SPEED: 1.0,
      HP: 30,
      DAMAGE: 10,
      EXP_VALUE: 30,
      COLOR: '#2ed573' // Green
    },
    BOSS: {
      WIDTH: 80,
      HEIGHT: 80,
      SPEED: 2.0,
      HP: 500,
      DAMAGE: 25,
      EXP_VALUE: 1000,
      COLOR: '#8e44ad' // Purple
    }
  },
  
  // Weapon settings
  WEAPONS: {
    KNIFE: {
      ID: 'knife',
      NAME: 'Knife',
      ICON: '🔪',
      BASE_DAMAGE: 10,
      BASE_COOLDOWN: 300, // ms
      PROJECTILE_SPEED: 10,
      PROJECTILE_LIFE: 1000, // ms
      STARTING_AMOUNT: 1,
      PROJECTILE_RADIUS: 5,
      COLOR: '#f0f'
    },
    GARLIC: {
      ID: 'garlic',
      NAME: 'Garlic',
      ICON: '🧄',
      BASE_DAMAGE: 3,
      BASE_COOLDOWN: 100, // ms (tick rate)
      STARTING_RANGE: 60,
      TICK_RATE: 200, // ms (damage interval)
      COLOR: 'rgba(255, 100, 100, 0.1)'
    },
    BOMB: {
      ID: 'bomb',
      NAME: 'Bomb',
      ICON: '💣',
      BASE_DAMAGE: 20,
      BASE_COOLDOWN: 5000, // ms
      PROJECTILE_SPEED: 3,
      FUSE_TIME: 2000, // ms
      EXPLOSION_RADIUS: 100,
      PROJECTILE_SIZE: 8,
      COLOR: '#333'
    }
  },
  
  // Game balance
  BALANCE: {
    DIFFICULTY_INCREASE_PER_MINUTE: 0.2,
    BOSS_SPAWN_TIME: 60000, // ms (1 minute)
    SPAWN_INTERVAL: 1000, // ms
    SPAWN_INTERVAL_DECREASE_RATE: 0.95, // Multiplier per level
    MIN_SPAWN_INTERVAL: 200, // ms
    ENEMY_SPAWN_DISTANCE: 100, // pixels from edge
    
    // Level up
    WEAPON_LEVEL_KNIFE_AMOUNT_INTERVAL: 2, // +1 knife every 2 levels
    WEAPON_LEVEL_COOLDOWN_MULTIPLIER: 0.9,
    WEAPON_LEVEL_DAMAGE_MULTIPLIER: 1.2,
    WEAPON_LEVEL_GARLIC_RANGE_MULTIPLIER: 1.2,
    WEAPON_LEVEL_GARLIC_DAMAGE_INCREASE: 1,
    
    // Particles
    PARTICLE_LIFETIME: 1000, // ms
    DAMAGE_NUMBER_LIFETIME: 1000, // ms
    EXP_ORB_LIFETIME: 30000, // ms (30 seconds)
    EXP_ORB_COLLECTION_RADIUS: 30,
    EXP_ORB_ATTRACT_RADIUS: 150,
    EXP_ORB_ATTRACT_SPEED: 0.1,
    
    // Effects
    SCREEN_SHAKE_INTENSITY: 5,
    SCREEN_SHAKE_DURATION: 200, // ms
    BOSS_SCREEN_SHAKE_INTENSITY: 10,
    BOSS_SCREEN_SHAKE_DURATION: 500, // ms
    
    // Explosions
    EXPLOSION_LIFETIME: 500, // ms
    EXPLOSION_PARTICLE_COUNT: 20
  },
  
  // Visual
  VISUAL: {
    GRID_SIZE: 50,
    GRID_COLOR: 'rgba(255, 255, 255, 0.05)',
    GRID_LINE_WIDTH: 1
  },
  
  // Input
  INPUT: {
    TOUCH_MOVE_THRESHOLD: 30 // pixels
  },
  
  // Frame rate
  TIMING: {
    TARGET_FPS: 60,
    TARGET_FRAME_TIME: 1000 / 60 // ~16.67ms
  }
};
