"""
몽달퇴마록 빌드 스크립트

[모드]
  python build.py           → mongdal-fixed.html  (풀 빌드, 26MB+)
  python build.py --light   → mongdal-light.html  (이미지 없는 경량 빌드, ~500KB)
                              모바일 로직 테스트용. 이미지 자리에 컬러 박스 표시.

[Python 경로]
C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe

[실행 예시]
"C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" build.py
"C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" build.py --light
"""

import os, re, base64, sys

LIGHT_MODE = '--light' in sys.argv

BASE       = os.path.dirname(os.path.abspath(__file__))
OUT        = os.path.join(BASE, '..', 'mongdal-light.html' if LIGHT_MODE else 'mongdal-fixed.html')
IMG_BASE   = os.path.join(BASE, 'image_total')
SPRITE_DIR = os.path.join(IMG_BASE, 'sprites')
MON_DIR    = os.path.join(SPRITE_DIR, 'enemies')
BOSS_DIR   = os.path.join(SPRITE_DIR, 'bosses')
BGM_DIR    = os.path.join(IMG_BASE, 'bgm')

JS_ORDER = [
    'js/data/config.js',
    'js/data/sprite-config.js',
    'js/data/game-data.js',
    'js/data/monsters.js',
    'js/core/save.js',
    'js/core/lang.js',
    'js/core/audio.js',
    'js/core/unlock.js',
    'js/scenes/lang-select.js',
    'js/core/scene-manager.js',
    'js/core/input.js',
    'js/core/building-effects.js',
    'js/entities/player.js',
    'js/entities/enemy.js',
    'js/entities/companion-entity.js',
    'js/entities/boss.js',
    'js/entities/pet-entity.js',
    'js/systems/weapons.js',
    'js/systems/spawner.js',
    'js/systems/items.js',
    'js/scenes/intro-scene.js',
    'js/scenes/ending-scene.js',
    'js/scenes/dungeon-scene.js',
    'js/scenes/blacksmith-scene.js',
    'js/scenes/building-scene.js',
    'js/scenes/lobby.js',
    'js/scenes/stage-select.js',
    'js/scenes/player-scene.js',
    'js/scenes/character.js',
    'js/scenes/pet.js',
    'js/scenes/game.js',
    'js/scenes/shop-scene.js',
    'js/scenes/achievement-scene.js',
    'js/scenes/dev-scene.js',
]

MAIN_JS = """
    SceneManager.register('langSelect',  LangSelectScene);
    SceneManager.register('intro',       IntroScene);
    SceneManager.register('ending',      EndingScene);
    SceneManager.register('dungeon',     DungeonScene);
    SceneManager.register('blacksmith',  BlacksmithScene);
    SceneManager.register('building',    BuildingScene);
    SceneManager.register('lobby',       LobbyScene);
    SceneManager.register('stageSelect', StageSelectScene);
    SceneManager.register('playerScene', PlayerScene);
    SceneManager.register('character',   CharacterScene);
    SceneManager.register('pet',         PetScene);
    SceneManager.register('game',        GameScene);
    SceneManager.register('shop',        ShopScene);
    SceneManager.register('achievement', AchievementScene);
    SceneManager.register('dev',         DevScene);

    window.addEventListener('DOMContentLoaded', () => {
      initEnemyTypes();
      SpriteLoader.preloadAll();
            Lang.init(); // 저장된 언어 불러오기 (없으면 ko 기본)
      SceneManager.go('langSelect'); // 항상 언어 선택 먼저
    });
  """

def read(path):
    with open(os.path.join(BASE, path), encoding='utf-8') as f:
        return f.read()

def img_to_b64(fpath):
    ext = os.path.splitext(fpath)[1].lower()
    mime = 'image/jpeg' if ext in ('.jpg','.jpeg') else 'image/png'
    with open(fpath, 'rb') as f:
        data = base64.b64encode(f.read()).decode('ascii')
    return f'data:{mime};base64,{data}'

def make_placeholder_png(label='?'):
    """경량 빌드용: 1×1 투명 PNG를 base64로 반환 (이미지 없음 표시)"""
    # 1x1 투명 PNG (최소 크기)
    import struct, zlib
    def png_chunk(name, data):
        c = struct.pack('>I', len(data)) + name + data
        return c + struct.pack('>I', zlib.crc32(c[4:]) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0)
    idat = zlib.compress(b'\x00\x00\x00\x00\x00')
    png = b'\x89PNG\r\n\x1a\n' + png_chunk(b'IHDR', ihdr) + png_chunk(b'IDAT', idat) + png_chunk(b'IEND', b'')
    return 'data:image/png;base64,' + base64.b64encode(png).decode('ascii')

_PLACEHOLDER_PNG = None

def inject_images(js_code):
    """__IMG_xxx__ 플레이스홀더를 실제 base64 data URL 로 교체.
    LIGHT_MODE=True 이면 1x1 투명 PNG로 대체 (이미지 없는 경량 빌드)."""
    global _PLACEHOLDER_PNG
    if LIGHT_MODE:
        if _PLACEHOLDER_PNG is None:
            _PLACEHOLDER_PNG = make_placeholder_png()
        return re.sub(r'__IMG_([\w]+)__', lambda m: _PLACEHOLDER_PNG, js_code)

    def replacer(m):
        key = m.group(1)  # e.g. "enemies_mangryeong"
        # sprites 폴더: key를 경로로 변환 (첫 _ 를 / 로)
        rel = key.replace('_', '/', 1)  # enemies_mangryeong → enemies/mangryeong
        # 더 정확하게: 알려진 폴더 목록으로 매칭
        for folder in ['title','intro','lobbyBg','player','companions','enemies',
                       'lobbyBuildings','effects','icons','slots','items','weapons','bosses','pets',
                       'companion_effects','tiles','stage','ending','lobbyNpcs','worldMap']:
            prefix = folder + '_'
            if key.startswith(prefix):
                sub = key[len(prefix):]
                rel = f'{folder}/{sub}'
                break
        # 확장자 후보
        for ext in ['.png', '.jpeg', '.jpg']:
            fpath = os.path.join(SPRITE_DIR, rel + ext)
            if os.path.exists(fpath):
                return img_to_b64(fpath)
        print(f'  WARNING: 이미지 없음 → {key}')
        return m.group(0)

    return re.sub(r'__IMG_([\w]+)__', replacer, js_code)

def inject_bgm(js_code):
    """__BGM_xxx__ 플레이스홀더를 base64 오디오 data URL로 교체.
    LIGHT_MODE=True 이면 빈 문자열로 대체 (오디오 없는 경량 빌드)."""
    if LIGHT_MODE:
        return re.sub(r"'__BGM_([\w]+)__'", "''", js_code)
    def replacer(m):
        key = m.group(1)  # e.g. "intro", "battle", "lobby"
        fpath = os.path.join(BGM_DIR, key + '.mp3')
        if os.path.exists(fpath):
            with open(fpath, 'rb') as f:
                data = base64.b64encode(f.read()).decode('ascii')
            return f'data:audio/mpeg;base64,{data}'
        print(f'  WARNING: BGM 없음 → {key}')
        return m.group(0)
    return re.sub(r'__BGM_([\w]+)__', replacer, js_code)

def inject_monster_images(js_code):
    """monsters/, bosses/ 폴더의 신규 이미지도 주입.
    LIGHT_MODE=True 이면 1x1 투명 PNG로 대체."""
    if LIGHT_MODE:
        return re.sub(r'__MON_([\w]+)__', lambda m: _PLACEHOLDER_PNG or make_placeholder_png(), js_code)
    def replacer(m):
        key = m.group(1)  # e.g. "ch1_mon1", "ch1_boss", "ch1_midboss"
        for folder, fdir in [('monsters', MON_DIR), ('bosses', BOSS_DIR)]:
            fpath = os.path.join(fdir, key + '.png')
            if os.path.exists(fpath):
                return img_to_b64(fpath)
        print(f'  WARNING: 몬스터 이미지 없음 → {key}')
        return m.group(0)
    return re.sub(r'__MON_([\w]+)__', replacer, js_code)

def build():
    css = read('css/style.css')

    js_parts = []
    for path in JS_ORDER:
        content = read(path)
        # sprite-config.js 의 플레이스홀더 교체
        if path == 'js/data/sprite-config.js':
            content = inject_images(content)
            content = inject_monster_images(content)
        # weapons.js 의 EFFECT_IMGS 플레이스홀더 교체
        if path == 'js/systems/weapons.js':
            content = inject_images(content)
        # audio.js 의 BGM 플레이스홀더 교체
        if path == 'js/core/audio.js':
            content = inject_bgm(content)
        js_parts.append(f'// ── {path} ──\n{content}')

    js_all = '\n\n'.join(js_parts)

    SCALE_JS = """
  // ── 게임 고정 해상도 스케일링 ──
  (function() {
    const GAME_W = 390, GAME_H = 844;
    const container = document.getElementById('game-container');

    function applyScale() {
      const ww = window.innerWidth, wh = window.innerHeight;
      const scale = Math.min(ww / GAME_W, wh / GAME_H);
      container.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    }

    applyScale();
    window.addEventListener('resize', applyScale);
  })();
"""

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#0a0814">
  <title>몽달퇴마록</title>
  <style>
{css}
  /* 게임 컨테이너 위치 보정 */
  #game-container {{
    position: fixed;
    left: 50%;
    top: 50%;
    transform-origin: center center;
  }}
</style>
</head>
<body>
  <div id="game-container">
    <div id="app"></div>
  </div>
  <script>
{SCALE_JS}
{js_all}

{MAIN_JS}
  </script>
</body>"""

    out_name = os.path.basename(OUT)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)

    size_mb = os.path.getsize(OUT) / 1024 / 1024
    mode_label = '[LIGHT]' if LIGHT_MODE else '[FULL]'
    print(f'빌드 완료 {mode_label}: {out_name} ({size_mb:.1f} MB)')

if __name__ == '__main__':
    build()

