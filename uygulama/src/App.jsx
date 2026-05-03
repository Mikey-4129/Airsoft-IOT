import { GameProvider, useGame } from './context/GameContext';
import Dashboard from './components/Dashboard/Dashboard';
import OyuncuYonetimi from './components/OyuncuYonetimi/OyuncuYonetimi';
import ModAyarlari from './components/ModAyarlari/ModAyarlari';
import CanliIzle from './components/CanliIzle/CanliIzle';
import OyunBitis from './components/OyunBitis/OyunBitis';
import NavBar from './components/NavBar/NavBar';

function AppInner() {
  const { state } = useGame();
  const { ekran } = state;

  return (
    <div className="app-kapsayici">
      <main className="app-main">
        {ekran === 'dashboard' && <Dashboard />}
        {ekran === 'oyuncular' && <OyuncuYonetimi />}
        {ekran === 'mod' && <ModAyarlari />}
        {ekran === 'canli' && <CanliIzle />}
        {ekran === 'bitis' && <OyunBitis />}
      </main>
      <NavBar />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
