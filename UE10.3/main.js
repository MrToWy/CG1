'use strict';

const skyboxPath = "box/"
const teapotPath = "teapot/"

let tolerance = 0.01;
let updateId;
let previousDelta = 0;
let fpsLimit = 195.

const fpsLabel = document.getElementById("fps");
const canvas = document.getElementById("canvas")
const gl = canvas.getContext("webgl");
const fogNearInput = document.getElementById("fogNear")
const fogFarInput = document.getElementById("fogFar")
const valuesLabel = document.getElementById("values")


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

async function getBoxVertices(){
    let boxRequest = await fetch(skyboxPath + "box.obj");
    let boxText = await boxRequest.text();
    return objToVBO(boxText);
}

async function getTeapotVertices(gl, teapotProgram){
    let teapotRequest = await fetch(teapotPath + "teapot.obj");
    let teapotText = await teapotRequest.text();
    const teapotVertices = objToVBO(teapotText);

    const teapotVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotVertices),
        gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVBO);
    
    await bindParameters(gl, teapotProgram)
    
    return teapotVertices;
}

async function bindParameters(gl, program){
    const teapotPositionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(teapotPositionAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        0);

    const teapotColorAttributeLocation = gl.getAttribLocation(program, "normals");
    gl.vertexAttribPointer(teapotColorAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(teapotPositionAttributeLocation);
    gl.enableVertexAttribArray(teapotColorAttributeLocation);
}

async function draw(gl, vertices){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),
        gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);
}

async function handleFPS(currentDelta, loop){
  
    // fps
    updateId = requestAnimationFrame(loop);
    const delta = currentDelta - previousDelta;
    const fps = 1000 / delta;

    if (fpsLimit && delta < (1000 / fpsLimit) - tolerance) 
        return true;
    
    previousDelta = currentDelta;
    fpsLabel.textContent = fps.toFixed(1);
}

async function position(gl, program, cameraRotationAngle, rotationAngle, translateVector3, scaleVector3, canvas){
    let eye = [0, 5, -10];    
    
    let worldLocation = gl.getUniformLocation(program, 'mWorld');
    let viewLocation = gl.getUniformLocation(program, 'mView');
    let projLocation = gl.getUniformLocation(program, 'mProj');
    let translLocation = gl.getUniformLocation(program, 'mTranslate');
    let rotateLocation = gl.getUniformLocation(program, 'mRotate');

    let identityMatrix = new glMatrix.mat4.create();
    let worldMatrix = new glMatrix.mat4.create();
    let viewMatrix = new glMatrix.mat4.create();
    let projMatrix = new glMatrix.mat4.create();
    let translateMatrix = new glMatrix.mat4.create();
    let rotationMatrix = new glMatrix.mat4.create();

    identity(identityMatrix);
    lookAt(viewMatrix, eye, [0, 0, 0], [0, 1, 0]);
    
    glMatrix.mat4.rotateY(viewMatrix, viewMatrix, cameraRotationAngle * Math.PI / 180); // rotate cam
    glMatrix.mat4.rotateY(rotationMatrix, identityMatrix, rotationAngle * Math.PI / 180); // rotate object
    
    translate(translateMatrix, translateMatrix, translateVector3)
    scale(translateMatrix, translateMatrix, scaleVector3);
    
    perspective(projMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(worldLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projMatrix);
    gl.uniformMatrix4fv(translLocation, gl.FALSE, translateMatrix);
    gl.uniformMatrix4fv(rotateLocation, gl.FALSE, rotationMatrix);
}

async function init() {
    
    // compile programs
    const teapotProgram = await getProgram([teapotPath + "teapotFragmentShader.frag", teapotPath + "teapotVertexShader.vert"], gl)
    const skyboxProgram = await getProgram([skyboxPath + "skyboxFragmentShader.frag", skyboxPath + "skyboxVertexShader.vert"], gl)

    // get vertices
    const teapotVertices = await getTeapotVertices(gl, teapotProgram)
    const boxVertices = await getBoxVertices();
    
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
    })    
    
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    gl.enable(gl.DEPTH_TEST);
    

    let counter = 45;
    
    gl.useProgram(skyboxProgram)
    
    let clearColor = [1.0, 0.8, 0.9, 1.0]
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

    let fogColor = gl.getUniformLocation(skyboxProgram, 'fogColor');
    let fogNear = gl.getUniformLocation(skyboxProgram, 'fogNear');
    let fogFar = gl.getUniformLocation(skyboxProgram, 'fogFar');
    

    
    async function loop(currentDelta) {
        
        if(await handleFPS(currentDelta, loop)) {
            return;
        }
        
        counter -= 0.0;
        

        gl.uniform4f(fogColor, clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        
        let fogNearValue = fogNearInput.value/10000.;
        let fogFarValue = fogFarInput.value/1000.;
        
        gl.uniform1f(fogNear, fogNearValue);
        gl.uniform1f(fogFar, fogFarValue);
        valuesLabel.innerHTML = "Far: " + fogFarValue + "   - Near: " + fogNearValue;

        gl.useProgram(skyboxProgram);

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        await position(gl, skyboxProgram, counter, 0, [0., 0, -1], [1, 1, 1], canvas)
        await draw(gl, boxVertices)

        await position(gl, skyboxProgram, counter, 45/2, [1.5, 0, 1.5], [1, 1, 1], canvas)
        await draw(gl, boxVertices)

        await position(gl, skyboxProgram, counter, 45/2,[-1.5, 0, 1.5], [1, 1, 1], canvas)
        await draw(gl, boxVertices)

        let vertices = [1.,1.,2.,2.]
        await position(gl, skyboxProgram, counter, 0,[-2., 0, 1], [1, 1, 1], canvas)
        await draw(gl, vertices)
    }
    
    requestAnimationFrame(loop);
}

window.onload = init;
