export function initFireEffect() {
    const logoPath = document.querySelector('.logo-path');
    const slideTexts = document.querySelectorAll('.slide-text');
    let time = 0;
    let opacity = 0;
    let fadeComplete = false;

    // Add initial styles
    logoPath.style.filter = 'url(#fire)';
    logoPath.style.fill = '#ff4d00';
    
    // Set initial opacity for slide texts
    slideTexts.forEach(text => {
        text.style.opacity = '0';
    });
    
    function animate() {
        time += 0.01;
        
        // Handle fade in
        if (!fadeComplete) {
            opacity = Math.min(opacity + 0.02, 1);
            if (opacity >= 1) fadeComplete = true;
        }
        
        // Update the fire colors
        const hue = (Math.sin(time) * 10) + 15;
        const lightness = 50 + (Math.sin(time * 2) * 10);
        const color = `hsl(${hue}, 100%, ${lightness}%)`;
        
        // Apply to logo
        logoPath.style.fill = color;
        
        // Apply to slide texts with opacity
        slideTexts.forEach(text => {
            text.style.color = color;
            text.style.opacity = opacity.toString();
        });

        // Update the turbulence filter
        const turbulence = document.querySelector('feTurbulence');
        turbulence.setAttribute('baseFrequency', `${0.02 + Math.sin(time) * 0.01} ${0.02 + Math.cos(time) * 0.01}`);

        requestAnimationFrame(animate);
    }

    animate();
} 