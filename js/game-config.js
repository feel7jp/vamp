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
      COLOR: '#bbe070ff'
    },
    FAST: {
      WIDTH: 15,
      HEIGHT: 15,
      SPEED: 5.0,
      HP: 50,
      DAMAGE: 1,
      EXP_VALUE: 10,
      COLOR: '#a7e8e7ff'
    },
    TANK: {
      WIDTH: 50,
      HEIGHT: 50,
      SPEED: 1.0,
      HP: 300,
      DAMAGE: 10,
      EXP_VALUE: 200,
      COLOR: '#9d0a0aff' 
    },
    BOSS: {
      WIDTH: 80,
      HEIGHT: 80,
      SPEED: 4.0,
      HP: 1000,
      DAMAGE: 10,
      EXP_VALUE: 1000,
      COLOR: '#8e44ad' 
    }
  },
  
  // 武器の設定
  WEAPONS: {
    KNIFE: {
      ID: 'knife',
      NAME: 'Knife',
      NAME_JP: 'ナイフ',
      DESCRIPTION_JP: '最も近い敵にナイフを投げる。レベルアップで投げる数が増える。',
      ICON: '🔪',
      BASE_DAMAGE: 10,
      BASE_COOLDOWN: 300, // ミリ秒
      PROJECTILE_SPEED: 10,
      PROJECTILE_LIFE: 1000, // ミリ秒
      STARTING_AMOUNT: 1,
      PROJECTILE_RADIUS: 5,
      COLOR: 'rgba(200, 164, 130, 1)'
    },
    GARLIC: {
      ID: 'garlic',
      NAME: 'Garlic',
      NAME_JP: 'ガーリック',
      DESCRIPTION_JP: '周囲の敵に継続的にダメージを与える。レベルアップで範囲が広がる。',
      ICON: '🧄',
      BASE_DAMAGE: 100,
      BASE_COOLDOWN: 1000, // ミリ秒（ティックレート）
      STARTING_RANGE: 60,
      TICK_RATE: 1000, // ミリ秒（ダメージ間隔）
      COLOR: 'rgba(255, 100, 100, 0.1)'
    },
    BOMB: {
      ID: 'bomb',
      NAME: 'Bomb',
      NAME_JP: 'ボム',
      DESCRIPTION_JP: '一定時間後に爆発する爆弾を投げる。広範囲にダメージを与える。',
      ICON: '💣',
      BASE_DAMAGE: 500,
      BASE_COOLDOWN: 3000, // ミリ秒
      PROJECTILE_SPEED: 3,
      FUSE_TIME: 1000, // ミリ秒
      EXPLOSION_RADIUS: 100,
      PROJECTILE_SIZE: 8,
      COLOR: '#8a8585ff'
    }
  },
  
  // ゲームバランスの調整
  BALANCE: {
    DIFFICULTY_INCREASE_PER_MINUTE: 0.1,
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
    
    // ノックバック
    NORMAL_KNOCKBACK_FORCE: 50,  // 通常敵のノックバック力
    BOSS_KNOCKBACK_FORCE: 200,   // ボスのノックバック力
    KNOCKBACK_DURATION: 100,    // ノックバック持続時間（ミリ秒）
    
    // パーティクル
    PARTICLE_LIFETIME: 1000, // ミリ秒
    DAMAGE_NUMBER_LIFETIME: 1000, // ミリ秒
    EXP_ORB_LIFETIME: 30000, // ミリ秒（30秒）
    EXP_ORB_COLLECTION_RADIUS: 30,
    EXP_ORB_ATTRACT_RADIUS: 150,
    EXP_ORB_ATTRACT_SPEED: 3,
    
    // エフェクト
    SCREEN_SHAKE_INTENSITY: 5,
    SCREEN_SHAKE_DURATION: 200, // ミリ秒
    BOSS_SCREEN_SHAKE_INTENSITY: 10,
    BOSS_SCREEN_SHAKE_DURATION: 500, // ミリ秒
    
    // 爆発
    EXPLOSION_LIFETIME: 500, // ミリ秒
    EXPLOSION_PARTICLE_COUNT: 100
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
