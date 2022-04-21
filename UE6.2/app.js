'use strict';

function objToVBO(objString){
    
    let objArray = objString.split("\n");
    let vbo = [];
    let indicies = [];

    for (let i = 0; i < objArray.length; i++) {
        let line = objArray[i];

        let columns = line.split(" ");
        let prefix = columns[0];
        
        if (prefix === "v"){
            let x = columns[1];
            let y = columns[2];
            let z = columns[3];
            
            vbo.push([x, y, z]);
        }
        else if(prefix === "f"){
            let x = columns[1].split("/");
            let y = columns[2].split("/");
            let z = columns[3].split("/");
        }
        
    }
    
    return vbo;
}

async function init(){
    let vertextRequest = await fetch("vertexShader.vert");
    let vertexShaderText = await vertextRequest.text();

    let fragmentRequest = await fetch("fragmentShader.frag");
    let fragmentShaderText = await fragmentRequest.text();
    
    let teapotRequest = await fetch("teapot.obj");
    let teapotText = await teapotRequest.text();


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

    gl.clearColor(1.0, 0.0, 0.7, 1);

    // prepare triangle
    const triangleVertices = objToVBO(teapotText);

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
        3, gl.FLOAT, false,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0);

    // draw triangle
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length/3);

}

window.onload = init;

