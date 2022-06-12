precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mTranslate;
uniform mat4 mRotate;
uniform mat4 mScale;

varying vec3 TexCoord;
uniform sampler2D ourTexture;

varying vec4 v_position;

void main(){
    gl_Position = mProj * mView *   mTranslate * mRotate * mScale * mWorld * vec4(vertPosition, 1.0);
}