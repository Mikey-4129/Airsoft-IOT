import { createContext, useContext, useReducer } from 'react';

const GameContext = createContext(null);

// ─── BÖLGE TANIMI ───────────────────────────────────────────────
export const BOLGELER = {
  kalp:       { id: 'kalp',       ad: 'Kalp',       ikon: '💔', piezoPin: 0, renk: '#f43f5e' },
  solCiger:   { id: 'solCiger',   ad: 'Sol Ciğer',  ikon: '🫁', piezoPin: 1, renk: '#fb923c' },
  sagCiger:   { id: 'sagCiger',   ad: 'Sağ Ciğer',  ikon: '🫁', piezoPin: 2, renk: '#fb923c' },
  solOmuz:    { id: 'solOmuz',    ad: 'Sol Omuz',   ikon: '💪', piezoPin: 3, renk: '#60a5fa' },
  sagOmuz:    { id: 'sagOmuz',    ad: 'Sağ Omuz',   ikon: '💪', piezoPin: 4, renk: '#60a5fa' },
};

// Her oyun modunda bölgenin verdiği hasar (0-100 can üzerinden)
export const BOLGE_HASAR = {
  classic: { kalp: 100, solCiger: 100, sagCiger: 100, solOmuz: 100, sagOmuz: 100 }, // hepsi anlık ölüm
  hp:      { kalp: 100, solCiger: 70,  sagCiger: 70,  solOmuz: 30,  sagOmuz: 30  },
  team:    { kalp: 100, solCiger: 70,  sagCiger: 70,  solOmuz: 30,  sagOmuz: 30  },
  score:   { kalp: 100, solCiger: 70,  sagCiger: 70,  solOmuz: 30,  sagOmuz: 30  },
  medic:   { kalp: 100, solCiger: 70,  sagCiger: 70,  solOmuz: 30,  sagOmuz: 30  },
};

// Her bölgenin vurana kazandırdığı skor puanı
export const BOLGE_SKOR = {
  kalp:     50,
  solCiger: 35,
  sagCiger: 35,
  solOmuz:  15,
  sagOmuz:  15,
};

const initialState = {
  ekran: 'dashboard', // dashboard | oyuncular | mod | canli | bitis
  oyunDurumu: 'bekleniyor', // bekleniyor | devam | bitti
  oyunModu: null,
  modAyarlari: {
    baslangicCan: 100,
    hasarMiktari: 50,
    sureLimiti: 0, // dakika, 0 = limitsiz
    dostAtesiEngelle: false,
    medikSinyali: false,
  },
  oyuncular: [],
  olaylar: [],
  oyunSuresi: 0,
  kazanan: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'EKRAN_DEGISTIR':
      return { ...state, ekran: action.payload };

    case 'OYUNCU_EKLE': {
      if (state.oyuncular.length >= 32) return state;
      const yeni = {
        id: Date.now(),
        ad: action.payload.ad,
        takim: action.payload.takim,
        irID: action.payload.irID,
        hp: state.modAyarlari.baslangicCan,
        skor: 0,
        vurma: 0,
        vurulma: 0,
        durum: 'bekliyor', // bekliyor | aktif | elenmiş
        bagliCihaz: null,
      };
      return { ...state, oyuncular: [...state.oyuncular, yeni] };
    }

    case 'OYUNCU_SIL':
      return { ...state, oyuncular: state.oyuncular.filter(o => o.id !== action.payload) };

    case 'OYUNCU_GUNCELLE':
      return {
        ...state,
        oyuncular: state.oyuncular.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload.veri } : o
        ),
      };

    case 'MOD_SEC':
      return { ...state, oyunModu: action.payload };

    case 'MOD_AYAR_GUNCELLE':
      return { ...state, modAyarlari: { ...state.modAyarlari, ...action.payload } };

    case 'OYUN_BASLAT': {
      const guncellenmis = state.oyuncular.map(o => ({
        ...o,
        hp: state.modAyarlari.baslangicCan,
        skor: 0,
        vurma: 0,
        vurulma: 0,
        durum: 'aktif',
      }));
      return { ...state, oyunDurumu: 'devam', oyuncular: guncellenmis, olaylar: [], oyunSuresi: 0, kazanan: null, ekran: 'canli' };
    }

    case 'OYUN_DURDUR':
      return { ...state, oyunDurumu: 'bitti', ekran: 'bitis' };

    case 'VURULMA_ISLE': {
      const { hedefId, vuranId, bolgeId } = action.payload;
      const mod = state.oyunModu || 'hp';

      // Bölgeye göre hasar hesapla
      const hasar = BOLGE_HASAR[mod]?.[bolgeId] ?? 30;
      // Bölgeye göre vurana skor ekle (score modunda daha fazla)
      const skorKazanim = mod === 'score'
        ? BOLGE_SKOR[bolgeId] * 2   // Score modunda puan 2x
        : BOLGE_SKOR[bolgeId];

      const bolge = BOLGELER[bolgeId];

      // Takım modu dost ateşi kontrolü
      const hedefOyuncu = state.oyuncular.find(o => o.id === hedefId);
      const vuranOyuncu = state.oyuncular.find(o => o.id === vuranId);
      if (state.modAyarlari.dostAtesiEngelle && hedefOyuncu?.takim === vuranOyuncu?.takim) {
        // Dost ateşi — işlem yapma
        return state;
      }

      let yeniOyuncular = state.oyuncular.map(o => {
        if (o.id === hedefId) {
          const yeniHp = Math.max(0, o.hp - hasar);
          return { ...o, hp: yeniHp, vurulma: o.vurulma + 1, durum: yeniHp <= 0 ? 'elendi' : 'aktif' };
        }
        if (o.id === vuranId) {
          return { ...o, skor: o.skor + skorKazanim, vurma: o.vurma + 1 };
        }
        return o;
      });

      const hedef = yeniOyuncular.find(o => o.id === hedefId);
      const vuran = yeniOyuncular.find(o => o.id === vuranId);
      const yeniOlay = {
        id: Date.now(),
        zaman: new Date().toLocaleTimeString('tr-TR'),
        mesaj: `${bolge.ikon} ${vuran?.ad || '?'} → ${hedef?.ad || '?'} [${bolge.ad}] ${hasar} hasar / +${skorKazanim} puan`,
        tur: 'vurus',
        bolge: bolgeId,
        hasar,
        skor: skorKazanim,
      };

      // Kazanan kontrolü
      let kazanan = null;
      let oyunBitti = false;
      if (mod === 'classic' || mod === 'hp') {
        const hayattakiler = yeniOyuncular.filter(o => o.durum === 'aktif');
        if (hayattakiler.length === 1) { kazanan = hayattakiler[0]; oyunBitti = true; }
        if (hayattakiler.length === 0) { oyunBitti = true; }
      } else if (mod === 'team') {
        const aktifA = yeniOyuncular.filter(o => o.takim === 'A' && o.durum === 'aktif');
        const aktifB = yeniOyuncular.filter(o => o.takim === 'B' && o.durum === 'aktif');
        if (aktifA.length === 0 || aktifB.length === 0) { oyunBitti = true; }
      }

      return {
        ...state,
        oyuncular: yeniOyuncular,
        olaylar: [yeniOlay, ...state.olaylar].slice(0, 50),
        kazanan,
        oyunDurumu: oyunBitti ? 'bitti' : state.oyunDurumu,
        ekran: oyunBitti ? 'bitis' : state.ekran,
      };
    }


    case 'SURE_GUNCELLE':
      return { ...state, oyunSuresi: action.payload };

    case 'YENI_OYUN':
      return { ...initialState, oyuncular: state.oyuncular };

    case 'CANLANDIR': {
      const olay = {
        id: Date.now(),
        zaman: new Date().toLocaleTimeString('tr-TR'),
        mesaj: `💚 ${state.oyuncular.find(o => o.id === action.payload)?.ad} canlandırıldı!`,
        tur: 'medic',
      };
      return {
        ...state,
        oyuncular: state.oyuncular.map(o =>
          o.id === action.payload ? { ...o, hp: 50, durum: 'aktif' } : o
        ),
        olaylar: [olay, ...state.olaylar].slice(0, 50),
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
