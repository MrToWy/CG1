'use strict';

const skyboxPath = "skybox/"
const teapotPath = "teapot/"
const cubePath = "cube/"

let tolerance = 0.01;
let updateId;
let previousDelta = 0;
let fpsLimit = 30;

const fpsLabel = document.getElementById("fps");
const canvas = document.getElementById("canvas")
const gl = canvas.getContext("webgl");


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
    gl.useProgram(teapotProgram);
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

    const texCoordAttributeLocation = gl.getAttribLocation(program, "textureCoordinate");
    gl.vertexAttribPointer(texCoordAttributeLocation,
        2, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT);

    const teapotColorAttributeLocation = gl.getAttribLocation(program, "normals");
    gl.vertexAttribPointer(teapotColorAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(teapotPositionAttributeLocation);
    gl.enableVertexAttribArray(texCoordAttributeLocation);
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

async function position(gl, program, rotationAngle, translateVector3, scaleVector3, canvas){
    let eye = [1, 5, 10];    
    
    let worldLocation = gl.getUniformLocation(program, 'mWorld');
    let viewLocation = gl.getUniformLocation(program, 'mView');
    let projLocation = gl.getUniformLocation(program, 'mProj');
    let translLocation = gl.getUniformLocation(program, 'mTranslate');

    let identityMatrix = new glMatrix.mat4.create();
    let worldMatrix = new glMatrix.mat4.create();
    let viewMatrix = new glMatrix.mat4.create();
    let projMatrix = new glMatrix.mat4.create();
    let translateMatrix = new glMatrix.mat4.create();

    identity(identityMatrix);
    lookAt(viewMatrix, eye, [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.rotateY(viewMatrix, viewMatrix, rotationAngle * Math.PI / 180);
    translate(translateMatrix, translateMatrix, translateVector3)
    scale(translateMatrix, translateMatrix, scaleVector3);
    
    perspective(projMatrix, 45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(worldLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projLocation, gl.FALSE, projMatrix);
    gl.uniformMatrix4fv(translLocation, gl.FALSE, translateMatrix);
}

async function init() {
    
    // compile programs
    const teapotProgram = await getProgram([teapotPath + "teapotFragmentShader.frag", teapotPath + "teapotVertexShader.vert"], gl)
    const skyboxProgram = await getProgram([skyboxPath + "skyboxFragmentShader.frag", skyboxPath + "skyboxVertexShader.vert"], gl)
    const cubeProgram = await getProgram([cubePath + "cubeFragmentShader.frag", cubePath + "cubeVertexShader.vert"], gl)

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
    

    let counter = 0;

    async function loop(currentDelta) {
        
        if(await handleFPS(currentDelta, loop)) {
            return;
        }
        
        counter -= 0.3;
        
        // skybox
        gl.useProgram(skyboxProgram);
        await position(gl, skyboxProgram, counter, [0, 0, 0], [1, 0, 0], canvas)
        await draw(gl, boxVertices)




        // Create a texture to render to
        const targetTextureWidth = 256;
        const targetTextureHeight = 256;
        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);

        {
            // define size and format of level 0
            const level = 0;
            const internalFormat = gl.RGBA;
            const border = 0;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            const data = null;
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                targetTextureWidth, targetTextureHeight, border,
                format, type, data);

            // set the filtering so we don't need mips
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }


        // Create and bind the framebuffer
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
        
        // teapot
        gl.useProgram(teapotProgram);
        await position(gl, teapotProgram, counter, [-0, -0.0, 0], [1, 1, 1], canvas)
        await draw(gl, teapotVertices)

        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        const level = 0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

        
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)


        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // cube
        gl.useProgram(cubeProgram);
        await position(gl, cubeProgram, counter, [0, 3, 0], [1, 1, 1], canvas)
        await draw(gl, boxVertices)
    }

    requestAnimationFrame(loop);
}

window.onload = init;

