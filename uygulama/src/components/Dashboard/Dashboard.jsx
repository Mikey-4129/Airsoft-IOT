import { useGame } from '../../context/GameContext';
import './Dashboard.css';

const MODLAR = [
  { id: 'classic', ad: 'Classic', ikon: '💀', aciklama: 'Tek vurulma = eleme' },
  { id: 'hp', ad: 'HP Modu', ikon: '❤️', aciklama: '100 can, hasar aldıkça azalır' },
  { id: 'team', ad: 'Takım', ikon: '🛡️', aciklama: 'Dost ateşi geçersiz' },
  { id: 'score', ad: 'Skor', ikon: '🎯', aciklama: 'Her vurulma = puan' },
  { id: 'medic', ad: 'Medic', ikon: '💊', aciklama: 'Özel sinyal ile canlandırma' },
];

export default function Dashboard() {
  const { state, dispatch } = useGame();
  const { oyuncular, oyunModu, oyunDurumu } = state;

  const hazir = oyuncular.length >= 2 && oyunModu;
  const aktifOyuncu = oyuncular.filter(o => o.durum !== 'bekliyor').length;
  const secilenMod = MODLAR.find(m => m.id === oyunModu);

  return (
    <div className="dashboard">
      <div className="db-header">
        <div className="db-logo">
          <span className="db-logo-icon">🎮</span>
          <div>
            <h1>Airsoft IoT</h1>
            <p>Merkezi Komuta Sistemi</p>
          </div>
        </div>
        <div className={`db-durum-badge ${oyunDurumu}`}>
          {oyunDurumu === 'bekleniyor' && '⏸ Bekleniyor'}
          {oyunDurumu === 'devam' && '🟢 Oyun Devam Ediyor'}
          {oyunDurumu === 'bitti' && '🔴 Oyun Bitti'}
        </div>
      </div>

      <div className="db-istatistik">
        <div className="db-stat-kart">
          <span className="db-stat-sayi">{oyuncular.length}</span>
          <span className="db-stat-etiket">Kayıtlı Oyuncu</span>
        </div>
        <div className="db-stat-kart">
          <span className="db-stat-sayi">{aktifOyuncu}</span>
          <span className="db-stat-etiket">Aktif Oyuncu</span>
        </div>
        <div className="db-stat-kart">
          <span className="db-stat-sayi">{oyuncular.filter(o => o.takim === 'A').length}</span>
          <span className="db-stat-etiket">Takım A 🔴</span>
        </div>
        <div className="db-stat-kart">
          <span className="db-stat-sayi">{oyuncular.filter(o => o.takim === 'B').length}</span>
          <span className="db-stat-etiket">Takım B 🔵</span>
        </div>
      </div>

      <div className="db-mod-secim">
        <h2>Oyun Modu</h2>
        <div className="db-modlar">
          {MODLAR.map(mod => (
            <button
              key={mod.id}
              className={`db-mod-btn ${oyunModu === mod.id ? 'secili' : ''}`}
              onClick={() => dispatch({ type: 'MOD_SEC', payload: mod.id })}
            >
              <span className="db-mod-ikon">{mod.ikon}</span>
              <span className="db-mod-ad">{mod.ad}</span>
              <span className="db-mod-aciklama">{mod.aciklama}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="db-menu">
        <button className="db-menu-btn" id="btn-oyuncular" onClick={() => dispatch({ type: 'EKRAN_DEGISTIR', payload: 'oyuncular' })}>
          <span>👥</span><span>Oyuncu Yönetimi</span>
          <span className="db-menu-badge">{oyuncular.length}/32</span>
        </button>
        <button className="db-menu-btn" id="btn-ayarlar" onClick={() => dispatch({ type: 'EKRAN_DEGISTIR', payload: 'mod' })}>
          <span>⚙️</span><span>Mod Ayarları</span>
          {secilenMod && <span className="db-menu-badge">{secilenMod.ikon} {secilenMod.ad}</span>}
        </button>
        {oyunDurumu === 'devam' && (
          <button className="db-menu-btn canli-btn" id="btn-canli" onClick={() => dispatch({ type: 'EKRAN_DEGISTIR', payload: 'canli' })}>
            <span>📡</span><span>Canlı İzle</span>
            <span className="db-menu-badge pulse">● CANLI</span>
          </button>
        )}
      </div>

      <div className="db-butonlar">
        {oyunDurumu === 'bekleniyor' && (
          <button
            className={`db-basla-btn ${!hazir ? 'disabled' : ''}`}
            id="btn-oyun-baslat"
            onClick={() => hazir && dispatch({ type: 'OYUN_BASLAT' })}
          >
            {!hazir ? (oyuncular.length < 2 ? '⚠️ En az 2 oyuncu ekleyin' : '⚠️ Oyun modu seçin') : '🚀 Oyunu Başlat'}
          </button>
        )}
        {oyunDurumu === 'devam' && (
          <button className="db-durdur-btn" id="btn-oyun-durdur" onClick={() => dispatch({ type: 'OYUN_DURDUR' })}>
            🛑 Oyunu Durdur
          </button>
        )}
        {oyunDurumu === 'bitti' && (
          <button className="db-basla-btn" id="btn-sonuc" onClick={() => dispatch({ type: 'EKRAN_DEGISTIR', payload: 'bitis' })}>
            🏆 Sonuçları Gör
          </button>
        )}
      </div>
    </div>
  );
}
