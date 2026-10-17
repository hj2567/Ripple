int xyzPins[] = {39, 32, 33};
int buttonPin = 2;
int potPin = 36;

void setup() {
  Serial.begin(9600);

  pinMode(xyzPins[2], INPUT_PULLUP);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  // Read the joystick, button, and potentiometer
  int xVal = analogRead(xyzPins[0]);
  int yVal = analogRead(xyzPins[1]);
  int buttonVal = digitalRead(buttonPin);
  int potVal = analogRead(potPin);

  // The button reads LOW when pressed
  int pressed = (buttonVal == LOW) ? 1 : 0;

  // Send the values to the browser
  Serial.printf("%d,%d,%d,%d", xVal, yVal, pressed, potVal);
  Serial.println();

  delay(100);
}