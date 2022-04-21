precision mediump float;

attribute vec3 vertPosition;
attribute vec3 fColor;
varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mTranslate;

void main(){
    //fragColor = vec3(0.5,0.0,0.5);
    fragColor = fColor;
    gl_Position =  mProj * mView *   mTranslate * mWorld * vec4(vertPosition, 1.0);
}