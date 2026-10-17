let sh, tex;

// Load the shaders that control the water's shape and appearance
function preload() {
  sh = loadShader('shaders/water.vert', 'shaders/water.frag');
}

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Set up the water grid and the image used to store its heights
  makeGrid();
  tex = createImage(GW, GH);
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight);
  
  // Rebuild the grid to match the new window dimensions
  makeGrid();
  tex = createImage(GW, GH);
}

function waterToTexture() {
  tex.loadPixels();

  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const i = y * GW + x;
      const o = i * 4;
      
      // Compare neighboring heights to estimate the water's slope
      const l = cur[x > 0 ? i - 1 : i];
      const r = cur[x < GW - 1 ? i + 1 : i];
      const u = cur[y > 0 ? i - GW : i]; 
      const d = cur[y < GH - 1 ? i + GW : i];

      // Store X slope, Y slope, and height in the RGB channels
      tex.pixels[o] = (constrain((l - r) * 2.2, -1, 1) * 0.5 + 0.5) * 255;
      tex.pixels[o + 1] = (constrain((u - d) * 2.2, -1, 1) * 0.5 + 0.5) * 255;
      tex.pixels[o + 2] = (constrain(cur[i], -1, 1) * 0.5 + 0.5) * 255;
      tex.pixels[o + 3] = 255;
    }
  }

  tex.updatePixels();
}

function draw() {
  handleInput();

  // Waves and update the texture each frame
  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    stepWater();
  }

  waterToTexture();

  // Keep the camera directly above the water surface
  const dist = (height / 2) / tan(PI / 6);
  camera(0, 0, dist, 0, 0, 0, 0, 1, 0);

  shader(sh);

  const short = min(width, height);

  // Pass the latest water data and cursor position to the shaders 
  sh.setUniform('uTex', tex);
  sh.setUniform('uTime', millis() / 1000);
  sh.setUniform('uLift', 0);
  sh.setUniform('uCursor', [aimX, aimY]);
  sh.setUniform('uRing', 0.012 + 0.035 * input.pot);
  sh.setUniform('uAspect', [width / short, height / short]);
  sh.setUniform('uTiles', TILES);

  // Draw the surface across the entire screen
  plane(width, height, 120, 120);
}