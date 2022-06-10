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

    const width = 0.2;
    const top_limit = 0.8;
    const bot_limit = -0.85;
    const left_limit = -0.4;
    const right_limit = 0.4;
    
    const letter_bot = -0.5;
    const letter_mid_height = 0.1;
    
    const triangleVerticies=[
        // right line
        right_limit, top_limit,         //oben-rechts
        right_limit - width, top_limit, //oben-links
        right_limit, letter_bot,        //unten-rechts
        right_limit - width, letter_bot,//unten-links

        // mid line
        right_limit, letter_mid_height + width, // top right
        left_limit, letter_mid_height + width, // top left
        right_limit, letter_mid_height, // bot right
        left_limit, letter_mid_height,// bot left

        // left line
        left_limit + width, top_limit,  //oben-rechts
        left_limit, top_limit,          //oben-links
        left_limit + width, letter_bot, //unten-rechts
        left_limit, letter_bot,         //unten-links

        // bot line
        right_limit, bot_limit + width, // top right
        left_limit, bot_limit + width, // top left
        right_limit, bot_limit, // bot right
        left_limit, bot_limit,// bot left
    ];

    const indexArray = [
        0,1,2,3,    // right line
        3,4,        // from right to mid
        4,5,6,7,    // middle line
        7,8,        // from mid to left
        8,9,10,11,  // left line
        11,12,      // from left to bot
        12,13,14,15 // bot line
    ];



    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array(triangleVerticies), 
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const indexVBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
        new Uint16Array(indexArray), 
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


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

    // enable cullface
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW); //gl.CW

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVBO);
    // draw triangle
    gl.drawElements(gl.TRIANGLE_STRIP,indexArray.length,gl.UNSIGNED_SHORT,0);
    
}

window.onload = init;