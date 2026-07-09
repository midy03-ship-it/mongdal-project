"""
sprites/icons/ 폴더 생성 및 스프라이트 시트에서 카드 아이콘 크롭 + 마젠타 제거
"""
from PIL import Image
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.join(BASE, "이미지 모음/무기 관련/보조무기 이미지 1.png")
ICONS_DIR = os.path.join(BASE, "mongdal/image_total/sprites/icons")
os.makedirs(ICONS_DIR, exist_ok=True)

# 시트 레이아웃: 5열 x 4행, 각 셀 201x262
MAPPING = [
    # (row, col, key)
    (0, 0, "bell"),
    (0, 1, "bead"),
    (0, 2, "thunder_drum"),
    (0, 3, "goblin_axe"),
    (0, 4, "water_jet"),
    (1, 0, "goblin_fire"),
    (1, 1, "poison_mist"),
    (1, 2, "holy_water"),
    (1, 3, "ghost_hand"),
    (1, 4, "lightning_trap"),
    (2, 0, "scythe_sub"),
    (2, 1, "ice_amulet"),
    (2, 2, "poison_needle"),
    (2, 3, "curse_doll"),
    (2, 4, "sealing_amulet"),
    (3, 0, "heal_incense"),
    (3, 1, "spirit_shield"),
    (3, 2, "hopaetag"),
    (3, 3, "karma_bead"),
    (3, 4, "shaman_drum"),
]

CW, CH = 201, 262
LABEL_H = int(CH * 0.30)  # 아래 텍스트 라벨 30% 제거

def remove_magenta(img):
    img = img.convert("RGBA")
    pix = img.load()
    w, h = img.size
    # 1차: 마젠타 픽셀 직접 제거
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a > 0 and r - g > 50 and b - g > 50 and r > 80:
                pix[x, y] = (0, 0, 0, 0)
    # 2차: anti-aliasing 제거 (5회 반복)
    for _ in range(5):
        tmp = img.copy()
        tp = tmp.load()
        for y in range(h):
            for x in range(w):
                r, g, b, a = pix[x, y]
                if a > 0 and r - g > 40 and b - g > 40 and r > 60:
                    for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < h and 0 <= nx < w and pix[nx, ny][3] == 0:
                            tp[x, y] = (0, 0, 0, 0)
                            break
        img = tmp
        pix = img.load()
    return img

sheet = Image.open(SHEET)

for row, col, key in MAPPING:
    x0, y0 = col * CW, row * CH
    # 텍스트 라벨(하단) 제거: 위 70% 만 사용
    crop_h = CH - LABEL_H
    cell = sheet.crop((x0, y0, x0 + CW, y0 + crop_h))
    # 위 행 텍스트(맨 위 작은 영역) 제거: 첫 행이 아니면 상단에 이전 행 라벨이 겹침
    # → 상단 LABEL_H 픽셀도 마젠타 처리로 자연스럽게 제거됨
    result = remove_magenta(cell)
    out_path = os.path.join(ICONS_DIR, key + ".png")
    result.save(out_path)
    # 마젠타 잔여 확인
    w, h = result.size
    cnt = sum(1 for y in range(h) for x in range(w)
              if result.getpixel((x,y))[3]>0
              and result.getpixel((x,y))[0]-result.getpixel((x,y))[1]>50
              and result.getpixel((x,y))[2]-result.getpixel((x,y))[1]>50)
    print(f"icons/{key}.png  {w}x{h}  마젠타잔여={cnt}")

print("\n완료: sprites/icons/ 생성됨")
