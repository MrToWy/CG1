

function identity(out){
    for (let i = 0; i < out.length; i++) {
        for (let j = 0; j < out[i].length; j++) {
            out[i][j] = i === j ? 1 : 0;
        }
    }
}