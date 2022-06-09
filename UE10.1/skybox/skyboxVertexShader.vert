precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mTranslate;

varying vec3 TexCoord;
uniform sampler2D ourTexture;

varying vec4 v_position;

void main(){
    v_position = vec4(vertPosition, 1.0);

    TexCoord = vertPosition;
    gl_Position = mProj * mView *   mTranslate * mWorld * vec4(vertPosition, 1.0);
}