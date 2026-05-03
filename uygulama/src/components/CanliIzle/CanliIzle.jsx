import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOLGELER, BOLGE_HASAR, BOLGE_SKOR } from '../../context/GameContext';
import './CanliIzle.css';

const BOLGE_LISTESI = Object.values(BOLGELER);

export default function CanliIzle() {
  const { state, dispatch } = useGame();
  const { oyuncular, olaylar, oyunModu, oyunSuresi } = state;

  const [simTimer, setSimTimer] = useState(0);
  const timerRef = useRef(null);
  const [secilenBolge, setSecilenBolge] = useState(null); // simülasyon için

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSimTimer(t => t + 1);
      dispatch({ type: 'SURE_GUNCELLE', payload: oyunSuresi + 1 });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatSure = (sn) => {
    const d = Math.floor(sn / 60).toString().padStart(2, '0');
    const s = (sn % 60).toString().padStart(2, '0');
    return `${d}:${s}`;
  };

  const simuleVurulma = () => {
    const aktifler = oyuncular.filter(o => o.durum === 'aktif');
    if (aktifler.length < 2) return;
    const hedef = aktifler[Math.floor(Math.random() * aktifler.length)];
    const vuranlar = aktifler.filter(o => o.id !== hedef.id && o.takim !== hedef.takim);
    if (!vuranlar.length) return;
    const vuran = vuranlar[Math.floor(Math.random() * vuranlar.length)];
    const bolgeId = secilenBolge || BOLGE_LISTESI[Math.floor(Math.random() * BOLGE_LISTESI.length)].id;
    dispatch({ type: 'VURULMA_ISLE', payload: { hedefId: hedef.id, vuranId: vuran.id, bolgeId } });
  };

  const takimA = oyuncular.filter(o => o.takim === 'A');
  const takimB = oyuncular.filter(o => o.takim === 'B');

  return (
    <div className="canli-izle">
      <div className="ci-header">
        <div className="ci-sure">{formatSure(simTimer)}</div>
        <div className="ci-baslik">
          <span className="ci-canli-nokta">●</span> CANLI İZLEME
        </div>
        <button className="ci-durdur" id="btn-canli-durdur" onClick={() => dispatch({ type: 'OYUN_DURDUR' })}>
          🛑 Bitir
        </button>
      </div>

      {/* BÖLGE HASAR HARİTASI */}
      <BolgeHaritasi oyunModu={oyunModu} secilenBolge={secilenBolge} setSecilenBolge={setSecilenBolge} />

      <div className="ci-takimlar">
        <TakimPanel takim="A" renk="#f87171" oyuncular={takimA} />
        <div className="ci-vs">VS</div>
        <TakimPanel takim="B" renk="#60a5fa" oyuncular={takimB} />
      </div>

      {/* Simülasyon Butonu */}
      <div className="ci-sim-panel">
        <div className="ci-sim-bolge-sec">
          <span className="ci-sim-etiket">Simülasyon Bölgesi:</span>
          {BOLGE_LISTESI.map(b => (
            <button
              key={b.id}
              className={`ci-sim-bolge-btn ${secilenBolge === b.id ? 'secili' : ''}`}
              style={secilenBolge === b.id ? { borderColor: b.renk, color: b.renk } : {}}
              onClick={() => setSecilenBolge(prev => prev === b.id ? null : b.id)}
            >
              {b.ikon} {b.ad}
            </button>
          ))}
        </div>
        <button className="ci-sim-btn" id="btn-simulate" onClick={simuleVurulma}>
          🎯 Simüle Vurulma {secilenBolge ? `(${BOLGELER[secilenBolge].ad})` : '(Rastgele)'}
        </button>
      </div>

      {oyunModu === 'medic' && (
        <div className="ci-medic-panel">
          <h3>💊 Medic Paneli</h3>
          <div className="ci-medic-listesi">
            {oyuncular.filter(o => o.durum === 'elendi').map(o => (
              <button
                key={o.id}
                className="ci-medic-btn"
                id={`btn-canlandir-${o.id}`}
                onClick={() => dispatch({ type: 'CANLANDIR', payload: o.id })}
              >
                💚 {o.ad} Canlandır
              </button>
            ))}
            {oyuncular.filter(o => o.durum === 'elendi').length === 0 && (
              <span className="ci-medic-bos">Elenmiş oyuncu yok</span>
            )}
          </div>
        </div>
      )}

      <div className="ci-olaylar">
        <h3>📋 Olay Akışı</h3>
        <div className="ci-olay-listesi">
          {olaylar.length === 0 && <span className="ci-bos">Henüz olay yok...</span>}
          {olaylar.map(o => (
            <div key={o.id} className={`ci-olay ${o.tur}`}>
              <span className="ci-olay-zaman">{o.zaman}</span>
              <span className="ci-olay-mesaj">{o.mesaj}</span>
              {o.hasar && <span className="ci-olay-hasar" style={{ color: o.hasar >= 100 ? '#f43f5e' : o.hasar >= 70 ? '#fb923c' : '#60a5fa' }}>-{o.hasar} HP</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BÖLGE HASAR HARİTASI ──────────────────────────────────────
function BolgeHaritasi({ oyunModu, secilenBolge, setSecilenBolge }) {
  const mod = oyunModu || 'hp';
  return (
    <div className="bolge-harita">
      <h3 className="bolge-harita-baslik">🎯 Bölge Hasar Haritası</h3>
      <div className="bolge-vucut">
        {/* Görsel vücut şeması */}
        <div className="bolge-vucut-svg">
          {/* Sol Omuz */}
          <BolgeKart
            bolge={BOLGELER.solOmuz} mod={mod}
            secili={secilenBolge === 'solOmuz'}
            onClick={() => setSecilenBolge(p => p === 'solOmuz' ? null : 'solOmuz')}
            konum="sol-omuz"
          />
          {/* Sağ Omuz */}
          <BolgeKart
            bolge={BOLGELER.sagOmuz} mod={mod}
            secili={secilenBolge === 'sagOmuz'}
            onClick={() => setSecilenBolge(p => p === 'sagOmuz' ? null : 'sagOmuz')}
            konum="sag-omuz"
          />
          {/* Kalp */}
          <BolgeKart
            bolge={BOLGELER.kalp} mod={mod}
            secili={secilenBolge === 'kalp'}
            onClick={() => setSecilenBolge(p => p === 'kalp' ? null : 'kalp')}
            konum="kalp"
          />
          {/* Sol Ciğer */}
          <BolgeKart
            bolge={BOLGELER.solCiger} mod={mod}
            secili={secilenBolge === 'solCiger'}
            onClick={() => setSecilenBolge(p => p === 'solCiger' ? null : 'solCiger')}
            konum="sol-ciger"
          />
          {/* Sağ Ciğer */}
          <BolgeKart
            bolge={BOLGELER.sagCiger} mod={mod}
            secili={secilenBolge === 'sagCiger'}
            onClick={() => setSecilenBolge(p => p === 'sagCiger' ? null : 'sagCiger')}
            konum="sag-ciger"
          />
        </div>
      </div>
    </div>
  );
}

function BolgeKart({ bolge, mod, secili, onClick, konum }) {
  const hasar = BOLGE_HASAR[mod]?.[bolge.id] ?? 30;
  const skor = mod === 'score' ? BOLGE_SKOR[bolge.id] * 2 : BOLGE_SKOR[bolge.id];
  const tehlikeSeviye = hasar >= 100 ? 'olumcul' : hasar >= 70 ? 'agir' : 'hafif';

  return (
    <button
      className={`bolge-kart ${konum} ${secili ? 'secili' : ''} tehlike-${tehlikeSeviye}`}
      style={secili ? { borderColor: bolge.renk, boxShadow: `0 0 12px ${bolge.renk}66` } : {}}
      onClick={onClick}
    >
      <span className="bolge-ikon">{bolge.ikon}</span>
      <span className="bolge-ad">{bolge.ad}</span>
      <span className="bolge-hasar-goster" style={{ color: bolge.renk }}>-{hasar} HP</span>
      <span className="bolge-skor-goster">+{skor} Puan</span>
    </button>
  );
}

function TakimPanel({ takim, renk, oyuncular }) {
  const hayatta = oyuncular.filter(o => o.durum === 'aktif').length;
  return (
    <div className="ci-takim">
      <div className="ci-takim-baslik" style={{ color: renk }}>
        Takım {takim} <span className="ci-takim-hayatta">({hayatta} Aktif)</span>
      </div>
      {oyuncular.map(o => (
        <OyuncuKart key={o.id} oyuncu={o} renk={renk} />
      ))}
      {oyuncular.length === 0 && <span className="ci-bos-takim">Oyuncu yok</span>}
    </div>
  );
}

function OyuncuKart({ oyuncu, renk }) {
  const yuzde = Math.max(0, oyuncu.hp);
  const canRenk = yuzde > 60 ? '#4ade80' : yuzde > 30 ? '#facc15' : '#f87171';
  const elendi = oyuncu.durum === 'elendi';

  return (
    <div className={`ci-oyuncu-kart ${elendi ? 'elendi' : ''}`}>
      <div className="ci-oyuncu-ust">
        <div className="ci-avatar" style={{ background: renk + '22', color: renk, opacity: elendi ? 0.4 : 1 }}>
          {oyuncu.ad.charAt(0)}
        </div>
        <div className="ci-oyuncu-bilgi">
          <span className="ci-oyuncu-ad">{oyuncu.ad}</span>
          <div className="ci-oyuncu-istatistik">
            <span>🎯 {oyuncu.vurma}</span>
            <span>💥 {oyuncu.vurulma}</span>
            <span>⭐ {oyuncu.skor}</span>
          </div>
        </div>
        {elendi
          ? <span className="ci-elendi-etiketi">💀 ELENDİ</span>
          : <span className="ci-hp-sayi" style={{ color: canRenk }}>{oyuncu.hp}</span>
        }
      </div>
      {!elendi && (
        <div className="ci-can-bar-zemin">
          <div
            className="ci-can-bar-dolu"
            style={{ width: `${yuzde}%`, background: canRenk, transition: 'all 0.4s ease' }}
          />
        </div>
      )}
    </div>
  );
}
