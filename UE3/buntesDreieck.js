'use strict'

const vertexShaderText = 
`
precision mediump float;

attribute vec2 vertPosition;
varying vec3 fragColor;
attribute vec3 color;

void main(){
    fragColor = color;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
`;

const fragmentShaderText = 
`
precision mediump float;
varying vec3 fragColor;

void main(){
    gl_FragColor = vec4(fragColor, 1.0);
}
`;

function init(){
    console.log("Wir malen ein Dreieck!");
    const canvas = document.getElementById("cg1");
    const gl = canvas.getContext('webgl');

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);


    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);

    gl.clearColor(1.0, 0.8, 0.9, 1.0);

    // prepare triangle
    const traingleVertices = [
        0.0, 0.5, 
        -0.5, -0.5,
        0.5, -0.5
    ];

    const triangleColor = [
        0.4,0.5,0.5, 
        0.5,0.3,0.5,
        0.5,0.5,0.1
    ];

    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array(traingleVertices), 
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColor),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);


    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttribLocation = gl.getAttribLocation(program,'color');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2, // dimension
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    )
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // draw triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
}

window.onload = init;