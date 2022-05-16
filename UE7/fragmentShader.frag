precision mediump float;
varying float fragValue;
//uniform vec3 fragColor1;
//uniform vec3 fragColor2;



vec3 hsvToRGB(vec3 hsv){
    vec3 rgb;

    float h = hsv[0] * 360.0; // hue degree
    float s = hsv[1];
    float v = hsv[2];

    float hi = floor(h/60.);
    float f = (h/60.0) - hi;

    float p = v * (1. - s);
    float q = v * 1. - s * f;
    float t = v * (1. - s * (1. - f));

    float r;

    if (hi == 1.){
        rgb = vec3(q, v, p);
    }
    else if (hi == 2.){
        rgb = vec3(p, v, t);
    }
    else if (hi == 3.){
        rgb = vec3(p, q, v);
    }
    else if (hi == 4.){
        rgb = vec3(t, p, v);
    }
    else if (hi == 5.){
        rgb = vec3(v, p, q);
    }
    else{
        rgb = vec3(v, t, p);
    }

    return rgb;
}




void main(){

    vec3 color1HSV = vec3(fragValue,1.0,1.0);
    //vec3 color2HSV = vec3(60.0,1.0,1.0);


    vec3 color1RGB = hsvToRGB(color1HSV);
    //vec3 color2RGB = hsvToRGB(color2HSV);
    //vec3 fragColor = mix(color1RGB, color2RGB, fragValue);
    //fragColor[0] = smoothstep(0.4,0.6,fragColor[0]);
    //fragColor[1] = smoothstep(0.4,0.6,fragColor[1]);
    //fragColor[2] = smoothstep(0.4,0.6,fragColor[2]);
    gl_FragColor = vec4(color1RGB, 1.0);
}
