function startBGL(options) {
    var defaults = {
        selector: '#myCanvas',
        color: '#0f9976',
        connectParticles: false,
        sizeVariations: 5,
        speed: 0.5,
        maxParticles: 100,
    };

    var setOptions = options || defaults;

    Particles.init( setOptions );
};

function stopBGL() {
    Particles.stop();
}
