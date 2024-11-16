export class StarField {
    constructor(options = {}) {
        this.options = {
            starCount: options.starCount || 200,
            shootingStarInterval: options.shootingStarInterval || 8000,
            baseStarSize: options.baseStarSize || 2,
            shootingStarSize: options.shootingStarSize || 3,
            shootingStarSpeed: options.shootingStarSpeed || 15,
            starColors: options.starColors || ['#ffffff', '#ffe9c4', '#d4fbff'],
            ...options
        };

        this.init();
    }

    init() {
        this.canvas = document.querySelector('.starfield');
        this.ctx = this.canvas.getContext('2d');
        
        this.setCanvasSize();
        this.createStars();
        
        this.shootingStars = [];
        this.lastShootingStar = Date.now();
        
        window.addEventListener('resize', () => this.setCanvasSize());
        this.animate();
    }

    setCanvasSize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        
        // Regenerate stars on resize for better distribution
        if (this.stars) {
            this.createStars();
        }
    }

    createStars() {
        this.stars = Array.from({ length: this.options.starCount }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * this.options.baseStarSize + 0.5,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.04,
            opacity: Math.random() * 0.5 + 0.5,
            color: this.options.starColors[
                Math.floor(Math.random() * this.options.starColors.length)
            ]
        }));
    }

    createShootingStar() {
        const angle = 30 + Math.random() * 30; // Angle between 30 and 60 degrees
        return {
            x: Math.random() * this.width,
            y: this.height,
            length: 100 + Math.random() * 100,
            angle: angle,
            speed: this.options.shootingStarSpeed + Math.random() * 10,
            opacity: 1,
            fadeSpeed: 0.01 + Math.random() * 0.02
        };
    }

    drawStar(star) {
        const opacity = Math.sin(star.phase) * star.opacity;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = star.color.replace(')', `, ${opacity})`);
        this.ctx.fill();
    }

    drawShootingStar(star) {
        const radians = star.angle * Math.PI / 180;
        
        // Create gradient for the shooting star trail
        const gradient = this.ctx.createLinearGradient(
            star.x, star.y,
            star.x - Math.cos(radians) * star.length,
            star.y + Math.sin(radians) * star.length
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.options.shootingStarSize;
        this.ctx.lineCap = 'round';
        
        this.ctx.moveTo(star.x, star.y);
        this.ctx.lineTo(
            star.x - Math.cos(radians) * star.length,
            star.y + Math.sin(radians) * star.length
        );
        
        this.ctx.stroke();
        
        // Draw fire particles
        this.drawFireParticles(star, radians);
    }

    drawFireParticles(star, radians) {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const spread = (Math.random() - 0.5) * 30;
            const distance = Math.random() * star.length * 0.5;
            
            const particleX = star.x - Math.cos(radians) * distance + 
                            Math.cos(radians + Math.PI/2) * spread;
            const particleY = star.y + Math.sin(radians) * distance + 
                            Math.sin(radians + Math.PI/2) * spread;
            
            const size = Math.random() * 2 + 1;
            const opacity = (1 - distance/star.length) * star.opacity * Math.random();
            
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, ${Math.random() * 150}, 0, ${opacity})`;
            this.ctx.fill();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update and draw regular stars
        this.stars.forEach(star => {
            star.phase += star.speed;
            this.drawStar(star);
            
            // Randomly reposition stars that are nearly invisible
            if (Math.sin(star.phase) < -0.95 && Math.random() < 0.1) {
                star.x = Math.random() * this.width;
                star.y = Math.random() * this.height;
                star.phase = 0;
            }
        });

        // Check if we should create a new shooting star
        const now = Date.now();
        if (now - this.lastShootingStar > this.options.shootingStarInterval && 
            Math.random() < 0.1) {
            this.shootingStars.push(this.createShootingStar());
            this.lastShootingStar = now;
        }

        // Update and draw shooting stars
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += Math.cos(star.angle * Math.PI / 180) * star.speed;
            star.y -= Math.sin(star.angle * Math.PI / 180) * star.speed;
            
            // Apply custom fade speed with easing
            star.opacity = Math.max(0, star.opacity - 
                (star.fadeSpeed * (1 - star.opacity * 0.5)));
            
            this.drawShootingStar(star);
            
            // Keep star if it's still visible and on screen
            return star.opacity > 0.01 && 
                   star.x > -100 && star.x < this.width + 100 &&
                   star.y > -100 && star.y < this.height + 100;
        });
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        // Cleanup method if needed
        window.removeEventListener('resize', () => this.setCanvasSize());
    }
}