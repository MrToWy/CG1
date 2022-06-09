precision mediump float;
varying vec3 TexCoord;
uniform samplerCube skybox;

uniform float fogNear;
uniform float fogFar;
uniform vec4 fogColor;


void main(){

    vec4 color = textureCube(skybox, TexCoord);

    float fogAmount = smoothstep(fogNear, fogFar, gl_FragCoord.z);



    vec4 nebelcolor = vec4(1., 0., 0., 1.);
    gl_FragColor = mix(color, fogColor, fogAmount); //mix(color, nebelcolor, 1.0);
}