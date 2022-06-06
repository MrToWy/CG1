

precision mediump float;



uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mTranslate;




varying vec3 vertNormals;
varying vec3 vertPosition;




varying vec4 matEmission;
varying vec4 matAmbient;
varying vec4 matDiffuse;
varying vec4 matSpecular;
varying float matShininess;



varying vec4 lightPosition;
varying vec4 lightAmbient;
varying vec4 lightDiffuse;
varying vec4 lightSpecular;
varying vec3 lightHalfVector;




void main(){


    gl_Position = mProj * mView *   mTranslate * mWorld * vec4(vertPosition, 1.0);
}

