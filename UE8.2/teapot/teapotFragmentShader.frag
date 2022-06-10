precision mediump float;
uniform vec4 fragColor;


// Passed in from the vertex shader.
varying vec3 worldPosition;
varying vec3 worldNormal;

// The texture.
uniform samplerCube u_texture;



uniform vec3 vertNormals;
uniform vec3 vertPosition;

uniform vec4 matEmission;
uniform vec4 matAmbient;
uniform vec4 matDiffuse;
uniform vec4 matSpecular;
uniform float matShininess;

uniform vec4 lightPosition;
uniform vec4 lightAmbient;
uniform vec4 lightDiffuse;
uniform vec4 lightSpecular;
uniform vec3 lightHalfVector;




void main(){
    vec3 N = normalize(worldNormal);
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
        float specLight = pow(max(dot(H, N), 0.0), matShininess);
        specular = specLight * matSpecular * lightSpecular;
    }

    gl_FragColor = fragColor * (emissiv + ambient + diffuse + specular + vec4(vertNormals, 1.0));
    gl_FragColor = specular;




    N = normalize(worldNormal);
    L = normalize(vec3(lightPosition) - vertPosition);

    // Lambert's cosine law
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    if(lambertian > 0.0) {
        vec3 R = reflect(-L, N);      // Reflected light vector
        vec3 V = normalize(-vertPos); // Vector to viewer
        // Compute the specular term
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, shininessVal);
    }
    gl_FragColor = vec4(Ka * ambientColor +
    Kd * lambertian * diffuseColor +
    Ks * specular * specularColor, 1.0);

    // only ambient
    if(mode == 2) gl_FragColor = vec4(Ka * ambientColor, 1.0);
    // only diffuse
    if(mode == 3) gl_FragColor = vec4(Kd * lambertian * diffuseColor, 1.0);
    // only specular
    if(mode == 4) gl_FragColor = vec4(Ks * specular * specularColor, 1.0);
}