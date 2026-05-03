const int irPin = 4;

// Oyuncular
byte oyuncu1 = 0b10101010; // Ali
byte oyuncu2 = 0b11001100; // Veli
byte oyuncu3 = 0b11110000; // Ayse

byte aktifOyuncu = oyuncu1;
String oyuncuAdi = "Ali";

// byte aktifOyuncu = oyuncu2;
// String oyuncuAdi = "Veli";

// byte aktifOyuncu = oyuncu3;
// String oyuncuAdi = "Ayse";

void setup() {
  Serial.begin(115200);
  ledcSetup(0, 38000, 8);
  ledcAttachPin(irPin, 0);
}

void sendBit(bool bitVal) {
  ledcWrite(0, 128);

  if (bitVal)
    delayMicroseconds(600);
  else
    delayMicroseconds(1200);

  ledcWrite(0, 0);
  delayMicroseconds(600);
}

void sendByte(byte data) {
  for (int i = 0; i < 8; i++) {
    sendBit(data & (1 << i));
  }
}

void loop() {
  Serial.print("Hedefe kilitlenen: ");
  Serial.println(oyuncuAdi);

  sendByte(aktifOyuncu);

  delay(300);  // paket ayrımı
}