precision mediump float;

attribute vec2 vertPosition;
attribute float color;
varying float fragValue;

void main(){
    fragValue = color;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}