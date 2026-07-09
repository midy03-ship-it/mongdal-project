from PIL import Image
from collections import deque

img = Image.open("이미지 모음/무기 관련/공격 이미지 -  저승낫 이미지.png").convert("RGBA")
pix = img.load()
w, h = img.size

def is_white(r, g, b, a):
    return a > 0 and r > 200 and g > 200 and b > 200

# BFS flood fill from all 4 모서리
visited = [[False]*h for _ in range(w)]
queue = deque()
for sx, sy in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]:
    if is_white(*pix[sx,sy]) and not visited[sx][sy]:
        queue.append((sx,sy))
        visited[sx][sy] = True

while queue:
    x, y = queue.popleft()
    pix[x,y] = (0,0,0,0)
    for dx,dy in [(-1,0),(1,0),(0,-1),(0,1)]:
        nx, ny = x+dx, y+dy
        if 0<=nx<w and 0<=ny<h and not visited[nx][ny] and is_white(*pix[nx,ny]):
            visited[nx][ny] = True
            queue.append((nx,ny))

# anti-aliasing: 흰빛 남은 픽셀 중 투명 이웃 있으면 제거
for _ in range(5):
    tmp = img.copy()
    tp = tmp.load()
    for y in range(h):
        for x in range(w):
            r,g,b,a = pix[x,y]
            if a > 0 and r > 180 and g > 160 and b > 160:
                for dy,dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                    ny,nx = y+dy, x+dx
                    if 0<=ny<h and 0<=nx<w and pix[nx,ny][3]==0:
                        tp[x,y] = (0,0,0,0)
                        break
    img = tmp
    pix = img.load()

img.save("mongdal/image_total/sprites/effects/scythe_sub.png")

# 확인
opaque = sum(1 for y in range(h) for x in range(w) if img.getpixel((x,y))[3]>0)
print(f"불투명: {opaque}/{w*h} ({opaque/(w*h)*100:.1f}%)")
print(f"모서리: {img.getpixel((0,0))}, {img.getpixel((w-1,0))}")

thumb = img.copy(); thumb.thumbnail((300,300)); thumb.save("C:/Temp/scythe_preview2.png")
print("미리보기: C:/Temp/scythe_preview2.png")
