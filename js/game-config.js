/**
 * ゲーム設定
 * すべてのゲーム定数とバランス設定を1箇所にまとめる
 */

export const GameConfig = {
  // プレイヤーの設定
  PLAYER: {
    RADIUS: 15,
    SPEED: 3,
    STARTING_HP: 100,
    COLOR: '#4facfe', // シアンブルー
    STARTING_LEVEL: 1,
    STARTING_EXP: 0,
    INITIAL_NEXT_LEVEL_EXP: 100,
    EXP_SCALING_FACTOR: 1.5
  },
  
  // 敵の設定
  ENEMY: {
    NORMAL: {
      WIDTH: 20,
      HEIGHT: 20,
      SPEED: 1.5,
      HP: 10,
      DAMAGE: 10,
      EXP_VALUE: 10,
      COLOR: '#ff4757' // 赤
    },
    FAST: {
      WIDTH: 15,
      HEIGHT: 15,
      SPEED: 2.5,
      HP: 5,
      DAMAGE: 10,
      EXP_VALUE: 10,
      COLOR: '#ffd700' // 金/黄
    },
    TANK: {
      WIDTH: 30,
      HEIGHT: 30,
      SPEED: 1.0,
      HP: 30,
      DAMAGE: 10,
      EXP_VALUE: 30,
      COLOR: '#2ed573' // 緑
    },
    BOSS: {
      WIDTH: 80,
      HEIGHT: 80,
      SPEED: 2.0,
      HP: 500,
      DAMAGE: 25,
      EXP_VALUE: 1000,
      COLOR: '#8e44ad' // 紫
    }
  },
  
  // 武器の設定
  WEAPONS: {
    KNIFE: {
      ID: 'knife',
      NAME: 'Knife',
      ICON: '🔪',
      BASE_DAMAGE: 10,
      BASE_COOLDOWN: 300, // ミリ秒
      PROJECTILE_SPEED: 10,
      PROJECTILE_LIFE: 1000, // ミリ秒
      STARTING_AMOUNT: 1,
      PROJECTILE_RADIUS: 5,
      COLOR: '#f0f'
    },
    GARLIC: {
      ID: 'garlic',
      NAME: 'Garlic',
      ICON: '🧄',
      BASE_DAMAGE: 0.3, // 元の威力の1/10に調整
      BASE_COOLDOWN: 100, // ミリ秒（ティックレート）
      STARTING_RANGE: 60,
      TICK_RATE: 200, // ミリ秒（ダメージ間隔）
      COLOR: 'rgba(255, 100, 100, 0.1)'
    },
    BOMB: {
      ID: 'bomb',
      NAME: 'Bomb',
      ICON: '💣',
      BASE_DAMAGE: 20,
      BASE_COOLDOWN: 5000, // ミリ秒
      PROJECTILE_SPEED: 3,
      FUSE_TIME: 2000, // ミリ秒
      EXPLOSION_RADIUS: 100,
      PROJECTILE_SIZE: 8,
      COLOR: '#333'
    }
  },
  
  // ゲームバランスの調整
  BALANCE: {
    DIFFICULTY_INCREASE_PER_MINUTE: 0.2,
    BOSS_SPAWN_TIME: 60000, // ミリ秒（1分）
    SPAWN_INTERVAL: 1000, // ミリ秒
    SPAWN_INTERVAL_DECREASE_RATE: 0.95, // レベルごとの減少率
    MIN_SPAWN_INTERVAL: 200, // ミリ秒
    ENEMY_SPAWN_DISTANCE: 100, // 画面端からのピクセル数
    
    // レベルアップ
    WEAPON_LEVEL_KNIFE_AMOUNT_INTERVAL: 2, // 2レベル毎にナイフ+1
    WEAPON_LEVEL_COOLDOWN_MULTIPLIER: 0.9,
    WEAPON_LEVEL_DAMAGE_MULTIPLIER: 1.2,
    WEAPON_LEVEL_GARLIC_RANGE_MULTIPLIER: 1.2,
    WEAPON_LEVEL_GARLIC_DAMAGE_INCREASE: 1,
    
    // パーティクル
    PARTICLE_LIFETIME: 1000, // ミリ秒
    DAMAGE_NUMBER_LIFETIME: 1000, // ミリ秒
    EXP_ORB_LIFETIME: 30000, // ミリ秒（30秒）
    EXP_ORB_COLLECTION_RADIUS: 30,
    EXP_ORB_ATTRACT_RADIUS: 150,
    EXP_ORB_ATTRACT_SPEED: 0.1,
    
    // エフェクト
    SCREEN_SHAKE_INTENSITY: 5,
    SCREEN_SHAKE_DURATION: 200, // ミリ秒
    BOSS_SCREEN_SHAKE_INTENSITY: 10,
    BOSS_SCREEN_SHAKE_DURATION: 500, // ミリ秒
    
    // 爆発
    EXPLOSION_LIFETIME: 500, // ミリ秒
    EXPLOSION_PARTICLE_COUNT: 20
  },
  
  // ビジュアル
  VISUAL: {
    GRID_SIZE: 50,
    GRID_COLOR: 'rgba(255, 255, 255, 0.05)',
    GRID_LINE_WIDTH: 1
  },
  
  // 入力
  INPUT: {
    TOUCH_MOVE_THRESHOLD: 30 // ピクセル
  },
  
  // 拾えるアイテムの設定（経験値オーブ、体力パックなど）
  PICKUP: {
    MAGNET_RANGE: 80 // 自動回収距離
  },
  
  // フレームレート
  TIMING: {
    TARGET_FPS: 60,
    TARGET_FRAME_TIME: 1000 / 60 // 約16.67ミリ秒
  }
};
