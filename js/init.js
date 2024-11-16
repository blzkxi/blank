import { Slideshow } from './slideshow.js';
import { VectorEffect } from './vectorEffect.js';
import { MatrixEffect } from './matrixEffect.js';

// Language content configuration
const content = {
    en: {
        slides: [
            "TARO RETURNS",
            "FROM THE CYBER WASTES OF 2086",
            "A RADICAL86 LEGEND REBORN",
            "THE FUTURE OF ERC20 IS HERE",
            "JOIN THE RESISTANCE"
        ],
        main: {
            title: "TARO RETURNS",
            tagline: "In the neon-drenched shadows of 2086, a legend emerges. TARO, the RADICAL86 ERC20 token, breaks through time itself to reshape our digital destiny. Not just another token - a cyberpunk revolution in code.",
            joinResistance: "JOIN THE RESISTANCE",
            enterGrid: "ENTER THE GRID ↗",
            switchLang: "日本語"
        }
    },
    ja: {
        slides: [
            "タロー リターンズ",
            "2086年のサイバー荒野から",
            "RADICAL86の伝説が蘇る",
            "ERC20の未来、ここに",
            "レジスタンスに参加せよ"
        ],
        main: {
            title: "タロー リターンズ",
            tagline: "2086年のネオンに染まる影から、伝説が目覚める。RADICAL86 ERC20トークン「タロー」が、時間を超えてデジタルの運命を作り変える。ただのトークンではない - コードによるサイバーパンク革命。",
            joinResistance: "レジスタンスに参加",
            enterGrid: "グリッドに入る ↗",
            switchLang: "English"
        }
    }
};

class AppController {
    constructor() {
        this.currentLang = 'en';
        this.initializeEffects();
        this.setupLanguageSwitcher();
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
    }

    setupLanguageSwitcher() {
        document.querySelector('.lang-switch').addEventListener('click', () => {
            this.toggleLanguage();
        });
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'ja' : 'en';
        const lang = content[this.currentLang].main;
        
        // Update content
        document.querySelector('h1').textContent = lang.title;
        document.querySelector('.tagline').textContent = lang.tagline;
        
        // Update buttons
        const buttons = document.querySelectorAll('.cta-button');
        buttons[0].textContent = lang.joinResistance;
        buttons[1].textContent = lang.enterGrid;
        
        // Update language switch button
        document.querySelector('.lang-switch').textContent = lang.switchLang;
        
        // Update slideshow text if visible
        if (!document.querySelector('.slideshow-container').classList.contains('hidden')) {
            this.updateSlideText();
        }
    }

    updateSlideText() {
        const slides = content[this.currentLang].slides;
        document.querySelectorAll('.slide-text').forEach((element, index) => {
            element.textContent = slides[index];
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});