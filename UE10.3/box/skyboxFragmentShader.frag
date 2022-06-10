precision mediump float;
varying vec3 TexCoord;
uniform samplerCube skybox;

uniform float fogNear;
uniform float fogFar;
uniform vec4 fogColor;


void main(){

    vec4 color = textureCube(skybox, TexCoord);




    gl_FragColor = color; //mix(color, nebelcolor, 1.0);
}