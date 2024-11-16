export class MatrixEffect {
    constructor(targetElement, options = {}) {
        this.targetElement = typeof targetElement === 'string' ? 
            document.querySelector(targetElement) : targetElement;
            
        this.options = {
            density: options.density || 0.05,
            speed: options.speed || 50,
            fontSize: options.fontSize || 14,
            fontFamily: options.fontFamily || 'monospace',
            characters: options.characters || '01',
            color: options.color || '#0F0',
            fadeLength: options.fadeLength || 0.8,
            mouseInteraction: options.mouseInteraction !== false,
            mouseRadius: options.mouseRadius || 150,
            mouseForce: options.mouseForce || 2,
            streams: [],
            ...options
        };
        
        this.mouse = {
            x: 0,
            y: 0,
            moving: false,
            lastMove: Date.now()
        };
        
        this.init();
    }

    init() {
        // Create and setup canvas
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('matrix-background');
        this.ctx = this.canvas.getContext('2d');
        
        // Insert canvas before target element
        this.targetElement.parentNode.insertBefore(this.canvas, this.targetElement);
        
        // Style canvas to cover target
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        
        this.setCanvasSize();
        this.createStreams();
        this.setupMouseTracking();
        
        window.addEventListener('resize', () => this.setCanvasSize());
        this.animate();
    }

    setupMouseTracking() {
        if (!this.options.mouseInteraction) return;
        
        this.targetElement.addEventListener('mousemove', (e) => {
            const rect = this.targetElement.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.moving = true;
            this.mouse.lastMove = Date.now();
        });

        this.targetElement.addEventListener('mouseleave', () => {
            this.mouse.moving = false;
        });
    }

    updateStreamWithMouse(stream) {
        if (!this.options.mouseInteraction || !this.mouse.moving) return;
        
        const dx = this.mouse.x - stream.x;
        const dy = this.mouse.y - stream.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.mouseRadius) {
            // Calculate intensity based on distance (closer = stronger effect)
            const intensity = 1 - (distance / this.options.mouseRadius);
            
            // Create a glowing effect with white core and custom color trail
            if (distance < this.options.mouseRadius * 0.2) {
                // Inner radius: white glow
                stream.color = `rgba(255, 255, 255, ${intensity})`;
                stream.speed = stream.baseSpeed * 2;
            } else {
                // Outer radius: color trail (cyan/blue effect)
                stream.color = `rgba(0, 255, 255, ${intensity})`;
                stream.speed = stream.baseSpeed * 1.5;
            }
            
            // Gradually return to original state
            if (Date.now() - this.mouse.lastMove > 100) {
                stream.color = undefined;
                stream.speed = stream.baseSpeed;
            }
        } else {
            stream.color = undefined;
            stream.speed = stream.baseSpeed;
        }
    }

    setCanvasSize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.width / this.options.fontSize);
        this.rows = Math.floor(this.height / this.options.fontSize);
        
        if (this.options.streams.length) {
            this.createStreams();
        }
    }

    createStreams() {
        this.options.streams = [];
        for (let x = 0; x < this.columns; x++) {
            if (Math.random() < this.options.density) {
                const baseX = x * this.options.fontSize;
                this.options.streams.push({
                    x: baseX,
                    baseX: baseX,
                    y: Math.random() * -100,
                    speed: 1 + Math.random() * 3,
                    baseSpeed: 1 + Math.random() * 3,
                    characters: [],
                    length: Math.floor(5 + Math.random() * 15)
                });
            }
        }
    }

    drawStream(stream) {
        // Update characters if needed
        while (stream.characters.length < stream.length) {
            stream.characters.push(this.options.characters.charAt(
                Math.floor(Math.random() * this.options.characters.length)
            ));
        }
        
        // Draw each character in the stream
        for (let i = 0; i < stream.characters.length; i++) {
            const y = stream.y - (i * this.options.fontSize);
            const alpha = 1 - (i / stream.length) * this.options.fadeLength;
            
            if (stream.color) {
                // Use full stream color for affected streams
                this.ctx.fillStyle = stream.color;
            } else {
                // Default matrix color with fade effect
                this.ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            }
            
            this.ctx.fillText(stream.characters[i], stream.x, y);
            
            // Increase character change rate near mouse
            if (stream.color && Math.random() < 0.3) {
                stream.characters[i] = this.options.characters.charAt(
                    Math.floor(Math.random() * this.options.characters.length)
                );
            }
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        
        // Update and draw streams
        this.options.streams.forEach(stream => {
            stream.y += stream.speed;
            this.drawStream(stream);
            
            // Reset stream if it's off screen
            if (stream.y - (stream.length * this.options.fontSize) > this.height) {
                stream.y = Math.random() * -100;
                stream.characters = [];
            }
        });
        
        // Add new streams occasionally
        if (Math.random() < 0.01 && this.options.streams.length < this.columns * this.options.density) {
            this.options.streams.push({
                x: Math.floor(Math.random() * this.columns) * this.options.fontSize,
                y: Math.random() * -100,
                speed: 1 + Math.random() * 3,
                characters: [],
                length: Math.floor(5 + Math.random() * 15)
            });
        }
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        window.removeEventListener('resize', () => this.setCanvasSize());
        this.canvas.remove();
    }
} 