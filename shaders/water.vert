precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D uTex;
uniform float uLift;

varying vec2 vUv;

void main() {
  // Pass texture coordinates to the fragment shader
  vUv = aTexCoord;

  // Adjust the surface height using the water texture
  vec3 p = aPosition;
  p.z += (texture2D(uTex, aTexCoord).b - 0.5) * 2.0 * uLift;

  // Transform the position into screen coordinates
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(p, 1.0);
}