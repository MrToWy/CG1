
precision mediump float;
varying vec3 fragColor;
varying vec2 TexCoord;
uniform sampler2D ourTexture;
uniform sampler2D textureSelector;

void main(){
    gl_FragColor = vec4(texture2D(textureSelector, TexCoord).rgb, 1.0);
}