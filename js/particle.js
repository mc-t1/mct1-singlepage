function startPart() {
    console.log("Loading particles..");
    $( ".particle-canvas" ).html('');
    $( ".particle-canvas" ).html('<canvas id="myCanvas"></canvas>');
    Particles.init({
        selector: '#myCanvas',
        color: '#0f9976',
        connectParticles: false,
        sizeVariations: 10,
        speed: 2,
        maxParticles: 500,
    });
};
