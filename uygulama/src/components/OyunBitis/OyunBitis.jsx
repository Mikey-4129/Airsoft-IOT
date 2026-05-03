import { useGame } from '../../context/GameContext';
import './OyunBitis.css';

const MOD_ADLARI = { classic: 'Classic', hp: 'HP Modu', team: 'Takım', score: 'Skor', medic: 'Medic' };

export default function OyunBitis() {
  const { state, dispatch } = useGame();
  const { oyuncular, kazanan, oyunModu, oyunSuresi } = state;

  const formatSure = (sn) => {
    const d = Math.floor(sn / 60).toString().padStart(2, '0');
    const s = (sn % 60).toString().padStart(2, '0');
    return `${d}:${s}`;
  };

  const sirali = [...oyuncular].sort((a, b) => b.skor - a.skor || b.vurma - a.vurma);

  const takimAVurma = oyuncular.filter(o => o.takim === 'A').reduce((t, o) => t + o.vurma, 0);
  const takimBVurma = oyuncular.filter(o => o.takim === 'B').reduce((t, o) => t + o.vurma, 0);

  const kazananTakim = takimAVurma > takimBVurma ? 'A' : takimAVurma < takimBVurma ? 'B' : null;

  return (
    <div className="oyun-bitis">
      <div className="ob-confetti">
        {['🎉','⭐','🏆','🎯','💥'].map((e, i) => (
          <span key={i} className="ob-konfeti" style={{ animationDelay: `${i * 0.2}s`, left: `${10 + i * 18}%` }}>{e}</span>
        ))}
      </div>

      <div className="ob-header">
        <span className="ob-bitis-yazisi">OYUN BİTTİ</span>
        <span className="ob-sure">⏱ {formatSure(oyunSuresi)}</span>
      </div>

      {kazanan ? (
        <div className="ob-kazanan-kart bireysel">
          <span className="ob-kupa">🏆</span>
          <div className="ob-kazanan-ad">{kazanan.ad}</div>
          <div className="ob-kazanan-altyazi">Son ayakta kalan oyuncu!</div>
          <div className="ob-kazanan-stat">
            <span>🎯 {kazanan.vurma} vurma</span>
            <span>⭐ {kazanan.skor} puan</span>
          </div>
        </div>
      ) : kazananTakim ? (
        <div className="ob-kazanan-kart takim">
          <span className="ob-kupa">🏆</span>
          <div className="ob-kazanan-ad" style={{ color: kazananTakim === 'A' ? '#f87171' : '#60a5fa' }}>
            {kazananTakim === 'A' ? '🔴 Takım A' : '🔵 Takım B'} Kazandı!
          </div>
          <div className="ob-kazanan-stat">
            <span>🔴 Takım A: {takimAVurma} vurma</span>
            <span>🔵 Takım B: {takimBVurma} vurma</span>
          </div>
        </div>
      ) : (
        <div className="ob-kazanan-kart berabere">
          <span className="ob-kupa">🤝</span>
          <div className="ob-kazanan-ad">Berabere!</div>
        </div>
      )}

      <div className="ob-sirali">
        <h3>📊 Oyuncu İstatistikleri</h3>
        <div className="ob-tablo">
          <div className="ob-tablo-baslik">
            <span>#</span>
            <span>Oyuncu</span>
            <span>Takım</span>
            <span>🎯</span>
            <span>💥</span>
            <span>⭐ Puan</span>
            <span>Durum</span>
          </div>
          {sirali.map((o, i) => (
            <div key={o.id} className={`ob-tablo-satir ${i === 0 ? 'birinci' : ''}`}>
              <span className="ob-siralama">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
              <span className="ob-oyuncu-ad">{o.ad}</span>
              <span className={`ob-takim-badge ${o.takim === 'A' ? 'a' : 'b'}`}>{o.takim === 'A' ? '🔴' : '🔵'}</span>
              <span>{o.vurma}</span>
              <span>{o.vurulma}</span>
              <span className="ob-puan">{o.skor}</span>
              <span className={`ob-durum ${o.durum}`}>{o.durum === 'elendi' ? '💀' : '🟢'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-butonlar">
        <button className="ob-yeni-btn" id="btn-yeni-oyun" onClick={() => dispatch({ type: 'YENI_OYUN' })}>
          🔄 Yeni Oyun
        </button>
        <button className="ob-anasayfa-btn" id="btn-ana-ekran" onClick={() => dispatch({ type: 'EKRAN_DEGISTIR', payload: 'dashboard' })}>
          🏠 Ana Ekran
        </button>
      </div>
    </div>
  );
}
