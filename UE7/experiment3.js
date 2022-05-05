'use strict'


async function init(){


    let vertextRequest = await fetch("vertexShader.vert");
    let vertexShaderText = await vertextRequest.text();

    let fragmentRequest = await fetch("fragmentShader.frag");
    let fragmentShaderText = await fragmentRequest.text();
    
    
    
    console.log("Wir malen ein Dreieck!");
    const canvas = document.getElementById("cg1");
    const gl = canvas.getContext('webgl');

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);


    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);

        if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
            console.error('ERROR', gl.getShaderInfoLog(vertexShader));
            
        
        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
            console.error('ERROR', gl.getShaderInfoLog(fragmentShader));
    
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