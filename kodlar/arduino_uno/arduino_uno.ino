const int irPin = 2;
const int piezoPin = A0;

byte sonOyuncu = 0;
bool kilitVar = false;

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT_PULLUP);
}

byte readByte() {
  byte data = 0;

  for (int i = 0; i < 8; i++) {
    while (digitalRead(irPin) == HIGH);

    unsigned long t = micros();
    while (digitalRead(irPin) == LOW);

    unsigned long duration = micros() - t;

    if (duration < 900)
      data |= (1 << i);
  }

  return data;
}

String oyuncuBul(byte id) {
  if (id == 0b10101010) return "Ali";
  if (id == 0b11001100) return "Veli";
  if (id == 0b11110000) return "Ayse";
  return "Bilinmeyen";
}

void loop() {

  // 🔹 IR ile kilitlenme
  if (digitalRead(irPin) == LOW) {
    sonOyuncu = readByte();
    kilitVar = true;

    Serial.print("Hedefe kilitlendi: ");
    Serial.println(oyuncuBul(sonOyuncu));
    Serial.println("------------------");

    delay(100);
  }

  // 🔹 Piezo ile vurulma
  int piezoDeger = analogRead(piezoPin);

  if (piezoDeger > 50 && kilitVar) {
    Serial.print("HEDEF VURULDU! Puan: ");
    Serial.println(oyuncuBul(sonOyuncu));
    Serial.println("==================");

    delay(500); // tekrar tetiklemeyi önler
  }
}