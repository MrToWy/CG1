precision mediump float;
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

float getMax(float a, float b){
    if (a > b){
        return a;
    }

    return b;
}

void main(){
    vec3 N = normalize(vertNormals);
    vec4 emissiv = matEmission;
    vec4 ambient = matAmbient * lightAmbient;
    vec3 L = vec3(0.0);
    vec3 H = vec3(0.0);

    if(lightPosition.w == 0.0){
        L = normalize(vec3(lightPosition));
        H = normalize(lightHalfVector);
    }
    else{
        L = normalize(vec3(lightPosition) - vertPosition);
        // annahme eines infiniten Augenpunkts:
        // somit zeigt der Vektor A zum Augenpunkt immer in z-Richtung
        vec4 Pos_eye = vec4(0.0, 0.0, 0.0, 1.0);
        vec3 A = Pos_eye.xyz;
        H = normalize(L + A);
    }

    vec4 diffuse = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 specular = vec4(0.0, 0.0, 0.0, 1.0);
    float diffuseLight = max(dot(N, L), 0.0);

    if(diffuseLight > 0.0){
        diffuse = diffuseLight * matDiffuse * lightDiffuse;
        float specLight = pow(getMax(dot(H, N), 0.0), matShininess);
        specular = specLight * matSpecular * lightSpecular;
    }

    gl_FragColor = emissiv + ambient + diffuse + specular + vec4(vertNormals, 1.0);

}