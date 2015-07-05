uniform sampler2D texture_grass;
uniform sampler2D texture_bare;
uniform sampler2D texture_snow;

uniform bool show_ring;
uniform float ring_width;
uniform vec4 ring_color;
uniform vec3 ring_center;
uniform float ring_radius;

varying vec2 vUv;
varying vec3 vPosition;

float dist_falloff(float distance, float falloff) {
  float alpha = (falloff - distance) / falloff;
  if (alpha < 0.0) {
      alpha = 0.0;
  }
  if (alpha > 1.0) {
      alpha = 1.0;
  }
  return alpha;
}

vec3 layerColor(vec3 color1, vec3 color2, float alpha) {
  return mix(
      color1,
      color2,
      alpha
  );
}

void main()
{
  // Texture loading
  vec3 diffuseBare = texture2D( texture_bare, vUv ).rgb;
  vec3 diffuseGrass = texture2D( texture_grass, vUv ).rgb;
  vec3 diffuseSnow = texture2D( texture_snow, vUv ).rgb;
  
  //http://www.chandlerprall.com/2011/06/blending-webgl-textures/

  // Get base texture
  vec3 fragcolor = diffuseBare;
  
  // Grass texture
  fragcolor = layerColor(
    fragcolor,
    diffuseGrass,
    dist_falloff(abs(vPosition.z - 0.0), 7.0) // Start at 0 for 5 units
  );
  
  // Ice texture
  fragcolor = layerColor(
    fragcolor,
    diffuseSnow,
    dist_falloff(abs(vPosition.z - 7.0), 2.0) // Start at 5 for 2 units
  );
  
  gl_FragColor = vec4(fragcolor, 1.0);
  
  float distance = sqrt((vPosition.x - ring_center.x) * (vPosition.x - ring_center.x) + (vPosition.y - ring_center.y) * (vPosition.y - ring_center.y));
  
  // Ring
  if (show_ring == true && distance < ring_radius + ring_width / 2.0 && distance > ring_radius - ring_width / 2.0) {
      
    gl_FragColor.r += ring_color.r;
    gl_FragColor.b += ring_color.b;
    gl_FragColor.g += ring_color.g;
    gl_FragColor.a += ring_color.a;
    gl_FragColor = normalize(gl_FragColor);
  }
  
  // Grid overlay
  if (distance < 1.4) {
    float tiles = 0.4 / 20.0;
    float val = mod(vUv.y, tiles);
    if (mod(vUv.x, tiles) < .003 || mod(vUv.y, tiles) < .003) {
      gl_FragColor = gl_FragColor * (distance / 1.4);
      gl_FragColor.a = 1.0;
    }
  }
}