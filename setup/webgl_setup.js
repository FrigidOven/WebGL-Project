var canvasRect;
var canvasX;
var canvasY;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl", {alpha: false});
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch(exception) {
        alert("Could not initialize WebGL.");
        return null;
    }
}

async function webGLStart() {
    /* Canvas Setup */
    canvas = document.getElementById("graphics-canvas");
    canvasRect = canvas.getBoundingClientRect();
    canvasX = canvasRect.left + canvasRect.width/2;
    canvasY = canvasRect.top + canvasRect.height/2;

    /* GL Setup */
    canvas.getContext('webgl', {preserveDrawingBuffer: true});    
    initGL(canvas);
    
    /* GL Configuration */
    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /* Create meshes */
    Primitives.initialize();
    await ObjLoader.load("sphere.obj");
    await ObjLoader.load("skull.obj");
    await ObjLoader.load("chair.obj");

    /* Create Scene */
    new Scene();
}