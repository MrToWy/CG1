'use strict'

const vertexShaderText = 
`
precision mediump float;

attribute vec2 vertPosition;
varying vec3 fragColor;

void main(){
    fragColor = vec3(0.5,0.0,0.5);
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
    console.log("Wir malen Kreise!");
    const canvas = document.getElementById("cg1");
    const gl = canvas.getContext('webgl');

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR', gl.getShaderInfoLog(vertexShader));
        return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);

    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);

    gl.clearColor(1.0, 0.8, 0.9, 1.0);

    // prepare triangle
    let triangleVerticies = [
        
    ];

    
    for (let index = 0; index < 361; index++) {
        let bogenmass = (index/180)*Math.PI;
        let x = Math.cos(bogenmass);
        let y = Math.sin(bogenmass);
        let xklein = Math.cos(bogenmass)*0.5;
        let yklein = Math.sin(bogenmass)*0.5;

        triangleVerticies.push(xklein);
        triangleVerticies.push(yklein);
        triangleVerticies.push(x);
        triangleVerticies.push(y);
    }
    console.log(triangleVerticies);


    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array(triangleVerticies), 
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
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    // draw triangle
    gl.drawArrays(gl.TRIANGLE_STRIP,0,triangleVerticies.length/2);
    
}

window.onload = init;