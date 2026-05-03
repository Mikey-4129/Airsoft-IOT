import { useGame } from '../../context/GameContext';
import './NavBar.css';

const NAVLAR = [
  { id: 'dashboard', ikon: '🏠', etiket: 'Ana Sayfa' },
  { id: 'oyuncular', ikon: '👥', etiket: 'Oyuncular' },
  { id: 'mod', ikon: '⚙️', etiket: 'Mod' },
  { id: 'canli', ikon: '📡', etiket: 'Canlı' },
];

export default function NavBar() {
  const { state, dispatch } = useGame();
  const { ekran, oyunDurumu } = state;

  if (ekran === 'bitis') return null;

  return (
    <nav className="navbar">
      {NAVLAR.map(nav => {
        const canliKilitli = nav.id === 'canli' && oyunDurumu !== 'devam';
        return (
          <button
            key={nav.id}
            id={`nav-${nav.id}`}
            className={`nav-btn ${ekran === nav.id ? 'aktif' : ''} ${canliKilitli ? 'kilitli' : ''}`}
            onClick={() => !canliKilitli && dispatch({ type: 'EKRAN_DEGISTIR', payload: nav.id })}
          >
            <span className="nav-ikon">{nav.ikon}</span>
            <span className="nav-etiket">{nav.etiket}</span>
            {nav.id === 'canli' && oyunDurumu === 'devam' && (
              <span className="nav-canli-nokta" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
