from PIL import Image
img = Image.open("mongdal/image_total/sprites/effects/scythe_sub.png").convert("RGBA")
# 모서리 픽셀 확인
corners = [(0,0),(10,10),(img.width-1,0),(0,img.height-1),(img.width//2,0),(0,img.height//2)]
for x,y in corners:
    print(f"({x},{y}): {img.getpixel((x,y))}")
# 불투명 픽셀 비율
total = img.width * img.height
opaque = sum(1 for y in range(img.height) for x in range(img.width) if img.getpixel((x,y))[3]>0)
print(f"불투명 픽셀: {opaque}/{total} ({opaque/total*100:.1f}%)")
