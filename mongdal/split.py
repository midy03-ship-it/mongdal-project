"""
몽달퇴마록 분리 스크립트
usage: python split.py
  → mongdal-fixed.html → mongdal/ 하위 파일들로 분리

최초 1회만 실행. 이후 수정은 개별 파일에서 직접.
"""

import os, re

BASE    = os.path.dirname(os.path.abspath(__file__))
SRC     = os.path.join(BASE, '..', 'mongdal-fixed.html')

def write(rel_path, content):
    abs_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'  → {rel_path}')

def main():
    with open(SRC, encoding='utf-8') as f:
        lines = f.readlines()

    content = ''.join(lines)

    # ── CSS 추출 (line 11 ~ </style> 직전)
    css_match = re.search(r'<style>\n(.*?)\n</style>', content, re.DOTALL)
    if css_match:
        write('css/style.css', css_match.group(1))

    # ── JS 섹션 추출
    # <script> ~ </script> 사이 전체 JS 블록
    script_match = re.search(r'<script>\n(.*?)\n  </script>', content, re.DOTALL)
    if not script_match:
        print('ERROR: <script> 블록을 찾을 수 없습니다.')
        return

    js_block = script_match.group(1)

    # 섹션 경계를 찾아서 분리
    pattern = r'(// ── (js/[^\s]+) ──\n)'
    parts = re.split(pattern, js_block)

    # parts 구조: [앞부분, 구분자전체, 파일경로, 내용, 구분자전체, 파일경로, 내용, ...]
    sections = {}
    i = 0
    while i < len(parts):
        if i + 2 < len(parts) and re.match(r'// ── js/', parts[i]):
            path = parts[i + 1]
            body = parts[i + 2]
            sections[path] = body
            i += 3
        else:
            i += 1

    # re.split 방식 재시도 (더 안전한 방법)
    sections = {}
    markers = list(re.finditer(r'// ── (js/[^\s]+) ──\n', js_block))
    for idx, m in enumerate(markers):
        path = m.group(1)
        start = m.end()
        end = markers[idx + 1].start() if idx + 1 < len(markers) else None
        body = js_block[start:end]

        # 마지막 섹션(game.js) 뒤에 main 등록 코드가 붙어있으므로 제거
        if idx == len(markers) - 1:
            # SceneManager.register 이전까지만
            cut = body.find("\n\n\n    SceneManager.register(")
            if cut != -1:
                body = body[:cut]

        write(path, body)

    print('\n분리 완료!')
    print('이제 build.py 를 실행하면 mongdal-fixed.html 이 재생성됩니다.')

if __name__ == '__main__':
    main()
