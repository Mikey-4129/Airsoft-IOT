// ──────────────────────────────────────────────
// AIRSOFT IOT — YELEK MODÜLÜ (Arduino Uno)
// Versiyon: 2.0 — 5 Bölgeli Piezo + IR + LED
// ──────────────────────────────────────────────

const int irPin = 2;

// LED Pinleri (PWM destekli)
const int ledR = 9;
const int ledG = 10;
const int ledB = 11;

// ─── 5 ADET PİEZO SENSÖR (Bölge Bazlı) ───────
// Piezo pinleri → Bölge ID'si eşleşmesi:
// A0 = Kalp         (hasar: HP modda 100, Ölümcül)
// A1 = Sol Ciğer    (hasar: HP modda 70)
// A2 = Sağ Ciğer    (hasar: HP modda 70)
// A3 = Sol Omuz     (hasar: HP modda 30)
// A4 = Sağ Omuz     (hasar: HP modda 30)

const int BOLGE_SAYI = 5;
const int piezoPin[BOLGE_SAYI] = { A0, A1, A2, A3, A4 };
const char* bolgeAd[BOLGE_SAYI] = { "Kalp", "Sol Ciger", "Sag Ciger", "Sol Omuz", "Sag Omuz" };

// Hasar değerleri (HP modunda)
const int bolgeHasar[BOLGE_SAYI] = { 100, 70, 70, 30, 30 };

// Piezo tetikleme eşiği (0-1023 arası, titreşim hassasiyeti)
// Kalp ve ciğer için daha hassas (daha az kuvvet gerekiyor)
const int piezoEsik[BOLGE_SAYI] = { 30, 40, 40, 60, 60 };

// ─── DURUM DEĞİŞKENLERİ ───────────────────────
byte sonOyuncu = 0;
bool kilitVar = false;
unsigned long kilitZamani = 0;
const unsigned long KILIT_SURESI = 2000; // ms

int hp = 100;

// ─── YARDIMCI FONKSİYONLAR ────────────────────
byte readByte() {
  byte data = 0;
  for (int i = 0; i < 8; i++) {
    while (digitalRead(irPin) == HIGH);
    unsigned long t = micros();
    while (digitalRead(irPin) == LOW);
    if (micros() - t < 900)
      data |= (1 << i);
  }
  return data;
}

String oyuncuBul(byte id) {
  if (id == 0b10101010) return "Ali";
  if (id == 0b11001100) return "Veli";
  if (id == 0b11110000) return "Ayse";
  if (id == 0b00110011) return "Oyuncu4";
  if (id == 0b01010101) return "Oyuncu5";
  return "Bilinmeyen";
}

void renkAyarla(bool r, bool g, bool b) {
  digitalWrite(ledR, r ? HIGH : LOW);
  digitalWrite(ledG, g ? HIGH : LOW);
  digitalWrite(ledB, b ? HIGH : LOW);
}

// ─── SETUP ────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT_PULLUP);

  pinMode(ledR, OUTPUT);
  pinMode(ledG, OUTPUT);
  pinMode(ledB, OUTPUT);

  // Başlangıç: hepsi kapalı
  renkAyarla(false, false, false);

  Serial.println("=== Airsoft IoT Yelek Modulu Hazir ===");
  Serial.println("Bolgeler: Kalp | Sol Ciger | Sag Ciger | Sol Omuz | Sag Omuz");
}

// ─── ANA DÖNGÜ ────────────────────────────────
void loop() {
  // ① Oyuncu elenmiş mi? → Sabit kırmızı, sistemi dondur
  if (hp <= 0) {
    renkAyarla(true, false, false);
    return;
  }

  // ② Kilitlenme zaman aşımı (arka planda çalışır, LED'e yansımaz)
  if (kilitVar && (millis() - kilitZamani > KILIT_SURESI)) {
    kilitVar = false;
    Serial.println("[Kilit] Süre doldu, kilit iptal edildi.");
  }

  // ③ IR ile kilitlenme kontrolü
  if (digitalRead(irPin) == LOW) {
    sonOyuncu = readByte();
    kilitVar = true;
    kilitZamani = millis();
    Serial.print("[IR] Kilitlendi → ");
    Serial.println(oyuncuBul(sonOyuncu));
    delay(50); // Çift okuma önlemi
  }

  // ④ 5 Bölge Piezo Taraması
  for (int i = 0; i < BOLGE_SAYI; i++) {
    int deger = analogRead(piezoPin[i]);

    if (deger > piezoEsik[i] && kilitVar) {
      // ──── VURULMA GERÇEKLEŞTİ ────
      int hasar = bolgeHasar[i];
      hp = max(0, hp - hasar);

      Serial.print("[VURULDU] Bolge: ");
      Serial.print(bolgeAd[i]);
      Serial.print(" | Hasar: ");
      Serial.print(hasar);
      Serial.print(" | Vuran: ");
      Serial.print(oyuncuBul(sonOyuncu));
      Serial.print(" | Kalan Can: ");
      Serial.println(hp);
      Serial.println("========================================");

      // Vurulma efekti — kırmızı flash
      renkAyarla(true, false, false);
      delay(800);

      kilitVar = false; // Kilidi kaldır (çift vurulmayı önle)

      // ── Bölgeye özel ek gecikme ──
      // Kalp = anlık elenme bekleme (daha uzun kırmızı)
      if (i == 0) delay(500); // Kalp vurulması
      break; // Aynı anda birden fazla bölge tetiklenmesin
    }
  }

  // ⑤ Normal LED durumu (oyuncu hayatta)
  if (hp > 0) {
    if (hp <= 50) {
      renkAyarla(false, false, true); // Can %50 ve altı → MAVİ (Yaralı uyarısı)
    } else {
      renkAyarla(false, true, false); // Can tam → YEŞİL (Sağlıklı)
    }
  }
}