
//Implementiere eine Funktion translate(out, in, v), welche die Matrix in mit einer Translationsmatrix T(v) multipliziert und das Ergebnis in out ablegt.
//    Ersetze alle Aufrufe von mat4.translate() durch deine eigene Funktion und stelle sicher, dass
//sich die Darstellung dadurch nicht ändert.


function getExampleMatrix(matrix){
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 5;
    matrix[3] = 2;
    matrix[4] = 1;
    matrix[5] = 6;
    matrix[6] = 3;
    matrix[7] = 4;
    matrix[8] = 0;
}


function getDeterminante3x3(matrix){

    const a11 = matrix[0];
    const a12 = matrix[3];
    const a13 = matrix[6];

    const a21 = matrix[1];
    const a22 = matrix[4];
    const a23 = matrix[7];

    const a31 = matrix[2];
    const a32 = matrix[5];
    const a33 = matrix[8];

    return a11*a22*a33 + a12*a23*a31 + a13*a21*a32 - a31*a22*a13 - a32*a23*a11 - a33*a21*a12;
}

function swap(matrix, index1, index2){
    const cache = matrix[index1];
    matrix[index1] = matrix[index2];
    matrix[index2] = cache;
}

function transpose(matrix){
    swap(matrix, 1, 3);
    swap(matrix, 2, 6);
    swap(matrix, 5, 7);
}

function getDeterminante2x2(matrix){
    const a11 = matrix[0];
    const a21 = matrix[1];
    const a12 = matrix[2];
    const a22 = matrix[3];
    
    return a11*a22 - a21*a12;
}


function getMinorMatrix(matrix, index){
    if(index===0){
        return [matrix[4], matrix[5], matrix[7], matrix[8]]
    }

    if(index===1){
        return [matrix[3], matrix[5], matrix[6], matrix[8]]
    }

    if(index===2){
        return [matrix[3], matrix[4], matrix[6], matrix[7]]
    }

    if(index===3){
        return [matrix[1], matrix[2], matrix[7], matrix[8]]
    }

    if(index===4){
        return [matrix[0], matrix[2], matrix[6], matrix[8]]
    }

    if(index===5){
        return [matrix[0], matrix[1], matrix[6], matrix[7]]
    }

    if(index===6){
        return [matrix[1], matrix[2], matrix[4], matrix[5]]
    }
    
    if(index===7){
        return [matrix[0], matrix[2], matrix[3], matrix[5]]
    }

    if(index===8){
        return [matrix[0], matrix[1], matrix[3], matrix[4]]
    }
}

function getAdjugateMatrix(matrix){
    const a11 = getDeterminante2x2(getMinorMatrix(matrix, 0));
    const a12 = getDeterminante2x2(getMinorMatrix(matrix, 1)) * - 1;
    const a13 = getDeterminante2x2(getMinorMatrix(matrix, 2));
    const a21 = getDeterminante2x2(getMinorMatrix(matrix, 3)) * - 1;
    const a22 = getDeterminante2x2(getMinorMatrix(matrix, 4));
    const a23 = getDeterminante2x2(getMinorMatrix(matrix, 5)) * - 1;
    const a31 = getDeterminante2x2(getMinorMatrix(matrix, 6));
    const a32 = getDeterminante2x2(getMinorMatrix(matrix, 7)) * - 1;
    const a33 = getDeterminante2x2(getMinorMatrix(matrix, 8));
    
    return [a11, a12, a13, a21, a22, a23, a31, a32, a33];
}

function invert(matrix, adjugateMatrix){
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] *= adjugateMatrix[i];
    }
}
    
function translate(out, a, v){

    for (let i = 0; i < a.length; i++) {
        out[i] = a[i];
    }
    
    let x = v[0];
    let y = v[1];
    let z = v[2];
    
    let origin = [out[12], out[13], out[14], out[15]];
    
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
}   

function scale(out, input, v){
    out[0] = input[0] * v[0];
    out[1] = input[1] * v[0];
    out[2] = input[2] * v[0];
    out[3] = input[3] * v[0];

    out[4] = input[4] * v[1];
    out[5] = input[5] * v[1];
    out[6] = input[6] * v[1];
    out[7] = input[7] * v[1];

    out[8] = input[8] * v[2];
    out[9] = input[9] * v[2];
    out[10] = input[10] * v[2];
    out[11] = input[11] * v[2];
}

function rotateY(out, input, rad){

    let sin = Math.sin(rad);
    let cos = Math.cos(rad);
    
    out[0] = input[0] * cos - input[8] * sin;
    out[1] = input[1] * cos - input[9] * sin;
    out[2] = input[2] * cos - input[10] * sin;
    out[3] = input[3] * cos - input[11] * sin;

    out[4] = input[4];
    out[5] = input[5];
    out[6] = input[6];
    out[7] = input[7];
    
    out[8] = input[0] * sin + input[8] * cos;
    out[9] = input[1] * sin + input[9] * cos;
    out[10] = input[2] * sin + input[10] * cos;
    out[11] = input[3] * sin + input[11] * cos;

    out[12] = input[12];
    out[13] = input[13];
    out[14] = input[14];
    out[15] = input[15];
}

function perspective(out, fovy, aspect, near, far){
    
    identity(out);

    let n = near;
    let f = far;
    
    let t = Math.tan(fovy/2) * near;
    let b = -t;

    let r = t * aspect;
    let l = -r;

    out[0] = 2/(r-l);
    out[5] = 2/(t-b);
    out[8] = (1/n) * ((r+l)/(r-l));
    out[9] = (1/n) * ((t+b)/(t-b));
    out[10] = -(1/n) * ((f+n)/(f-n));
    out[11] = -(1/n);
    out[14] = -(2*f/(f-n));
    out[15] = 0;
}

function kreuzprodukt(out, a, b){
    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];
}

function lookAt(out, eye, center, up){
    // eye - center
    let n = [eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]
    let n_betrag = Math.hypot(n[0], n[1], n[2]);
    
    // n x up
    let u = [];
    kreuzprodukt(u, up, n);
    console.log(u);
    let u_betrag = Math.hypot(u[0], u[1], u[2]);
    
    // n x u
    let v = [];
    kreuzprodukt(v, n ,u);
    let v_betrag = Math.hypot(v[0], v[1], v[2]);
    
    
    let n_norm = [n[0] / n_betrag, n[1] / n_betrag, n[2] / n_betrag];
    let u_norm = [u[0] / u_betrag, u[1] / u_betrag, u[2] / u_betrag];
    let v_norm = [v[0] / v_betrag, v[1] / v_betrag, v[2] / v_betrag];

    out[0] = u_norm[0];
    out[1] = v_norm[0];
    out[2] = n_norm[0];
    out[3] = 0;
    
    out[4] = u_norm[1];
    out[5] = v_norm[1];
    out[6] = n_norm[1];
    out[7] = 0;
    
    out[8] = u_norm[2];
    out[9] = v_norm[2];
    out[10] = n_norm[2];
    out[11] = 0;
    
    out[12] = -(u_norm[0] * eye[0] + u_norm[1] * eye[1] + u_norm[2] * eye[2]);
    out[13] = -(v_norm[0] * eye[0] + v_norm[1] * eye[1] + v_norm[2] * eye[2]);
    out[14] = -(n_norm[0] * eye[0] + n_norm[1] * eye[1] + n_norm[2] * eye[2]);
    out[15] = 1;
}

function identity(out){
    for (let i = 0; i < out.length; i++) {
        for (let j = 0; j < out[i].length; j++) {
            out[i][j] = i === j ? 1 : 0;
        }
    }
}