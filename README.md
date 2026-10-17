# Ripple: An Interactive Water Simulation

**Ripple** is an interactive water simulation controlled through a joystick, potentiometer, and button connected to an ESP32. Users can choose where a ripple begins, adjust its intensity, and watch waves spread and overlap across a virtual pool. The project uses a grid-based wave simulation and custom shaders to create water movement, distortion, and lighting effects. It also supports mouse controls when the ESP32 is disconnected.

## Project Demo

https://github.com/user-attachments/assets/49df94ef-5dd2-4cfe-a689-efe0d0cb02ff

## Recreation

### What You Need

**Hardware**
- LILYGO T-Display ESP32
- Breadboard and Jumper Wires
- Analog Joystick Module
- Potentiometer
- Push Button
- USB Cable

**Software**
- [Arduino IDE](https://www.arduino.cc/en/software)
- [Google Chrome](https://www.google.com/chrome/)
- [Python 3](https://www.python.org/downloads)

### Setup
1. Clone or download this repository.
2. Download and install the [Arduino IDE](https://www.arduino.cc/en/software).
3. Add ESP32 support to the IDE following the [Arduino-ESP32 installation guide](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html).
4. Assemble the circuit using a breadboard, jumper wires, joystick, potentiometer, and push button. Follow the wiring diagram below for the exact pin connections:
   
   <img width="650" height="auto" alt="IMG_3317" src="https://github.com/user-attachments/assets/4a134249-bb8a-4c20-a492-6869c2e8f223" />
6. Connect the ESP32 to your computer using a USB cable.
7. In the Arduino IDE, select the appropriate ESP32 board and serial port under **Tools**.
8. Open `arduino/Ripple/Ripple.ino` and upload the sketch to the ESP32.
9. Open the Serial Monitor at **9600 baud** to verify that the joystick, potentiometer, and button are sending readings.
10. Close the Serial Monitor before connecting the ESP32 through Chrome.

### Running the Project
1. Open Terminal and navigate to the downloaded `Ripple` folder.
2. Start a local web server:

   ```bash
    python3 -m http.server 8000
    ```
4. Open Google Chrome and navigate to `http://localhost:8000`.
5. Click **Connect ESP32** and select the ESP32 serial port.
6. Use the joystick to position the cursor, the potentiometer to adjust ripple intensity, and the button to create ripples.
7. Experiment with different ripple intensities and watch how the waves interact!

### Mouse Mode
The simulation can also run without the ESP32 connected.

1. Move the mouse to position the ripple cursor.
2. Click anywhere on the water to create a ripple.
3. Drag the intensity bar or use the mouse wheel to adjust ripple strength.

## Project Blog
For more about the concept, design decisions, and development process behind **Ripple**, visit my [Project Blog](https://plump-line-d3b.notion.site/Module-2-Breadboarding-Sensing-Serial-Communication-3dc28368cff9800aa84ce5578ead6f66?pvs=74).
