export class VectorEffect {
    constructor(options = {}) {
        this.options = {
            vectorSpacing: options.vectorSpacing || 50,
            influenceRadius: window.innerWidth * 0.05,
            vectorFieldStrength: 2.5,
            field: {
                density: options.field?.density || 0.85,
                smoothing: options.field?.smoothing || 0.35,
                flowSpeed: options.field?.flowSpeed || 0.8,
                turbulence: options.field?.turbulence || 0.15,
                fadeSpeed: options.field?.fadeSpeed || 0.92,
                reactivity: options.field?.reactivity || 0.75,
                coherence: options.field?.coherence || 0.8
            }
        };

        this.svg = document.querySelector('.logo');
        this.path = this.svg.querySelector('path');
        this.mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
        this.isMouseMoving = false;
        this.mouseTimeout = null;
        this.vectorPoints = [];
        this.pathLength = 0;
        this.defs = null;
        this.gradient = null;

        // Orbital system configuration
        this.orbitalSystems = [
            { angle: 0, radius: 40, speed: 0.002, intensity: 1.2 },
            { angle: Math.PI * 0.3, radius: 35, speed: 0.0015, intensity: 1.0 },
            { angle: Math.PI * 0.6, radius: 30, speed: 0.0018, intensity: 0.9 },
            { angle: Math.PI * 0.9, radius: 35, speed: 0.0012, intensity: 1.1 }
        ].map(orbit => ({
            ...orbit,
            radius: (window.innerWidth * orbit.radius) / 100,
            centerX: window.innerWidth / 2,
            centerY: window.innerHeight / 2
        }));

        this.init();
    }

    init() {
        this.pathLength = this.path.getTotalLength();
        this.generateVectorField();
        this.setupEventListeners();
        this.setupGradient();
        requestAnimationFrame(this.animate.bind(this));
    }

    generateVectorField() {
        this.vectorPoints = [];
        let distance = 0;
        
        while (distance <= this.pathLength) {
            const point = this.path.getPointAtLength(distance);
            const tangent = this.getTangent(distance);
            
            this.vectorPoints.push({
                x: point.x,
                y: point.y,
                baseX: point.x,
                baseY: point.y,
                tangentX: tangent.x,
                tangentY: tangent.y,
                influence: 0.1,
                flow: Math.random() * Math.PI * 2
            });
            
            distance += this.options.vectorSpacing;
        }
    }

    getTangent(distance) {
        const delta = 0.1;
        const p1 = this.path.getPointAtLength(Math.max(0, distance - delta));
        const p2 = this.path.getPointAtLength(Math.min(this.pathLength, distance + delta));
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        return { x: dx / len, y: dy / len };
    }

    setupGradient() {
        this.defs = this.svg.querySelector('defs') || 
                    this.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), 
                    this.svg.firstChild);
        
        this.gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        this.gradient.id = 'vectorGradient';
        this.gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        
        const bbox = this.path.getBBox();
        this.gradient.setAttribute('x1', bbox.x);
        this.gradient.setAttribute('y1', bbox.y);
        this.gradient.setAttribute('x2', bbox.x + bbox.width);
        this.gradient.setAttribute('y2', bbox.y + bbox.height);
        
        this.defs.appendChild(this.gradient);
        this.path.style.stroke = 'url(#vectorGradient)';
    }

    setupEventListeners() {
        let rafId = null;
        document.addEventListener('mousemove', (e) => {
            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    this.mouse = { x: e.clientX, y: e.clientY };
                    this.isMouseMoving = true;
                    rafId = null;
                    
                    clearTimeout(this.mouseTimeout);
                    this.mouseTimeout = setTimeout(() => this.isMouseMoving = false, 100);
                });
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.options.influenceRadius = window.innerWidth * 0.05;
            this.updateOrbitalSystems();
            this.generateVectorField();
        }, { passive: true });
    }

    updateVectorField() {
        const matrix = this.svg.getScreenCTM();
        const point = this.svg.createSVGPoint();

        this.vectorPoints.forEach(vector => {
            point.x = vector.x;
            point.y = vector.y;
            const screenPoint = point.matrixTransform(matrix);
            
            let totalInfluence = 0;
            
            // Calculate orbital influences
            this.orbitalSystems.forEach(orbit => {
                const dx = orbit.centerX + Math.cos(orbit.angle) * orbit.radius - screenPoint.x;
                const dy = orbit.centerY + Math.sin(orbit.angle) * orbit.radius - screenPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.influenceRadius) {
                    totalInfluence += (1 - distance / this.options.influenceRadius) * orbit.intensity;
                }
            });

            // Add mouse influence
            if (this.isMouseMoving) {
                const dx = this.mouse.x - screenPoint.x;
                const dy = this.mouse.y - screenPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.influenceRadius) {
                    totalInfluence += (1 - distance / this.options.influenceRadius) * 1.5;
                }
            }

            // Update vector properties
            vector.influence = Math.max(0.1, 
                vector.influence * this.options.field.fadeSpeed + 
                totalInfluence * this.options.vectorFieldStrength
            );
            
            vector.flow += (Math.random() - 0.5) * this.options.field.turbulence;
        });

        this.updateGradient();
    }

    updateGradient() {
        while (this.gradient.children.length < this.vectorPoints.length) {
            this.gradient.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'stop'));
        }

        this.vectorPoints.forEach((vector, i) => {
            const intensity = vector.influence * (Math.cos(vector.flow) * 0.5 + 0.5);
            const alpha = Math.min(1, intensity * 0.8);
            const rgb = Math.min(255, Math.floor(255 * intensity));
            
            const stop = this.gradient.children[i];
            stop.setAttribute('offset', (i / (this.vectorPoints.length - 1) * 100) + '%');
            stop.setAttribute('stop-color', `rgba(${rgb}, ${rgb}, ${rgb}, ${alpha})`);
        });
    }

    updateOrbitalSystems() {
        this.orbitalSystems.forEach(orbit => {
            orbit.angle += orbit.speed;
            orbit.radius = (window.innerWidth * orbit.radius) / 100;
            orbit.centerX = window.innerWidth / 2;
            orbit.centerY = window.innerHeight / 2;
        });
    }

    animate() {
        this.updateOrbitalSystems();
        this.updateVectorField();
        requestAnimationFrame(this.animate.bind(this));
    }
}