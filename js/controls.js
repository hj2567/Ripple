const BAUD_RATE = 9600;

// Joystick readings when it's resting in the center
const JOY_CENTER_X = 1910;
const JOY_CENTER_Y = 1887;
const JOY_DEADZONE = 0.08;
const JOY_SPEED = 0.02;

const input = {
  x: 0.5,
  y: 0.5,
  pot: 0.55,
  btn: false,
  serial: false
};

let aimX = 0.5;
let aimY = 0.5;
let lastBtn = false;

let serialPort = null;
let serialReader = null;

function handleInput() {
  // Gradually move the cursor toward the target position
  aimX += (input.x - aimX) * 0.25;
  aimY += (input.y - aimY) * 0.25;

  // Only create a ripple when the button is first pressed
  if (input.btn && !lastBtn) {
    drop(aimX, aimY, input.pot);
  }

  lastBtn = input.btn;

  const xValue = document.getElementById("x-value");
  const yValue = document.getElementById("y-value");
  const potValue = document.getElementById("pot-value");

  if (xValue) {
    xValue.textContent = aimX.toFixed(2);
  }
  
  if (yValue) {
    yValue.textContent = aimY.toFixed(2);
  }

  if (potValue) {
    potValue.textContent = Math.round(input.pot * 100) + "%";
  }

  const slider = document.getElementById("intensity-slider");
  
  if (slider) {
    slider.value = Math.round(input.pot * 100);
    slider.style.setProperty("--fill", `${input.pot * 100}%`);
    slider.disabled = input.serial;
  }
}

// Mouse controls when ESP32 is not connected
function mouseMoved() {
  if (!input.serial) {
    input.x = constrain(mouseX / width, 0, 1);
    input.y = constrain(mouseY / height, 0, 1);
  }
}

function mouseDragged() {
  mouseMoved();
}

function mousePressed(e) {
  if (input.serial) return;

  // Ignore clicks on the control panel
  if (e.target && e.target.closest("#hud")) return;

  mouseMoved();

  aimX = input.x;
  aimY = input.y;

  drop(input.x, input.y, input.pot);
}

function mouseWheel(e) {
  // Scroll to simulate turning the potentiometer
  if (!input.serial) {
    input.pot = constrain(input.pot - e.delta * 0.0008, 0, 1);
  }

  return false;
}

function updateJoystickPosition(joyX, joyY) {
  // Use the joystick's resting values; cursor stays put when released
  let dx = (joyX - JOY_CENTER_X) / 2048;
  let dy = (joyY - JOY_CENTER_Y) / 2048;

  if (Math.abs(dx) < JOY_DEADZONE) dx = 0;
  if (Math.abs(dy) < JOY_DEADZONE) dy = 0;

  input.x = constrain(input.x + dx * JOY_SPEED, 0.01, 0.99);
  input.y = constrain(input.y + dy * JOY_SPEED, 0.01, 0.99);
}

// Get the connection button and status text from the HTML
const connectButton = document.getElementById("connect");
const statusText = document.getElementById("status");

const intensitySlider = document.getElementById("intensity-slider");

intensitySlider.addEventListener("input", () => { if (!input.serial) { input.pot = Number(intensitySlider.value) / 100;}});

connectButton.onclick = async () => {
  if (serialPort) {
    await disconnectESP32();
    return;
  }

  if (!("serial" in navigator)) {
    statusText.textContent = "Web Serial requires Chrome.";
    return;
  }

  try {
    // Ask the user to select ESP32 port
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: BAUD_RATE });

    input.serial = true;
    input.btn = false;
    lastBtn = false;

    connectButton.textContent = "Disconnect ESP32";
    statusText.textContent = "ESP32 Connected";

    // For sensor readings
    await readSerial(serialPort);

  } catch (error) {
    console.error("ESP32 connection error:", error);

    statusText.textContent = "Connection error: " + error.message;

    input.serial = false;
    serialReader = null;
    serialPort = null;

    connectButton.textContent = "Connect ESP32";
  }
};

async function readSerial(port) {
  const decoder = new TextDecoder();
  serialReader = port.readable.getReader();

  let buffer = "";

  try {
    while (input.serial) {
      const { value, done } = await serialReader.read();

      if (done) break;

      buffer += decoder.decode(value, {stream: true});

      let newlineIndex;

      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        processSerialLine(line);
      }

      // Throw away unusually long input
      if (buffer.length > 1024) {
        buffer = "";
      }
    }
  } catch (error) {
    if (input.serial) {
      console.error("Serial reading error:", error);
      statusText.textContent = "Serial error: " + error.message;
    }
  } finally {
    // Release the reader so the port can be reused
    if (serialReader) {
      serialReader.releaseLock();
      serialReader = null;
    }

    input.serial = false;
    input.btn = false;
    lastBtn = false;

    connectButton.textContent = "Connect ESP32";
  }
}

function processSerialLine(line) {
  // Arduino sends joystick X, Y, button, and pot in this! order
  const parts = line.split(",");

  if (parts.length !== 4) return;

  const values = parts.map(Number);

  // Skip incomplete/invalid readings
  if (
    values.some(v => !Number.isFinite(v)) ||
    values.some(v => v < 0 || v > ADC_MAX)
  ) {
    return;
  }

  const [joyX, joyY, button, pot] = values;

  if (button !== 0 && button !== 1) return;

  updateJoystickPosition(joyX, joyY);

  input.btn = button === 1;
  input.pot = constrain(pot / ADC_MAX, 0, 1);
}


async function disconnectESP32() {
  input.serial = false;
  input.btn = false;
  lastBtn = false;

  if (serialReader) {
    try {
      await serialReader.cancel();
    } catch (error) {
      console.warn("Reader cancellation:", error);
    }
  }

  while (serialReader !== null) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  if (serialPort) {
    try {
      await serialPort.close();
    } catch (error) {
      console.warn("Port closing:", error);
    }
  }

  serialPort = null;

  connectButton.textContent = "Connect ESP32";
  statusText.textContent = "Mouse Mode";
}