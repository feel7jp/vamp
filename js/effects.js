import { Utils } from './utils.js';

export class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.x = 0;
        this.y = 0;
    }

    trigger(intensity, duration) {
        this.intensity = intensity;
        this.duration = duration;
    }

    update(deltaTime) {
        if (this.duration > 0) {
            this.duration -= deltaTime;
            const currentIntensity = this.intensity * (this.duration / 500); // Fade out
            
            this.x = Utils.Math.randRange(-currentIntensity, currentIntensity);
            this.y = Utils.Math.randRange(-currentIntensity, currentIntensity);
            
            if (this.duration <= 0) {
                this.x = 0;
                this.y = 0;
            }
        }
    }
}
