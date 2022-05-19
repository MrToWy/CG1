
precision mediump float;
varying vec3 fragColor;
varying vec2 TexCoord;
uniform sampler2D ourTexture;

void main(){
    gl_FragColor = vec4(texture2D(ourTexture, TexCoord).rgb, 1.0);
}