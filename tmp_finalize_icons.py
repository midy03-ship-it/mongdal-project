"""
1. 주무기 카드 아이콘 → icons/ 복사
2. 저승낫 인게임 이미지 → effects/scythe_sub.png 교체 (마젠타 제거)
"""
from PIL import Image
import os, shutil

BASE = os.path.dirname(os.path.abspath(__file__))
EFFECTS = os.path.join(BASE, "mongdal/image_total/sprites/effects")
ICONS   = os.path.join(BASE, "mongdal/image_total/sprites/icons")
SRC_DIR = os.path.join(BASE, "이미지 모음/무기 관련")

# 1. 주무기 카드 아이콘: effects/ → icons/ 복사
main_weapons = ["talisman", "sword", "bow", "staff", "scythe_main"]
for key in main_weapons:
    src = os.path.join(EFFECTS, key + ".png")
    dst = os.path.join(ICONS, key + ".png")
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"복사: effects/{key}.png → icons/{key}.png")
    else:
        print(f"없음: effects/{key}.png")

# 2. 저승낫 인게임 이미지 처리
scythe_src = os.path.join(SRC_DIR, "공격 이미지 -  저승낫 이미지.png")
img = Image.open(scythe_src).convert("RGBA")
w, h = img.size
print(f"\n저승낫 원본: {w}x{h}")

# 마젠타 제거
def remove_magenta(img):
    img = img.convert("RGBA")
    pix = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a > 0 and r - g > 50 and b - g > 50 and r > 80:
                pix[x, y] = (0, 0, 0, 0)
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

result = remove_magenta(img)
cnt = sum(1 for y in range(result.height) for x in range(result.width)
          if result.getpixel((x,y))[3]>0
          and result.getpixel((x,y))[0]-result.getpixel((x,y))[1]>50
          and result.getpixel((x,y))[2]-result.getpixel((x,y))[1]>50)
print(f"저승낫 마젠타 잔여: {cnt}")

out = os.path.join(EFFECTS, "scythe_sub.png")
result.save(out)
print(f"저장: effects/scythe_sub.png ({result.width}x{result.height})")

# 저장 확인용 썸네일
thumb = result.copy()
thumb.thumbnail((200, 200))
thumb.save("C:/Temp/scythe_sub_preview.png")
print("미리보기: C:/Temp/scythe_sub_preview.png")
