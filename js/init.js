import { Slideshow } from './slideshow.js';
import { VectorEffect } from './vectorEffect.js';
import { MatrixEffect } from './matrixEffect.js';
import { initFireEffect } from './fireEffect.js';


class AppController {
    constructor() {
        this.initializeEffects();
    }

    initializeEffects() {
        // Initialize slideshow
        this.slideshow = new Slideshow('.slideshow-container', {
            onComplete: () => {
                document.querySelector('.slideshow-container').classList.add('hidden');
                document.querySelector('.content-box').style.opacity = '1';
            }
        });

        // Initialize vector effect
        this.vectorEffect = new VectorEffect({
            element: document.querySelector('.logo'),
            vectorSpacing: 50,
            field: {
                density: 0.85,
                smoothing: 0.35,
                flowSpeed: 0.8,
                turbulence: 0.15,
                fadeSpeed: 0.92,
                reactivity: 0.75,
                coherence: 0.8
            },
            orbitalConfigs: [
                { angle: 0, radiusVw: 40, speed: 0.002, intensity: 1.2 },
                { angle: Math.PI * 0.2, radiusVw: 35, speed: 0.002, intensity: 1.0 },
                { angle: Math.PI * 0.4, radiusVw: 30, speed: 0.002, intensity: 1.1 },
                { angle: Math.PI * 0.6, radiusVw: 35, speed: 0.002, intensity: 1.3 },
                { angle: Math.PI * 0.8, radiusVw: 40, speed: 0.002, intensity: 0.9 },
                { angle: Math.PI, radiusVw: 35, speed: 0.002, intensity: 1.4 },
                { angle: Math.PI * 1.2, radiusVw: 30, speed: 0.002, intensity: 0.8 }
            ]
        });

        // Initialize matrix effect
        this.matrixEffect = new MatrixEffect('.content-box', {
            density: 0.5,
            speed: 100,
            fontSize: 18,
            characters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
            color: '#0F0',
            fadeLength: 0.7,
            mouseInteraction: true,
            mouseRadius: 150,
            mouseForce: 2.5
        });

        document.body.appendChild(this.matrixEffect.canvas);

        initFireEffect();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});