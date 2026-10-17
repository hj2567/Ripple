const GRID_W = 256;
const STEPS_PER_FRAME = 2;
const DAMPING = 0.9935;
const ADC_MAX = 4095;
const TILES = 14;

// Store the grid dimensinos and water heights
let GW, GH, cur, prev;

function makeGrid() {
  GW = GRID_W;

  // Match the grid's proportions to the browser window to keep ripples circular
  GH = round(GW * height / width);
  cur = new Float32Array(GW * GH);
  prev = new Float32Array(GW * GH);
}

function stepWater() {
  for (let y = 1; y < GH - 1; y++) {
    for (let x = 1; x < GW - 1; x++) {
      const i = y * GW + x;
      // Wave equation: next height using the four neighboring cells
      const v = (cur[i - 1] + cur[i + 1] + cur[i - GW] + cur[i + GW]) * 0.5 - prev[i];
      
      // Fade waves near the edges 
      const e = min(x, y, GW - 1 - x, GH - 1 - y);

      prev[i] = v * DAMPING * (e > 10 ? 1 : 0.86 + 0.014 * e);
    }
  }

  // Swap the arrays so the new heights become the current one
  [cur, prev] = [prev, cur];
}

function drop(ux, uy, strength) {
  // Convert the cursor position into a position on the grid
  const gx = ux * (GW - 1);
  const gy = uy * (GH - 1);

  // Stronger inputs creater a wider and deeper disturbance
  const sigma = 1.8 + 3.2 * strength;
  const depth = -(0.12 + 0.95 * strength);

  // Apply the disturbance to a small area 
  for (let y = max(1, floor(gy - 12)); y <= min(GH - 2, ceil(gy + 12)); y++) {
    for (let x = max(1, floor(gx - 12)); x <= min(GW - 2, ceil(gx + 12)); x++) {
      cur[y * GW + x] += depth * exp(-((x - gx) ** 2 + (y - gy) ** 2) / (2 * sigma * sigma));
    }
  }
}