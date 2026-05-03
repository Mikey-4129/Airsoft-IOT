const int irPin = 2;
const int piezoPin = A0;

// LED Pinleri
const int ledR = 9;
const int ledG = 10;
const int ledB = 11;

byte sonOyuncu = 0;
bool kilitVar = false;
unsigned long kilitZamani = 0;
const unsigned long KILIT_SURESI = 2000; // 2 saniye (2000 ms)

int hp = 100; // Can oranini 100 yaptik

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT_PULLUP);
  
  pinMode(ledR, OUTPUT);
  pinMode(ledG, OUTPUT);
  pinMode(ledB, OUTPUT);
  
  // Baslangicta hepsi kapali
  digitalWrite(ledR, LOW);
  digitalWrite(ledG, LOW);
  digitalWrite(ledB, LOW);
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

// Kolay renk kontrol fonksiyonu
void renkAyarla(bool r, bool g, bool b) {
  digitalWrite(ledR, r ? HIGH : LOW);
  digitalWrite(ledG, g ? HIGH : LOW);
  digitalWrite(ledB, b ? HIGH : LOW);
}

void loop() {
  // Eğer can bittiyse sistem donar ve sadece kırmızı yanar
  if (hp <= 0) {
    renkAyarla(true, false, false); 
    return; // Döngüyü durdur
  }

  // Kilitlenme zaman asimi kontrolü (Sadece arkaplanda calisir, LED'e yansimaz)
  if (kilitVar && (millis() - kilitZamani > KILIT_SURESI)) {
    kilitVar = false;
    Serial.println("Kilitlenme suresi doldu, iptal edildi.");
  }

  // 🔹 IR ile kilitlenme
  if (digitalRead(irPin) == LOW) {
    sonOyuncu = readByte();
    kilitVar = true;
    kilitZamani = millis();

    Serial.print("Hedefe kilitlendi: ");
    Serial.println(oyuncuBul(sonOyuncu));
    Serial.println("------------------");

    delay(100);
  }

  // 🔹 Piezo ile vurulma
  int piezoDeger = analogRead(piezoPin);

  if (piezoDeger > 50 && kilitVar) {
    hp -= 50; // Her vurulmada can 50 azalir
    
    Serial.print("HEDEF VURULDU! Vuran: ");
    Serial.println(oyuncuBul(sonOyuncu));
    Serial.print("Kalan Can: ");
    Serial.println(hp);
    Serial.println("==================");

    // Vurulma efekti (1 saniye kirmizi flash)
    renkAyarla(true, false, false);
    delay(1000); 

    kilitVar = false; // Vurulma sonrasi kilidi kaldir
  }

  // Normal calisma durumunda LED guncellemesi
  if (hp > 0) {
    if (hp <= 50) {
      renkAyarla(false, false, true); // Can 50 veya altina dustuyse MAVI (Yarali)
    } else {
      renkAyarla(false, true, false); // Can 50'den buyukse YESIL (Saglikli)
    }
  }
}