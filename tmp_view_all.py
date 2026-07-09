from PIL import Image, ImageDraw, ImageFont
import os

# 셀별로 결합 이미지 저장 (3x7 그리드 형태로)
cells_dir = "C:/Temp/sheet_cells"
files = sorted(os.listdir(cells_dir))
# 각 파일 이름만 출력
for f in files:
    img = Image.open(os.path.join(cells_dir, f))
    # 이미지 첫 줄 텍스트 영역 보기
    print(f)
