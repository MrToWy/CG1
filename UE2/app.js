'use strict';

const vertexShaderText =
    `
    uniform vec3 color;
    uniform vec2 offsetPos;
    uniform float angle;
    
    precision mediump float;
    
    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    
    varying vec3 fragColor;
    
    void main(){
        fragColor = color;
        
        gl_Position = vec4(vertPosition + offsetPos, 0.0, 1.0);
        
        gl_Position[0] = vertPosition[0] * cos(angle) - vertPosition[1] * sin(angle);
        gl_Position[1] = vertPosition[0] * sin(angle) + vertPosition[1] * cos(angle);
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

    gl.clearColor(0.0, 0.0, 0.0, 1);

    // prepare triangle
    
    const top_limit = 0.8;
    const bot_limit = -0.85;
    const left_limit = -0.4;
    const right_limit = 0.4;
    
    const letter_bot = -0.5;
    const letter_mid_height = 0.1;
    
    const width = 0.2;
    
    const triangleVertices=[


        // right line
        right_limit, top_limit, 
        right_limit - width, letter_bot,
        right_limit, letter_bot, 

        right_limit - width, top_limit, 
        right_limit, top_limit, 
        right_limit - width, letter_bot,


        // left line
        left_limit, top_limit,
        left_limit + width, letter_bot,
        left_limit, letter_bot,

        left_limit + width, top_limit,
        left_limit, top_limit,
        left_limit + width, letter_bot,


        // mid line
        right_limit, letter_mid_height + width, // top right
        left_limit, letter_mid_height,// bot left
        right_limit, letter_mid_height, // bot right

        left_limit, letter_mid_height + width, // top left
        right_limit, letter_mid_height + width, // top right
        left_limit, letter_mid_height, // bot left



        // bot line
        right_limit, bot_limit + width, // top right
        left_limit, bot_limit,// bot left
        right_limit, bot_limit, // bot right
        
        left_limit, bot_limit + width, // top left
        right_limit, bot_limit + width, // top right
        left_limit, bot_limit // bot left
    ];

    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices),
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);

    // RGB: 220,60,5
    const colorAttribLocation = gl.getUniformLocation(program, "color");
    gl.uniform3f(colorAttribLocation, 220/256, 60/256, 5/256);
    
    // angle
    const angleAttribLocation = gl.getUniformLocation(program, "angle");
    gl.uniform1f(angleAttribLocation, 200);
    
    // translation
    const offsetAttribLocation = gl.getUniformLocation(program, "offsetPos");
    gl.uniform2f(offsetAttribLocation, 0.9,0.9);
    
    const positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(positionAttributeLocation,
        2, gl.FLOAT, false,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0);

    // draw triangle
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length/2);

    let counter = 0;
    let change = 1;
    
    function loop() {
        // Code, der pro Frame ausgeführt wird        
        counter += change;


        gl.uniform3f(colorAttribLocation, counter/256, counter/256, counter/256);
        
        if(counter > 250 || counter < 1)
            change = change*-1;

        gl.uniform2f(offsetAttribLocation, 0.001 * counter,0.001 * counter);

        gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length/2);

        gl.uniform1f(angleAttribLocation, counter / 150);
        
        requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
}

window.onload = init;

