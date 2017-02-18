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
    var numberOfParticles = 0;

    if (Particles && Particles.storage && (Particles.storage.length === numberOfParticles)) {
        Particles.init( setOptions ); 
    }
};

function stopBGL() {
    Particles.stop();
}
