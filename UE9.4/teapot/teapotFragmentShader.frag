precision mediump float;
varying vec3 fragColor;


// Passed in from the vertex shader.
varying vec3 worldPosition;
varying vec3 worldNormal;

// The texture.
uniform samplerCube u_texture;

void main(){
    vec3 worldNormal = normalize(worldNormal);
    vec3 eyeToSurfaceDir = normalize(worldPosition);
    vec3 direction = (eyeToSurfaceDir, worldNormal);

    gl_FragColor = textureCube(u_texture, direction);
}