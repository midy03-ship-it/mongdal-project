// scene-manager.js - 씬 전환 관리
const SceneManager = (() => {
  let current = null;
  const scenes = {};

  function register(name, scene) {
    scenes[name] = scene;
  }

  function go(name, params = {}) {
    if (current && scenes[current] && scenes[current].exit) {
      scenes[current].exit();
    }

    const el = document.getElementById('app');
    el.style.opacity = '0';

    setTimeout(() => {
      el.innerHTML = '';
      current = name;

      if (scenes[name] && scenes[name].enter) {
        scenes[name].enter(el, params);
      }

      el.style.opacity = '1';
    }, 200);
  }

  function getCurrent() { return current; }

  return { register, go, getCurrent };
})();
