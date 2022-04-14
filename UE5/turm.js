'use strict'


const vertexShaderText =
`
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 fColor;
varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mTranslate;

void main(){
    //fragColor = vec3(0.5,0.0,0.5);
    fragColor = fColor;
    gl_Position =  mProj * mView *   mTranslate * mWorld * vec4(vertPosition, 1.0);
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


    let verticies = []

    const xArray = [-0.5, 0.5]
    const yArray = [-0.5, 0.5]
    const zArray = [-0.5, 0.5]

    for (let z = 0; z < xArray.length; z++) {
        for (let y = 0; y < yArray.length; y++) {
            for (let x = 0; x < zArray.length; x++) {
                verticies.push(xArray[x], yArray[y], zArray[z], 0.5 + xArray[x], 0.5 + yArray[y], 0.5 + zArray[z]);
            }
        }
    }

    console.log(verticies);

    


    const indexArray = [
        0, 1, 
        2, 3, 
        6, 7,
        4, 5,
        0, 1,
        1, 5,
        7, 7, 
        1, 3,
        3, 2,
        2, 6,
        4, 4,
        2, 0
        
    ];



    const triangleVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array(verticies),
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
        3, // dimension
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);


    const colorAttribLocation = gl.getAttribLocation(program, 'fColor');
    gl.vertexAttribPointer(
        colorAttribLocation,
        3, // dimension
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(colorAttribLocation);

    // enable cullface
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW); //gl.CW

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVBO);

    const moveToBottom = -1.9;
    const distanceBetweenCubes = 3.8;
    
    
    const cubeHeight = 0.3;
    
    const angleBetweenCubes = 45;

    for (let i = 0; i < 9; i++) {
        let cubeWidth = 2/i;
        
        let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
        let matTranslateUniformLocation = gl.getUniformLocation(program, 'mTranslate');

        let identityMatrix = new glMatrix.mat4.create();
        let worldMatrix = new glMatrix.mat4.create();
        let viewMatrix = new glMatrix.mat4.create();
        let projMatrix = new glMatrix.mat4.create();
        let translateMatrix = new glMatrix.mat4.create();

        glMatrix.mat4.identity(identityMatrix);

        glMatrix.mat4.rotateY(translateMatrix, identityMatrix, i * angleBetweenCubes * Math.PI/180);
        glMatrix.mat4.translate(translateMatrix, translateMatrix, [0, i/distanceBetweenCubes + moveToBottom, 0])
        glMatrix.mat4.scale(translateMatrix, translateMatrix, [cubeWidth, cubeHeight, cubeWidth]);
        
        let eye = [1, 2, 5];
        glMatrix.mat4.lookAt(viewMatrix, eye, [0, 0, 1], [0, 1, 0]);
        glMatrix.mat4.rotateY(viewMatrix, viewMatrix, 45 * Math.PI/180);
        glMatrix.mat4.perspective(projMatrix, 45 * Math.PI/180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
        
        

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(matTranslateUniformLocation, gl.FALSE, translateMatrix);


        // draw triangle
        gl.drawElements(gl.TRIANGLE_STRIP, indexArray.length, gl.UNSIGNED_SHORT, 0);
    }
}

window.onload = init;