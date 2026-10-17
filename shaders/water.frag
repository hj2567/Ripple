precision highp float;

varying vec2 vUv;

uniform sampler2D uTex;
uniform float uTime;
uniform float uRing;
uniform float uTiles;
uniform vec2 uCursor;
uniform vec2 uAspect;

// Simple hash and noise helpers for tile variation and moving caustics
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  // The texture stores slope in R and G, and height in B
  vec4 t = texture2D(uTex, vUv);
  vec2 slope = (t.rg - 0.5) * 2.0;
  float h = (t.b - 0.5) * 2.0;

  // Offset the pool floor texture slightly so the water feels refractive
  vec2 fuv = vUv + slope * 0.04;
  vec2 g = fuv * uAspect * uTiles;

  // Build the tiled pool floor
  vec2 cell = abs(fract(g) - 0.5);
  float grout = smoothstep(0.455, 0.49, max(cell.x, cell.y));
  float tone = noise(floor(g) * 0.7) * 0.5 + 0.5;

  vec3 col = mix(vec3(0.08, 0.43, 0.50), vec3(0.13, 0.59, 0.63), tone);
  col = mix(col, vec3(0.04, 0.22, 0.27), grout);

  // Add soft moving
  float c = noise(g * 1.6 + uTime * 0.3) * noise(g * 2.3 - uTime * 0.25);
  col += vec3(0.05, 0.09, 0.08) * smoothstep(0.2, 0.55, c);

  // Use the slope to build a surface normal for lighting
  vec3 N = normalize(vec3(slope * 1.6, 1.0));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L1 = normalize(vec3(-0.45, -0.55, 0.75));
  vec3 L2 = normalize(vec3(0.6, 0.4, 0.7));

  float spec = pow(max(dot(reflect(-L1, N), V), 0.0), 70.0) + 0.35 * pow(max(dot(reflect(-L2, N), V), 0.0), 40.0);

  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);

  // Brighten the water slightly
  col += vec3(0.07, 0.12, 0.11) * smoothstep(0.2, 0.55, c);
  col = mix(col, vec3(0.62, 0.84, 0.92), clamp(fres * 1.6, 0.0, 0.7));
  col += vec3(1.0, 0.98, 0.9) * spec * 0.9;
  col += vec3(0.7, 0.9, 0.95) * smoothstep(0.35, 1.0, h) * 0.18;

  // Draw the cursor ring and center point
  float d = length((vUv - uCursor) * uAspect);
  col = mix(col, vec3(1.0), smoothstep(0.0035, 0.0, abs(d - uRing)) * 0.55 + smoothstep(0.004, 0.0, d) * 0.9);

  gl_FragColor = vec4(col, 1.0);
}