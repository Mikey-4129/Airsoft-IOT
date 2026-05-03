import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import './OyuncuYonetimi.css';

const IR_IDLER = [
  { deger: 0b10101010, etiket: '0xAA' },
  { deger: 0b11001100, etiket: '0xCC' },
  { deger: 0b11110000, etiket: '0xF0' },
  { deger: 0b00110011, etiket: '0x33' },
  { deger: 0b01010101, etiket: '0x55' },
  { deger: 0b01111110, etiket: '0x7E' },
  { deger: 0b00001111, etiket: '0x0F' },
  { deger: 0b11100111, etiket: '0xE7' },
];

export default function OyuncuYonetimi() {
  const { state, dispatch } = useGame();
  const { oyuncular } = state;

  const [form, setForm] = useState({ ad: '', takim: 'A', irID: IR_IDLER[0].deger });
  const [hata, setHata] = useState('');

  const kullanilanIDler = oyuncular.map(o => o.irID);
  const mevcut = IR_IDLER.filter(id => !kullanilanIDler.includes(id.deger));

  const oyuncuEkle = () => {
    if (!form.ad.trim()) { setHata('Oyuncu adı boş olamaz.'); return; }
    if (oyuncular.length >= 32) { setHata('Maksimum 32 oyuncu kapasitesi doldu.'); return; }
    if (kullanilanIDler.includes(Number(form.irID))) { setHata('Bu IR ID zaten kullanımda.'); return; }
    dispatch({ type: 'OYUNCU_EKLE', payload: { ad: form.ad.trim(), takim: form.takim, irID: Number(form.irID) } });
    setForm({ ad: '', takim: 'A', irID: mevcut.length > 1 ? mevcut[1].deger : IR_IDLER[0].deger });
    setHata('');
  };

  const takimA = oyuncular.filter(o => o.takim === 'A');
  const takimB = oyuncular.filter(o => o.takim === 'B');

  return (
    <div className="oyuncu-yonetim">
      <div className="oy-header">
        <h2>👥 Oyuncu Yönetimi</h2>
        <span className="oy-sayac">{oyuncular.length} / 32</span>
      </div>

      <div className="oy-form">
        <h3>Yeni Oyuncu Ekle</h3>
        <div className="oy-form-row">
          <input
            id="input-oyuncu-adi"
            className="oy-input"
            placeholder="Oyuncu adı..."
            value={form.ad}
            onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && oyuncuEkle()}
            maxLength={20}
          />
          <select
            id="select-takim"
            className="oy-select"
            value={form.takim}
            onChange={e => setForm(f => ({ ...f, takim: e.target.value }))}
          >
            <option value="A">🔴 Takım A</option>
            <option value="B">🔵 Takım B</option>
          </select>
        </div>
        <div className="oy-form-row">
          <select
            id="select-ir-id"
            className="oy-select"
            value={form.irID}
            onChange={e => setForm(f => ({ ...f, irID: e.target.value }))}
          >
            {IR_IDLER.map(id => (
              <option key={id.deger} value={id.deger} disabled={kullanilanIDler.includes(id.deger)}>
                {id.etiket} {kullanilanIDler.includes(id.deger) ? '(Kullanımda)' : ''}
              </option>
            ))}
          </select>
          <button id="btn-oyuncu-ekle" className="oy-ekle-btn" onClick={oyuncuEkle}>
            ＋ Ekle
          </button>
        </div>
        {hata && <p className="oy-hata">{hata}</p>}
      </div>

      <div className="oy-takimlar">
        <TakimListesi takim="A" oyuncular={takimA} dispatch={dispatch} />
        <TakimListesi takim="B" oyuncular={takimB} dispatch={dispatch} />
      </div>
    </div>
  );
}

function TakimListesi({ takim, oyuncular, dispatch }) {
  const renk = takim === 'A' ? '#f87171' : '#60a5fa';
  const emoji = takim === 'A' ? '🔴' : '🔵';

  return (
    <div className="oy-takim-kart">
      <div className="oy-takim-baslik" style={{ borderColor: renk }}>
        <span>{emoji} Takım {takim}</span>
        <span className="oy-takim-sayi" style={{ color: renk }}>{oyuncular.length} Oyuncu</span>
      </div>
      {oyuncular.length === 0 && (
        <p className="oy-bos">Henüz oyuncu yok</p>
      )}
      {oyuncular.map(oyuncu => (
        <div key={oyuncu.id} className="oy-kart">
          <div className="oy-kart-sol">
            <span className="oy-avatar" style={{ background: renk + '22', color: renk }}>
              {oyuncu.ad.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="oy-ad">{oyuncu.ad}</div>
              <div className="oy-id">IR: {IR_IDLER.find(i => i.deger === oyuncu.irID)?.etiket}</div>
            </div>
          </div>
          <button
            className="oy-sil-btn"
            id={`btn-sil-${oyuncu.id}`}
            onClick={() => dispatch({ type: 'OYUNCU_SIL', payload: oyuncu.id })}
          >✕</button>
        </div>
      ))}
    </div>
  );
}
