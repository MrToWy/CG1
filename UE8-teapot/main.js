'use strict';

function objToVBO(objString) {

    let objArray = objString.split("\n");
    let v = [];
    let vt = [];
    let vn = [];
    let vbo = [];

    for (let i = 0; i < objArray.length; i++) {
        let line = objArray[i];

        let columns = line.split(" ");
        let prefix = columns[0];

        if (prefix === "v") {
            let x = parseFloat(columns[1]);
            let y = parseFloat(columns[2]);
            let z = parseFloat(columns[3]);

            v.push([x, y, z]);
        } else if (prefix === "vt") {
            let x = parseFloat(columns[1]);
            let y = parseFloat(columns[2]);

            vt.push([x, y]);
        } else if (prefix === "vn") {
            let x = parseFloat(columns[1]);
            let y = parseFloat(columns[2]);
            let z = parseFloat(columns[3]);

            vn.push([x, y, z]);
        } else if (prefix === "f") {

            for (let j = 1; j < 4; j++) {
                let triplet = columns[j].split("/");

                let verticesIndex = triplet[0] - 1;
                let texturesIndex = triplet[1] - 1;
                let normalIndex = triplet[2] - 1;

                // push vertices
                vbo.push(v[verticesIndex][0], v[verticesIndex][1], v[verticesIndex][2]);

                // push textures
                vbo.push(vt[texturesIndex][0], vt[texturesIndex][1]);

                // push normals
                vbo.push(vn[normalIndex][0], vn[normalIndex][1], vn[normalIndex][2]);
            }
        }

    }

    return vbo;
}

async function init() {


    let vertextRequest = await fetch("vertexShader.vert");
    let vertexShaderText = await vertextRequest.text();

    let fragmentRequest = await fetch("fragmentShader.frag");
    let fragmentShaderText = await fragmentRequest.text();

    let teapotRequest = await fetch("teapot.obj");
    let teapotText = await teapotRequest.text();
    const triangleVertices = objToVBO(teapotText);
    console.log(triangleVertices);

    console.log(await fetchModel("teapot.obj"));

    const triangle = document.getElementById("triangle")
    const gl = triangle.getContext("webgl");

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);
    // TODO: Check compile status
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR', gl.getShaderInfoLog(vertexShader));
        return;
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.validateProgram(program);

    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR', gl.getProgramInfoLog(program));
        return;
    }

    gl.clearColor(0.0, 1.0, 0.0, 1);


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
        8 * Float32Array.BYTES_PER_ELEMENT,
        0);

    const colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(colorAttributeLocation,
        3, gl.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT);

    // draw triangle
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);

    gl.enable(gl.DEPTH_TEST);


    let counter = 0;

    function loop() {
        counter -= 1;

        let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
        let matTranslateUniformLocation = gl.getUniformLocation(program, 'mTranslate');

        let identityMatrix = new glMatrix.mat4.create();
        let worldMatrix = new glMatrix.mat4.create();
        let viewMatrix = new glMatrix.mat4.create();
        let projMatrix = new glMatrix.mat4.create();
        let translateMatrix = new glMatrix.mat4.create();

        identity(identityMatrix);

        rotateY(translateMatrix, identityMatrix, counter * Math.PI / 180);
        translate(translateMatrix, translateMatrix, [0, -0.4, 0])
        scale(translateMatrix, translateMatrix, [1, 1, 1]);

        let eye = [1, 2, 10];
        lookAt(viewMatrix, eye, [0, 0, 0], [0, 1, 0]);

        perspective(projMatrix, 45 * Math.PI / 180, triangle.clientWidth / triangle.clientHeight, 0.1, 1000.0);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(matTranslateUniformLocation, gl.FALSE, translateMatrix);


        gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length / 8);
        
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

window.onload = init;

