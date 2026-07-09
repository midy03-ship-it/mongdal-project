from PIL import Image
import os

sheet = Image.open("이미지 모음/무기 관련/보조무기 이미지 1.png")
w, h = sheet.size
cols, rows = 5, 4
cw, ch = w//cols, h//rows
os.makedirs("C:/Temp/sheet_cells", exist_ok=True)
idx = 0
for r in range(rows):
    for c in range(cols):
        cell = sheet.crop((c*cw, r*ch, (c+1)*cw, (r+1)*ch))
        cell.save(f"C:/Temp/sheet_cells/{idx:02d}_r{r}c{c}.png")
        idx += 1
print("done")
