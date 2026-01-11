/**
 * Game Utility Functions
 */

export const Utils = {
    // Vector Operations
    Vec2: {
        add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
        sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
        mul: (v, s) => ({ x: v.x * s, y: v.y * s }),
        div: (v, s) => ({ x: v.x / s, y: v.y / s }),
        mag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
        normalize: (v) => {
            const m = Math.sqrt(v.x * v.x + v.y * v.y);
            return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
        },
        dist: (v1, v2) => Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)),
        angle: (v1, v2) => Math.atan2(v2.y - v1.y, v2.x - v1.x)
    },

    // Collision Detection
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

    // Math Helpers
    Math: {
        lerp: (start, end, t) => start * (1 - t) + end * t,
        clamp: (val, min, max) => Math.min(Math.max(val, min), max),
        randRange: (min, max) => Math.random() * (max - min) + min,
        randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        degToRad: (deg) => deg * (Math.PI / 180),
        radToDeg: (rad) => rad * (180 / Math.PI)
    },

    // Random Color Generator
    Color: {
        randomPastel: () => {
            const h = Math.floor(Math.random() * 360);
            return `hsl(${h}, 70%, 80%)`;
        },
        randomBright: () => {
            const h = Math.floor(Math.random() * 360);
            return `hsl(${h}, 100%, 50%)`;
        }
    },

    // Time scaling helper (normalizes deltaTime to 60 FPS)
    getTimeScale: (deltaTime) => deltaTime / (1000 / 60),

    // Enemy utilities
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
