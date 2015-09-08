attribute float displacement;
    
varying vec2 vUv;
varying vec3 vPosition;

void main( void ) {
    
    vUv = uv;
    vPosition = position;
    vPosition.z += displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1);
}