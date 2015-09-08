uniform float water_level;
uniform float time;

varying float vDisplacement;
varying vec2 vUv;
varying vec3 vPosition;

void main()
{
    // Base Color
    gl_FragColor = vec4(0.5, 0.7, 1.0, .7);
    
    float low_tide = sin(radians(time / 10.0)); // Mostly animation speed
    
    // Determine at what point the elevation must be for the foam to display
    low_tide -= 1.5;
    low_tide *= .3;
    
    if (vDisplacement > low_tide + water_level) {
        gl_FragColor = mix(
            gl_FragColor,
            vec4(1.0, 1.0, 1.0, 1.0),
            .6
        );
    }
}