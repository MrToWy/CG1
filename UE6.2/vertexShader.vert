precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

void main(){
    fragColor = vec3(0.1, 1.0, 0.0);
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}