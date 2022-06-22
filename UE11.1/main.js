'use strict';

const teapotPath = "teapot/"
const cubePath = "cube/"

let tolerance = 0.01;
let updateId;
let previousDelta = 0;
let fpsLimit = 30;

const fpsLabel = document.getElementById("fps");
const canvas = document.getElementById("canvas")
const gl = canvas.getContext("webgl");

const VBO = gl.createBuffer();


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

async function bindVerticesToBuffer(vertices, program){
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),
        gl.STATIC_DRAW);
    
}

async function getVertices(gl, program, objPath){
    let request = await fetch(objPath);
    let boxText = await request.text();
    let vertices = objToVBO(boxText, program);

    await bindVerticesToBuffer(vertices);
    
    bindParameters(gl, program, objPath)
    return vertices;
}


async function bindParameters(gl, program, name){
    gl.useProgram(program);
    
    const teapotPositionAttributeLocation = gl.getAttribLocation(program, "vertPosition");

    gl.vertexAttribPointer(teapotPositionAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        0);

    gl.enableVertexAttribArray(teapotPositionAttributeLocation);

    
    if(name === "teapot/teapot.obj"){
        const teapotColorAttributeLocation = gl.getAttribLocation(program, "normals");
        
        gl.vertexAttribPointer(teapotColorAttributeLocation,
            3, gl.FLOAT, gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT,
            5 * Float32Array.BYTES_PER_ELEMENT);

        gl.enableVertexAttribArray(teapotColorAttributeLocation);
    }
    
    if(name === "cube/box.obj"){
        const texCoordAttributeLocation = gl.getAttribLocation(program, "textureCoordinate");
        
        gl.vertexAttribPointer(texCoordAttributeLocation,
            2, gl.FLOAT, false,
            8 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT);
        
        gl.enableVertexAttribArray(texCoordAttributeLocation);
    }
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

async function position(gl, program, objRotationAngle, cameraRotationAngle, translateVector3, scaleVector3, canvas, eye){
     
    
    let worldLocation = gl.getUniformLocation(program, 'mWorld');
    let viewLocation = gl.getUniformLocation(program, 'mView');
    let projLocation = gl.getUniformLocation(program, 'mProj');
    let translLocation = gl.getUniformLocation(program, 'mTranslate');
    let scaleLocation = gl.getUniformLocation(program, 'mScale');

    let identityMatrix = new glMatrix.mat4.create();
    let worldMatrix = new glMatrix.mat4.create();
    let viewMatrix = new glMatrix.mat4.create();
    let projMatrix = new glMatrix.mat4.create();
    let translateMatrix = new glMatrix.mat4.create();
    let scaleMatrix = new glMatrix.mat4.create();

    identity(identityMatrix);
    identity(worldMatrix);
    identity(viewMatrix);
    identity(projMatrix);
    identity(translateMatrix);
    identity(scaleMatrix);
    
    lookAt(viewMatrix, eye, [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.rotateY(viewMatrix, viewMatrix, cameraRotationAngle * Math.PI / 180);
    translate(translateMatrix, translateMatrix, translateVector3)
    scale(scaleMatrix, scaleMatrix, scaleVector3);
    
    perspective(projMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(worldLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projMatrix);
    gl.uniformMatrix4fv(translLocation, gl.FALSE, translateMatrix);
    gl.uniformMatrix4fv(scaleLocation, gl.FALSE, translateMatrix);
}

async function init() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    
    // compile programs
    const teapotProgram = await getProgram([teapotPath + "teapotFragmentShader.frag", teapotPath + "teapotVertexShader.vert"], gl)
    const cubeProgram = await getProgram([cubePath + "cubeFragmentShader.frag", cubePath + "cubeVertexShader.vert"], gl)

    // get vertices
    const teapotVertices = await getVertices(gl, teapotProgram, teapotPath + "teapot.obj")
    const boxVertices = await getVertices(gl, cubeProgram, cubePath + "box.obj");
    

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    const targetTextureWidth = 256;
    const targetTextureHeight = 256;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, targetTextureWidth, targetTextureHeight, border, format, type, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,texture, level);

    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);


    gl.enable(gl.DEPTH_TEST);
    
    let counter = 0;

    async function loop(currentDelta) {
        
        if(await handleFPS(currentDelta, loop)) {
            return;
        }
        
        counter -= 0.3;
        gl.clearColor(0., 0., 0., 1.);
        gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
        
        // teapot
        gl.useProgram(teapotProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        
        let eye = [0, 1, 10];
        await position(gl, teapotProgram, counter, counter, [-0, 0.0, 0], [1, 1, 1], canvas, eye)
        
        bindParameters(gl, teapotProgram, teapotPath + "teapot.obj")
        
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);       
        await draw(gl, teapotVertices)

        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        const level = 0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)


        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // cube
        
        gl.useProgram(cubeProgram);
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        eye = [0, 0, 3];
        await position(gl, cubeProgram, counter, counter, [0, 0, 0], [1, 1, 1], canvas, eye)

        console.log(gl.getError())

        gl.clearColor(1., 0., 0., 1.);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        bindParameters(gl, cubeProgram, cubePath + "box.obj")
        await draw(gl, boxVertices)

        
    }

    requestAnimationFrame(loop);
}

window.onload = init;

