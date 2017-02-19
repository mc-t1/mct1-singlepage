function startBGL(options) {
    var speed = options.speed || undefined;
    var size = options.size || undefined;
    var color = options.color || undefined;
    var number = options.number || 100;

    // If no values return
    if (!speed || !size || !color) { return }

    console.log(`Speed: ${speed} Size: ${size} Color: ${color}`);

    var options = {
        selector: '#myCanvas',
        color: color,
        sizeVariations: size,
        speed: speed,
        maxParticles: number,
    };

    Particles.stop();
    setTimeout(function() {
        Particles.init( options ); 
    }, 100)
    
    // var numberOfParticles = 0;
    // if (Particles && Particles.storage && (Particles.storage.length === numberOfParticles)) {
    //     Particles.init( options ); 
    // }
};

function stopBGL() {
    Particles.stop();
}
