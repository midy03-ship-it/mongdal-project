// audio.js - BGM 관리
const AudioManager = (() => {
  const BGM = {
    intro:  '__BGM_intro__',
    battle: '__BGM_battle__',
    lobby:  '__BGM_lobby__',
  };

  let current = null;
  let currentKey = null;
  let audio = null;
  let muted = true; // 기본 음소거 (일시적, 나중에 변경)
  let volume = 0.5;

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
    if (muted) stop();
  }

  function setVolume(val) {
    volume = val;
    if (audio) audio.volume = volume;
  }

  function isMuted() { return muted; }
  function getVolume() { return volume; }

  return { play, stop, setMuted, setVolume, isMuted, getVolume };
})();
