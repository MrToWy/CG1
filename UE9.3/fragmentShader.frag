precision mediump float;
varying vec3 fragColor;
varying vec2 TexCoord;
uniform sampler2D ourTexture;
uniform sampler2D textureSelector;

uniform samplerCube skybox;


void main(){
    gl_FragColor = textureCube(skybox, vec3(TexCoord, 1));
}