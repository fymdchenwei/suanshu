import './style.css';
import { WebAudioPlayer } from './game/audio';
import { GameSession } from './game/session';
import { localStore } from './game/storage';
import { Stage } from './render/stage';
import { mountApp } from './ui/app';

const canvas = document.querySelector('#stage');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('missing canvas');
}

installGuards();

const audio = new WebAudioPlayer();
window.addEventListener('pointerdown', () => audio.unlock(), { capture: true });

try {
  const stage = new Stage(canvas);
  const session = new GameSession(localStore(), audio);
  mountApp(session, stage);
  canvas.dataset.ready = '1';
} catch (error) {
  const app = document.querySelector('#app');
  if (app) {
    app.textContent = '这个浏览器打不开 3D 画面，请换用 Safari。';
  }
  console.error(error);
}

function installGuards(): void {
  const block = (event: Event) => event.preventDefault();
  document.addEventListener('gesturestart', block);
  document.addEventListener('gesturechange', block);
  document.addEventListener('dblclick', block);
  document.addEventListener('contextmenu', block);
  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
        return;
      }
      const target = event.target;
      if (target instanceof Element && target.closest('.can-scroll')) return;
      event.preventDefault();
    },
    { passive: false },
  );
  const updateOrientation = () => {
    document.documentElement.classList.toggle('is-portrait', window.innerHeight > window.innerWidth);
  };
  updateOrientation();
  window.addEventListener('resize', updateOrientation);
  window.addEventListener('orientationchange', updateOrientation);
}
