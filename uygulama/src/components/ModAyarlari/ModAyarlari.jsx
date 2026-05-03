import { useGame } from '../../context/GameContext';
import './ModAyarlari.css';

const MOD_BILGI = {
  classic: {
    ad: 'Classic Mod', ikon: '💀',
    aciklama: 'Tek vurulma oyuncuyu eliyor. Hızlı ve agresif oyun tarzı.',
    ayarlar: ['sureLimiti'],
  },
  hp: {
    ad: 'HP Modu', ikon: '❤️',
    aciklama: 'Her vurulma can azaltır. Can sıfıra düşünce oyuncu elenir.',
    ayarlar: ['baslangicCan', 'hasarMiktari', 'sureLimiti'],
  },
  team: {
    ad: 'Takım Modu', ikon: '🛡️',
    aciklama: 'Dost ateşi geçersizdir. Sadece rakip takıma verilen hasar sayılır.',
    ayarlar: ['baslangicCan', 'hasarMiktari', 'dostAtesiEngelle', 'sureLimiti'],
  },
  score: {
    ad: 'Skor Modu', ikon: '🎯',
    aciklama: 'Her başarılı vurulma skor kazandırır. En yüksek skor kazanır.',
    ayarlar: ['sureLimiti'],
  },
  medic: {
    ad: 'Medic Modu', ikon: '💊',
    aciklama: 'Özel bir sinyal ile ölen oyuncular canlandırılabilir.',
    ayarlar: ['baslangicCan', 'hasarMiktari', 'medikSinyali', 'sureLimiti'],
  },
};

export default function ModAyarlari() {
  const { state, dispatch } = useGame();
  const { oyunModu, modAyarlari } = state;

  const bilgi = MOD_BILGI[oyunModu];

  const ayarGuncelle = (key, value) => {
    dispatch({ type: 'MOD_AYAR_GUNCELLE', payload: { [key]: value } });
  };

  return (
    <div className="mod-ayarlari">
      <h2>⚙️ Mod Ayarları</h2>

      {!oyunModu ? (
        <div className="mod-secilmedi">
          <span className="mod-secilmedi-ikon">🎮</span>
          <p>Henüz oyun modu seçilmedi.</p>
          <span>Ana ekrandan bir mod seçin.</span>
        </div>
      ) : (
        <>
          <div className="mod-bilgi-kart">
            <span className="mod-bilgi-ikon">{bilgi.ikon}</span>
            <div>
              <h3>{bilgi.ad}</h3>
              <p>{bilgi.aciklama}</p>
            </div>
          </div>

          <div className="mod-ayar-listesi">
            {bilgi.ayarlar.includes('baslangicCan') && (
              <AyarSatiri
                id="ayar-baslangic-can"
                etiket="Başlangıç Canı"
                aciklama="Oyuncuların başladığı can miktarı"
                tur="number"
                deger={modAyarlari.baslangicCan}
                min={10} max={1000} adim={10}
                onChange={v => ayarGuncelle('baslangicCan', Number(v))}
              />
            )}
            {bilgi.ayarlar.includes('hasarMiktari') && (
              <AyarSatiri
                id="ayar-hasar"
                etiket="Hasar Miktarı"
                aciklama="Her başarılı vurulmada düşen can"
                tur="number"
                deger={modAyarlari.hasarMiktari}
                min={1} max={modAyarlari.baslangicCan} adim={5}
                onChange={v => ayarGuncelle('hasarMiktari', Number(v))}
              />
            )}
            {bilgi.ayarlar.includes('sureLimiti') && (
              <AyarSatiri
                id="ayar-sure"
                etiket="Süre Limiti (dk)"
                aciklama="0 = Süresiz oyun"
                tur="number"
                deger={modAyarlari.sureLimiti}
                min={0} max={60} adim={5}
                onChange={v => ayarGuncelle('sureLimiti', Number(v))}
              />
            )}
            {bilgi.ayarlar.includes('dostAtesiEngelle') && (
              <AyarToggle
                id="ayar-dost-atesi"
                etiket="Dost Ateşi Engeli"
                aciklama="Aynı takımdan atış hasar vermez"
                deger={modAyarlari.dostAtesiEngelle}
                onChange={v => ayarGuncelle('dostAtesiEngelle', v)}
              />
            )}
            {bilgi.ayarlar.includes('medikSinyali') && (
              <AyarToggle
                id="ayar-medik"
                etiket="Medik Sinyali"
                aciklama="Özel IR sinyali ile canlandırmayı aktifleştirir"
                deger={modAyarlari.medikSinyali}
                onChange={v => ayarGuncelle('medikSinyali', v)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AyarSatiri({ id, etiket, aciklama, tur, deger, min, max, adim, onChange }) {
  return (
    <div className="ayar-satir">
      <div className="ayar-metin">
        <span className="ayar-etiket">{etiket}</span>
        <span className="ayar-aciklama">{aciklama}</span>
      </div>
      <input
        id={id}
        type={tur}
        className="ayar-input"
        value={deger}
        min={min}
        max={max}
        step={adim}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function AyarToggle({ id, etiket, aciklama, deger, onChange }) {
  return (
    <div className="ayar-satir">
      <div className="ayar-metin">
        <span className="ayar-etiket">{etiket}</span>
        <span className="ayar-aciklama">{aciklama}</span>
      </div>
      <button
        id={id}
        className={`ayar-toggle ${deger ? 'aktif' : ''}`}
        onClick={() => onChange(!deger)}
      >
        {deger ? 'Açık' : 'Kapalı'}
      </button>
    </div>
  );
}
