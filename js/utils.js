/**
 * ゲーム用ユーティリティ関数
 */

export const Utils = {
    // ベクトル演算
    Vec2: {
        add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }), // 加算
        sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }), // 減算
        mul: (v, s) => ({ x: v.x * s, y: v.y * s }), // スカラー倍
        div: (v, s) => ({ x: v.x / s, y: v.y / s }), // スカラー除算
        mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y), // 長さ（大きさ）
        normalize: (v) => { // 正規化（単位ベクトル化）
            const m = Math.sqrt(v.x * v.x + v.y * v.y);
            return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
        },
        dist: (v1, v2) => Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)), // 距離
        angle: (v1, v2) => Math.atan2(v2.y - v1.y, v2.x - v1.x) // 角度
    },

    // 衝突判定
    Collision: {
        circleCircle: (c1, c2) => {
            const dx = c1.x - c2.x;
            const dy = c1.y - c2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < c1.radius + c2.radius;
        },
        
        rectRect: (r1, r2) => {
            return r1.x < r2.x + r2.w &&
                   r1.x + r1.w > r2.x &&
                   r1.y < r2.y + r2.h &&
                   r1.y + r1.h > r2.y;
        },

        circleRect: (circle, rect) => {
            let testX = circle.x;
            let testY = circle.y;

            if (circle.x < rect.x) testX = rect.x;
            else if (circle.x > rect.x + rect.w) testX = rect.x + rect.w;

            if (circle.y < rect.y) testY = rect.y;
            else if (circle.y > rect.y + rect.h) testY = rect.y + rect.h;

            const distX = circle.x - testX;
            const distY = circle.y - testY;
            const distance = Math.sqrt(distX * distX + distY * distY);

            return distance <= circle.radius;
        }
    },

    // 数学ヘルパー関数
    Math: {
        lerp: (start, end, t) => start * (1 - t) + end * t, // 線形補間
        clamp: (val, min, max) => Math.min(Math.max(val, min), max), // 値を範囲内に制限
        randRange: (min, max) => Math.random() * (max - min) + min, // ランダムな小数
        randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min, // ランダムな整数
        degToRad: (deg) => deg * (Math.PI / 180), // 度数法からラジアンへ
        radToDeg: (rad) => rad * (180 / Math.PI) // ラジアンから度数法へ
    },

    // ランダムカラー生成
    Color: {
        randomPastel: () => { // パステルカラー
            const h = Math.floor(Math.random() * 360);
            return `hsl(${h}, 70%, 80%)`;
        },
        randomBright: () => { // 鮮やかな色
            const h = Math.floor(Math.random() * 360);
            return `hsl(${h}, 100%, 50%)`;
        }
    },

    // 時間スケールヘルパー（deltaTimeを60FPSに正規化）
    getTimeScale: (deltaTime) => deltaTime / (1000 / 60),

    // 敵関連のユーティリティ
    Enemy: {
        getNearestEnemy: (from, enemies, maxRange = Infinity) => {
            let nearest = null;
            let minDist = Infinity;
            
            enemies.forEach(e => {
                const d = Utils.Vec2.dist(from, e);
                if (d < minDist && d < maxRange) {
                    minDist = d;
                    nearest = e;
                }
            });
            
            return nearest;
        }
    }
};
