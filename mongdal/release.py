"""
몽달퇴마록 배포 빌드 스크립트

[Python 경로]
C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe

[실행 예시]
"C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" release.py
"C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" release.py --version 0.2

[동작]
1. config.js 에서 DEV_MODE: true → false 로 교체
2. 버전명 붙인 HTML 빌드 (mongdal-v0.x.html)
3. config.js 원복 (DEV_MODE: false → true)
"""

import os, re, sys, shutil

BASE        = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE, 'js', 'data', 'config.js')

# ── 버전 파싱 ──
version = '0.1'
if '--version' in sys.argv:
    idx = sys.argv.index('--version')
    if idx + 1 < len(sys.argv):
        version = sys.argv[idx + 1]

OUT_NAME = f'mongdal-v{version}.html'
OUT_PATH = os.path.join(BASE, '..', OUT_NAME)

print(f'=== 몽달퇴마록 배포 빌드 v{version} ===')

# ── 1. config.js 읽기 ──
with open(CONFIG_PATH, encoding='utf-8') as f:
    config_original = f.read()

if 'DEV_MODE: true' not in config_original:
    print('[!] config.js 에 DEV_MODE: true 가 없습니다. 현재 상태로 빌드합니다.')
    needs_restore = False
else:
    needs_restore = True

# ── 2. DEV_MODE false 로 교체 ──
if needs_restore:
    config_release = config_original.replace('DEV_MODE: true', 'DEV_MODE: false')
    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        f.write(config_release)
    print('[OK] DEV_MODE: true -> false')

# ── 3. build.py 에서 OUT 경로만 교체해서 빌드 ──
build_path = os.path.join(BASE, 'build.py')
with open(build_path, encoding='utf-8') as f:
    build_src = f.read()

# OUT 경로를 버전 파일명으로 임시 교체
build_patched = build_src.replace(
    "os.path.join(BASE, '..', 'mongdal-light.html' if LIGHT_MODE else 'mongdal-fixed.html')",
    f"os.path.join(BASE, '..', '{OUT_NAME}')"
)

# 임시 빌드 스크립트 저장 및 실행
tmp_build = os.path.join(BASE, '_release_build_tmp.py')
with open(tmp_build, 'w', encoding='utf-8') as f:
    f.write(build_patched)

try:
    import subprocess
    python_exe = sys.executable
    result = subprocess.run([python_exe, tmp_build], cwd=BASE)
    if result.returncode != 0:
        print('[FAIL] 빌드 실패')
    else:
        size_mb = os.path.getsize(OUT_PATH) / 1024 / 1024
        print(f'[OK] 빌드 완료: {OUT_NAME} ({size_mb:.1f} MB)')
        print(f'     경로: {os.path.abspath(OUT_PATH)}')
finally:
    if os.path.exists(tmp_build):
        os.remove(tmp_build)
    # ── 4. config.js 원복 ──
    if needs_restore:
        with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
            f.write(config_original)
        print('[OK] DEV_MODE 원복 완료 (true)')

print(f'\n>>> {OUT_NAME} -> itch.io 업로드 준비 완료!')
