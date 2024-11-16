import { Slideshow } from './slideshow.js';
import { VectorEffect } from './vectorEffect.js';
import { MatrixEffect } from './matrixEffect.js';

document.addEventListener('DOMContentLoaded', () => {
    const slideshow = new Slideshow('.slideshow-container', {
        onComplete: () => {
            document.querySelector('.slideshow-container').classList.add('hidden');
            document.querySelector('.content-box').style.opacity = '1';
        }
    });

    // Initialize vector effect for logo
    const vectorEffect = new VectorEffect({
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

    // Initialize matrix effect for content box
    const matrixEffect = new MatrixEffect('.content-box', {
        density: 0.03,
        speed: 50,
        fontSize: 16,
        characters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
        color: '#0F0',
        fadeLength: 0.85,
        mouseInteraction: true,
        mouseRadius: 150,
        mouseForce: 2.5
    });

    document.body.appendChild(matrixEffect.canvas);

    // Language switcher setup
    const content = {
        en: {
            title: "TARO RETURNS",
            tagline: "In the neon-drenched shadows of 2086, a legend emerges. TARO, the RADICAL86 ERC20 token, breaks through time itself to reshape our digital destiny. Not just another token - a cyberpunk revolution in code.",
            joinResistance: "JOIN THE RESISTANCE",
            enterGrid: "ENTER THE GRID ↗",
            switchLang: "日本語"
        },
        ja: {
            title: "タロー リターンズ",
            tagline: "2086年のネオンに染まる影から、伝説が目覚める。RADICAL86 ERC20トークン「タロー」が、時間を超えてデジタルの運命を作り変える。ただのトークンではない - コードによるサイバーパンク革命。",
            joinResistance: "レジスタンスに参加",
            enterGrid: "グリッドに入る ↗",
            switchLang: "English"
        }
    };

    let currentLang = 'en';

    function toggleLanguage() {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        const lang = content[currentLang];
        
        // Update content
        document.querySelector('h1').textContent = lang.title;
        document.querySelector('.tagline').textContent = lang.tagline;
        
        // Update buttons
        const buttons = document.querySelectorAll('.cta-button');
        buttons[0].textContent = lang.joinResistance;
        buttons[1].textContent = lang.enterGrid;
        
        // Update language switch button
        document.querySelector('.lang-switch').textContent = lang.switchLang;
        
        // Update document direction and font
        document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.body.style.fontFamily = currentLang === 'ar' ? 
            'Noto Sans Arabic, Unbounded, sans-serif' :
            'Unbounded, sans-serif';
    }

    // Add language switch listener
    document.querySelector('.lang-switch').addEventListener('click', toggleLanguage);
});