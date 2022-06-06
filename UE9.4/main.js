'use strict';

const skyboxPath = "skybox/"
const teapotPath = "teapot/"

async function getShader(shaderPath, glContext){
    let response = await fetch(shaderPath);
    let shaderText = await response.text();

    const shader = glContext.createShader(shaderPath.includes(".vert") ? glContext.VERTEX_SHADER : glContext.FRAGMENT_SHADER);
    glContext.shaderSource(shader, shaderText);
    glContext.compileShader(shader);

    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) 
        console.error('ERROR', glContext.getShaderInfoLog(shader));

    
    return shader;
}

async function getProgram(shaderPaths, glContext){

    const program = glContext.createProgram();

    for (const shaderPath of shaderPaths) 
        glContext.attachShader(program, await getShader(shaderPath, glContext));
    
    
    glContext.linkProgram(program);
    glContext.validateProgram(program);

    if (!glContext.getProgramParameter(program, glContext.VALIDATE_STATUS)) 
        console.error('ERROR', glContext.getProgramInfoLog(program));
    
    
    return program;
}

async function init() {

    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl");
    
    // compile programs
    const teapotProgram = await getProgram([teapotPath + "teapotFragmentShader.frag", teapotPath + "teapotVertexShader.vert"], gl)
    const skyboxProgram = await getProgram([skyboxPath + "skyboxFragmentShader.frag", skyboxPath + "skyboxVertexShader.vert"], gl)


    let teapotRequest = await fetch(teapotPath + "teapot.obj");
    let teapotText = await teapotRequest.text();
    const teapotVertices = objToVBO(teapotText);

    const teapotVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotVertices),
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(teapotProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVBO);


    const teapotPositionAttributeLocation = gl.getAttribLocation(teapotProgram, "vertPosition");
    gl.vertexAttribPointer(teapotPositionAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        0);

    const teapotColorAttributeLocation = gl.getAttribLocation(teapotProgram, "vertColor");
    gl.vertexAttribPointer(teapotColorAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT);


    gl.enableVertexAttribArray(teapotPositionAttributeLocation);
    gl.enableVertexAttribArray(teapotColorAttributeLocation);

    
    // skybox
    let boxRequest = await fetch(skyboxPath + "box.obj");
    let boxText = await boxRequest.text();
    const boxVertices = objToVBO(boxText);

    

    
    // texture
    let topImage = document.getElementById("top")
    let bottomImage = document.getElementById("bottom")
    let backImage = document.getElementById("back")
    let frontImage = document.getElementById("front")
    let leftImage = document.getElementById("left")
    let rightImage = document.getElementById("right")
    
    const cubeMapFaces = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            img: rightImage,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            img: topImage,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            img: frontImage,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            img: leftImage,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            img: bottomImage,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            img: backImage,
        },
    ];
    
    let texture = gl.createTexture();
    // gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)


    const level = 0;
    const internalFormat = gl.RGBA;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    cubeMapFaces.forEach((cubeMapFace) =>{
        
        const {target, img} = cubeMapFace;

        // fill with img
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, img);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    
    
    console.log(target)
    })    
    
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);





    gl.clearColor(0.0, 1.0, 0.0, 1);


    const boxVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices),
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(skyboxProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVBO);

    const positionAttributeLocation = gl.getAttribLocation(skyboxProgram, "vertPosition");
    gl.vertexAttribPointer(positionAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        0);

    // draw triangle
    gl.enableVertexAttribArray(positionAttributeLocation);

    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    //gl.depthMask(false);
    

    const textureSelector = gl.getUniformLocation(skyboxProgram, "textureSelector");

    let counter = 0;

    function loop() {
        gl.useProgram(skyboxProgram);
        
        counter -= 0.3;

        // select TEXTURE0 as texture
        gl.uniform1i(textureSelector, 0);
        
        let matWorldUniformLocation = gl.getUniformLocation(skyboxProgram, 'mWorld');
        let matViewUniformLocation = gl.getUniformLocation(skyboxProgram, 'mView');
        let matProjUniformLocation = gl.getUniformLocation(skyboxProgram, 'mProj');
        let matTranslateUniformLocation = gl.getUniformLocation(skyboxProgram, 'mTranslate');

        let identityMatrix = new glMatrix.mat4.create();
        let worldMatrix = new glMatrix.mat4.create();
        let viewMatrix = new glMatrix.mat4.create();
        let projMatrix = new glMatrix.mat4.create();
        let translateMatrix = new glMatrix.mat4.create();

        identity(identityMatrix);

        rotateY(translateMatrix, identityMatrix, counter * Math.PI / 180);
        translate(translateMatrix, translateMatrix, [0, -0.4, 0])
        scale(translateMatrix, translateMatrix, [1000, 1000, 1000]);

        let eye = [1, 2, 10];
        lookAt(viewMatrix, eye, [0, 0, 0], [0, 1, 0]);

        perspective(projMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(matTranslateUniformLocation, gl.FALSE, translateMatrix);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices),
            gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, boxVertices.length / 8);

        
        // teapot
        translateMatrix = new glMatrix.mat4.create();
        rotateY(translateMatrix, identityMatrix, counter * Math.PI / 180);
        translate(translateMatrix, translateMatrix, [0, -0.4, 0])
        
        gl.useProgram(teapotProgram);
        let teapotMatWorldUniformLocation = gl.getUniformLocation(teapotProgram, 'mWorld');
        let teapotMatViewUniformLocation = gl.getUniformLocation(teapotProgram, 'mView');
        let teapotMatProjUniformLocation = gl.getUniformLocation(teapotProgram, 'mProj');
        let teapotMatTranslateUniformLocation = gl.getUniformLocation(teapotProgram, 'mTranslate');

        gl.uniformMatrix4fv(teapotMatWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(teapotMatViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(teapotMatProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(teapotMatTranslateUniformLocation, gl.FALSE, translateMatrix);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotVertices),
            gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, teapotVertices.length / 8);
        
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

window.onload = init;

