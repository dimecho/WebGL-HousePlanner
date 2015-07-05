attribute float displacement;

varying float vDisplacement;
varying vec2 vUv;
varying vec3 vPosition;

void main( void ) {
    
    vDisplacement = displacement;
    vUv = uv;
    vPosition = position;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1);
}