'use strict'

const vertexShaderText = 
`
precision mediump float;

attribute vec2 vertPosition;
attribute float color;
varying float fragValue;

void main(){
    fragValue = color;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
`;

const fragmentShaderText = 
`
precision mediump float;
varying float fragValue;

void main(){
    
    vec3 color1 = 1==1 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 color2 = 2==1 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    
    vec3 fragColor = mix(color1, color2, sin(gl_FragCoord.x * 0.016));
    
    
    fragColor[0] = smoothstep(0.2,0.4,fragColor[0]);
    fragColor[1] = smoothstep(0.2,0.4,fragColor[1]);
    fragColor[2] = smoothstep(0.2,0.4,fragColor[2]);
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
        -0.9, 0.9, 0, 
        -0.9, 0.7, 0,
        0.9, 0.7, 1,
        -0.9, 0.9, 0,
        0.9, 0.9, 1,
        0.9, 0.7, 1
    ];


    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array(traingleVertices), 
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2, // dimension
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    const colorAttribLocation = gl.getAttribLocation(program,'color');

    gl.vertexAttribPointer(
        colorAttribLocation,
        1,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    )
    
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);


    // draw triangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
}

window.onload = init;