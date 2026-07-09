"""
sprite-config.js 에서 이미지 추출 → image_total/sprites/ 에 PNG 저장
sprite-config.js 의 base64 데이터를 플레이스홀더로 교체
build.py 가 플레이스홀더를 다시 base64로 채워서 HTML 번들링
"""
import re, base64, os

SRC_HTML   = r'C:\Users\MS\OneDrive\바탕 화면\mongdal-project\mongdal-fixed.html'
OUT_BASE   = r'C:\Users\MS\OneDrive\바탕 화면\mongdal-project\mongdal\image_total\sprites'
SPRITE_JS  = r'C:\Users\MS\OneDrive\바탕 화면\mongdal-project\mongdal\js\data\sprite-config.js'

# ── 1. 원본 HTML에서 sprite-config 섹션 추출 ──
with open(SRC_HTML, encoding='utf-8') as f:
    content = f.read()

m = re.search(
    r'// ── js/data/sprite-config\.js ──\n(.*?)// ── js/data/game-data\.js',
    content, re.DOTALL
)
if not m:
    print('ERROR: sprite-config 섹션을 찾을 수 없습니다')
    exit(1)

sprite_js = m.group(1)

# ── 2. 이미지 등장 순서 → 파일명 매핑 ──
# 구조 분석으로 확정된 순서 (총 95개)
ORDERED_NAMES = [
    # title (1)
    'title/title.png',
    # lobbyBg (1)
    'lobbyBg/wide.jpeg',
    # player (1)
    'player/player.png',
    # companions (5)
    'companions/dochi.png',
    'companions/aram.png',
    'companions/ggeogsoe.png',
    'companions/danbi.png',
    'companions/gaon.png',
    # enemies (18)
    'enemies/mangryeong.png',
    'enemies/wongwi.png',
    'enemies/hungry_soul.png',
    'enemies/gokseong.png',
    'enemies/corrupted.png',
    'enemies/cursed_doll.png',
    'enemies/tree_spirit.png',
    'enemies/masked_fox.png',
    'enemies/abyss_worm.png',
    'enemies/chaos_eye.png',
    'enemies/ghost.png',
    'enemies/water.png',
    'enemies/dokkaebi.png',
    'enemies/soul.png',
    'enemies/yakcha.png',
    'enemies/reaper.png',
    'enemies/maiden.png',
    'enemies/fox_mid.png',
    # lobbyNpcs (11)
    'lobbyNpcs/blacksmith.png',
    'lobbyNpcs/merchant.png',
    'lobbyNpcs/herbalist.png',
    'lobbyNpcs/shaman_grandma.png',
    'lobbyNpcs/house.png',
    'lobbyNpcs/wall.png',
    'lobbyNpcs/well.png',
    'lobbyNpcs/tomb.png',
    'lobbyNpcs/jangseung.png',
    'lobbyNpcs/sotdae.png',
    'lobbyNpcs/oldtree.png',
    # lobby.fire (5)
    'lobby/fire_0.png',
    'lobby/fire_1.png',
    'lobby/fire_2.png',
    'lobby/fire_3.png',
    'lobby/fire_4.png',
    # lobby.buildings (5)
    'lobby/building_0.png',
    'lobby/building_1.png',
    'lobby/building_2.png',
    'lobby/building_3.png',
    'lobby/building_4.png',
    # effects (15)
    'effects/proj_talisman.png',
    'effects/proj_lightning.png',
    'effects/proj_fire.png',
    'effects/proj_ice.png',
    'effects/proj_beam.png',
    'effects/proj_ghost.png',
    'effects/proj_circle.png',
    'effects/lightning_bolt.png',
    'effects/elec_effect.png',
    'effects/hit_normal.png',
    'effects/hit_explode.png',
    'effects/hit_freeze.png',
    'effects/hit_burn.png',
    'effects/hit_critical.png',
    # slots (3)
    'slots/main.png',
    'slots/sub.png',
    'slots/stat.png',
    # items (8)
    'items/xp_orb.png',
    'items/xp_crystal.png',
    'items/xp_flame.png',
    'items/gold.png',
    'items/magnet.png',
    'items/bomb.png',
    'items/potion.png',
    'items/bigGold.png',
    # weapons (9)
    'weapons/scythe_main.png',
    'weapons/bow.png',
    'weapons/staff.png',
    'weapons/talisman.png',
    'weapons/bell.png',
    'weapons/talisman_evo.png',
    'weapons/fan.png',
    'weapons/drum.png',
    'weapons/sword.png',
    # bosses (5)
    'bosses/mid_boss.png',
    'bosses/chapter_boss.png',
    'bosses/boss_ghost.png',
    'bosses/boss_maiden.png',
    'bosses/boss_tiger.png',
    # pets (8)
    'pets/hoya.png',
    'pets/crow.png',
    'pets/fox.png',
    'pets/turtle.png',
    'pets/chonggak.png',
    'pets/tuju.png',
    'pets/dokkaebi_pet.png',
    'pets/rabbit.png',
]

# ── 3. base64 이미지 순서대로 추출 ──
img_re = re.compile(r"data:image/(png|jpeg);base64,([A-Za-z0-9+/=\n\r]+?)(?:'|\")")
all_imgs = list(img_re.finditer(sprite_js))
print(f'이미지 발견: {len(all_imgs)}개, 이름 목록: {len(ORDERED_NAMES)}개')

if len(all_imgs) != len(ORDERED_NAMES):
    print(f'WARNING: 수가 다릅니다! 실제={len(all_imgs)}, 예상={len(ORDERED_NAMES)}')
    # 실제 수에 맞게 처리
    n = min(len(all_imgs), len(ORDERED_NAMES))
else:
    n = len(all_imgs)

saved_map = {}  # rel_path → abs_path

for i in range(n):
    img_m   = all_imgs[i]
    rel     = ORDERED_NAMES[i]
    ext     = img_m.group(1)
    data    = img_m.group(2).replace('\n','').replace('\r','')
    fpath   = os.path.join(OUT_BASE, rel)
    os.makedirs(os.path.dirname(fpath), exist_ok=True)
    try:
        with open(fpath, 'wb') as f:
            f.write(base64.b64decode(data + '=='))
        saved_map[rel] = fpath
        print(f'  저장: {rel}')
    except Exception as e:
        print(f'  ERROR {rel}: {e}')

# ── 4. sprite-config.js 에서 base64 → 플레이스홀더 교체 ──
# 뒤에서부터 교체해서 offset 문제 방지
new_js = sprite_js
for i in range(n-1, -1, -1):
    img_m = all_imgs[i]
    rel   = ORDERED_NAMES[i]
    key   = rel.replace('/', '_').replace('.png','').replace('.jpeg','')
    placeholder = f'__IMG_{key}__'
    # data:image/TYPE;base64,DATA 전체를 플레이스홀더로 교체
    start = img_m.start()
    end   = img_m.end() - 1  # 끝 따옴표 제외
    new_js = new_js[:start] + placeholder + new_js[end:]

with open(SPRITE_JS, 'w', encoding='utf-8') as f:
    f.write(new_js)

print(f'\n완료! {n}개 이미지 추출 및 sprite-config.js 플레이스홀더 교체 완료')
print(f'저장 위치: {OUT_BASE}')
