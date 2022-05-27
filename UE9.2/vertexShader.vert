precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;
attribute vec2 textCol;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mTranslate;

varying vec3 fragColor;
varying vec2 TexCoord;
uniform sampler2D ourTexture;

void main(){
    TexCoord = textCol;
    fragColor = vertColor;
    gl_Position = mProj * mView *   mTranslate * mWorld * vec4(vertPosition, 1.0);
}