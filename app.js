'use strict';

const vertexShaderText =
    `
    precision mediump float;
    
    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    
    varying vec3 fragColor;
    
    void main(){
        fragColor = vec3(0.0, 1.0, 0.0);
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
    console.log("hi");


    const triangle = document.getElementById("triangle")
    const gl = triangle.getContext("webgl");

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);
    // TODO: Check compile status
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR', gl.getShaderInfoLog(vertexShader));
        return;
    }

    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.validateProgram(program);

    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error('ERROR', gl.getProgramInfoLog(program));
        return;
    }

    gl.clearColor(1.0, 0.0, 0, 1);

    // prepare triangle
    const triangleVertices=[
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ];

    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices),
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    const positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(positionAttributeLocation,
        2, gl.FLOAT, false,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0);

    // draw triangle
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

}

window.onload = init;

