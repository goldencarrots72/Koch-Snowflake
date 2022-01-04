"use strict";

var gl;
var positions = []
var iterations = 5;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Initialize vertices that make up the first triangle.
    var vertices = [
        vec2(-0.5, -0.5),
        vec2(0, Math.sqrt(3) * 0.5 - 0.5),
        vec2(0.5, -0.5)
    ];

    //  Enqueue points into queue in pairs so that
    //  we can dequeue 2 points that make each line.
    positions.push(vertices[0]);
    positions.push(vertices[1]);
    positions.push(vertices[1]);
    positions.push(vertices[2]);
    positions.push(vertices[2]);
    positions.push(vertices[0]);

    //  Given the desired number of iterations, calculates correct 
    //  number of lines needed based on my konch snowflake algorithm.
    var numberOfLines = iterations == 0 ? 0 : 
        (3 * Math.pow(4, iterations-1)) * (4 / 3) - 1;

    //  For each iteration, dequeue 2 points of a line.
    //  Split this line into 4 lines with 3 new points, and enqueue
    //  the original 2 points, with pairs of the 3 new ones.
    for (var i = 0; i < numberOfLines; i++) {
        var a = positions.shift();
        var b = positions.shift();
        var newLine = divideLine(a, b);
        for (var j = 0; j < newLine.length; j++) {
            positions.push(newLine[j]);
        }
    }
    console.log(positions);

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, positions.length);
}

//  Divides a given line into 4, and finds 3 midpoints.
function divideLine(a, b) {
    var left = mix(a, b, 1 / 3);
    var right = mix(a, b, 2 / 3);
    var mid = calculatePoint(left, right);
    return [a, left, left, mid, mid, right, right, b];
}

//Given 2 middle points, finds the third.
function calculatePoint(left, right) {
    var rotateAngle = 60 * Math.PI / 180;
    var sin = Math.sin(rotateAngle);
    var cos = Math.cos(rotateAngle);
    var x = (right[0] - left[0]) * cos - (right[1] - left[1]) * sin + left[0];
    var y = (right[0] - left[0]) * sin + (right[1] - left[1]) * cos + left[1];
    return vec2(x, y);
}