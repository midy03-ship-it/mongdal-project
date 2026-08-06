// audio.js - BGM 관리
const AudioManager = (() => {
  const BGM = {
    intro:  '__BGM_intro__',
    battle: '__BGM_battle__',
    lobby:  '__BGM_lobby__',
  };

  // [UPDATE 2026-07-18] 볼륨/음소거 설정을 localStorage에 저장 — 새로고침해도 이전 값을 그대로 이어받음
  const VOL_KEY   = 'mongdal_volume';
  const MUTED_KEY = 'mongdal_muted';

  let current = null;
  let currentKey = null;
  let audio = null;
  let muted = (() => {
    const saved = localStorage.getItem(MUTED_KEY);
    return saved === null ? true : saved === '1'; // 기본 음소거 (저장된 값 없을 때만)
  })();
  let volume = (() => {
    const saved = parseFloat(localStorage.getItem(VOL_KEY));
    return isNaN(saved) ? 0.5 : saved;
  })();

  function play(key) {
    if (currentKey === key) return;
    stop();
    if (muted || !BGM[key]) return;
    currentKey = key;
    audio = new Audio(BGM[key]);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => {});
  }

  function stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    currentKey = null;
  }

  function setMuted(val) {
    muted = val;
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
    if (muted) stop();
  }

  function setVolume(val) {
    volume = val;
    localStorage.setItem(VOL_KEY, String(volume));
    if (audio) audio.volume = volume;
  }

  function isMuted() { return muted; }
  function getVolume() { return volume; }

  return { play, stop, setMuted, setVolume, isMuted, getVolume };
})();
