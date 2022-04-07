'use strict'


const vertexShaderText =
`
precision mediump float;

attribute vec3 vertPosition;
varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
    fragColor = vec3(0.5,0.0,0.5);
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
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

    const x = [-0.5, 0.5]
    const y = [-0.5, 0.5]
    const z = [-0.5, 0.5]

    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            for (let k = 0; k < z.length; k++) {
                verticies.push(x[k], y[j], z[i]);
            }
        }
    }

    console.log(verticies);

    


    const indexArray = [
        0, 1, 2, 3, 
        6, 7,
        4, 5,
        0, 1 
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
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    // enable cullface
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW); //gl.CW

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVBO);



    let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);
    
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, 0.785398, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);



    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


    
    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    //
    // Main render loop
    //
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLE_STRIP,indexArray.length,gl.UNSIGNED_SHORT,0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    


    // draw triangle
    gl.drawElements(gl.TRIANGLE_STRIP,indexArray.length,gl.UNSIGNED_SHORT,0);
    
}

window.onload = init;