# 몽달퇴마록 (Mongdal Toemarok) 프로젝트

## 프로젝트 개요
한국 무속/민화 세계관 기반 Vampire Survivors 스타일 모바일 로그라이트 게임.
- itch.io 배포 목표
- 플레이어 캐릭터: 애기씨 (Aegissi)
- 세계관: 귀인국(Gwi-In-Guk), 한국 민속 신화 모티브 (상세: `WORLDBUILDING.md`)
- 설계 문서: `MONGDAL_GDD.md` (세계관, 스테이지, 몬스터, 무기, 동료, 건물, 로비, 던전 모드 등)
- 작업 목록: `CLAUDE_CODE_TASK.md` (우선순위별 작업, 1개씩 순서대로 진행)

## 파일 구조 (2026-07-08부터 멀티파일 구조가 소스)

### 소스 (여기만 수정한다)
```
mongdal/js/...                    코드 소스 (모듈별 분리, build.py의 JS_ORDER 참고)
mongdal/image_total/sprites/...   이미지 실파일 (카테고리 폴더별 PNG)
mongdal/image_total/bgm/          BGM mp3
mongdal/css/style.css             스타일
mongdal/build.py                  소스 → 단일 HTML 번들링
```
- 이미지는 js에서 `__IMG_<폴더>_<파일명>__` 플레이스홀더로 참조 → 빌드 시 base64 인라인
- 신규 이미지 = `sprites/<폴더>/<키>.png` 저장 + `sprite-config.js`에 키 등록. **HTML에 base64 직접 삽입 금지**

### 빌드 산출물 (직접 수정 금지 — 빌드가 덮어씀)
```
mongdal-fixed.html   풀빌드 (배포·확인용, ~28MB)  ← python build.py
mongdal-light.html   경량빌드 (모바일 디버깅용, ~0.7MB, 이미지 1×1 치환/BGM 제거)  ← python build.py --light
```

**⚠️ HTML 직접 수정 금지 이유 (2026-07-08 실제 사고)**: 모바일 세션이 light.html에 직접 넣은 7/7 변경분이 js 소스에 없어서, 소스와 빌드가 어긋난 채 이틀 갔음. HTML에서 발견한 diff는 반드시 js 소스에 백포트 후 리빌드.
**모바일 세션 등에서 부득이 HTML을 직접 고친 경우**: 핸드오프 문서(예: `260707_MTOPC.md`)에 변경 내역 기록 → PC 세션에서 js 소스에 백포트가 최우선 작업.

**코드 수정 시 필수 규칙:**
```javascript
// 수정한 모든 코드에 날짜 주석 추가
// [UPDATE 2026-06-25] 수정 내용 한 줄 설명
```

## 핵심 작업 원칙
1. **코드 수정 규칙**: 사용자가 명시적으로 "반영해줘"라고 할 때만 실제 파일에 적용. 그 전까지는 분석·제안만.
2. **1개씩 작업**: 여러 작업을 한 번에 하지 않는다. CLAUDE_CODE_TASK.md 순서대로 1개씩.
3. **작업 후 확인**: 각 작업 완료 후 반드시 빌드 확인 (`build.py --light`).
4. **수정 전 항상 검증**:
   - JS 문법 체크: `node --check`로 `<script>` 내용 추출 후 검사
   - 이미지 교체 시 MD5 해시로 정확히 적용됐는지 재확인
   - 가능하면 Node.js로 핵심 로직 시뮬레이션 후 적용
5. **이미지 작업**: 도트 이미지 제공 시 배경 제거(flood fill, Python Pillow) → `mongdal/image_total/sprites/<폴더>/<키>.png` 저장 → `sprite-config.js` 키 등록까지 한 번에 처리. (HTML에 base64 직접 삽입 금지 — 원본 추적 불가 문제)
6. **디버깅 접근**: 버그 보고 시 먼저 원인을 시각적으로 확인 후 가설 수립. 짐작으로 코드 고치지 않는다.
7. **GDD 우선**: 코드 동작이 버그인지 의도적 변경인지 판단할 때 MONGDAL_GDD.md를 권위 있는 기준으로 사용.

## 자주 발생한 버그 패턴 (재발 방지용)
- **draw() 함수의 분기 우선순위 함정**: `Projectile.draw()`는 `if(this._weaponImg)...else if(simg)...` 구조. `EFFECT_IMGS`에 키가 있으면 무조건 첫 분기로 가므로, 두 번째 분기(`simg`/`PROJ_SPRITES`)에 효과를 추가해도 실행되지 않을 수 있음. 항상 EFFECT_IMGS 키 존재 여부부터 확인할 것.
- **이미지 누락 시 엉뚱한 이미지로 폴백**: `EFFECT_IMGS`에 특정 무기 키가 없으면 `PROJ_SPRITES`의 다른 매핑으로 폴백되어 전혀 다른 이미지가 쓰임 (예: 도깨비도끼가 저승낫과 같은 이미지를 썼던 사례, 성수가 부적 마법진을 썼던 사례, 독침이 부적을 썼던 사례). 이펙트가 이상하면 먼저 `EFFECT_IMGS`에 해당 키가 있는지부터 확인.
- **이미지 회전 기준 불일치**: 원본 도트 이미지가 "위쪽 기준"으로 그려진 경우가 많음 (화살, 독침 등). Canvas의 `Math.atan2(vy,vx)`는 "오른쪽이 0도"이므로, 이런 이미지는 `+90도` 보정이 필요. 저승낫처럼 반대 방향(180도 보정)인 경우도 있음. 새 이미지를 적용할 때마다 회전 기준을 다시 검증할 것 (Python으로 여러 각도 렌더링해서 비교).
- **좌표 기준점**: `player.x, player.y`는 캐릭터 발밑 기준. 회전형 무기(무당지팡이, 영혼낫)나 투사체 시작점은 몸통 중앙으로 보정 필요 (`y-20` 정도, 필요시 `x+8`).
- **동료 공격과 주인공 무기 분리**: `Projectile`에 `type`(시각효과/판정 로직용)과 `srcType`(이미지 소스 조회용)을 분리해서 사용. 동료(아람/도치/꺽쇠/가온)는 주인공 무기 이미지를 재사용하되 `type`은 `companion_*`로 별도 지정하여, 한쪽을 수정해도 다른 쪽이 깨지지 않도록 함.
- **데미지 판정과 시각효과는 별개 코드 경로**: 메인 루프의 `if(p.aoe>0)` 블록이 실제 데미지 판정을 처리하고, `draw()`의 스케일/알파 계산은 순수 시각효과임. 한쪽만 고치고 다른 쪽이 그대로인 경우가 있었으니, 데미지 관련 버그는 메인 루프 쪽도 같이 확인할 것.
- **배열 기반 리팩토링 시 update() 호출 누락 주의**: 보스 러시를 다중 보스 배열로 바꿀 때, `if(dead) continue`로 죽은 객체의 `update()` 자체를 건너뛰면 사망 연출 타이머(`deathT`)가 멈춰서 보상 로직이 영원히 실행 안 되는 버그가 발생했음. 죽은 객체도 `update()`는 호출하되 전투 로직만 건너뛰어야 함.
- **공격속도 vs 쿨타임 — 서로 다른 두 경로**: `player.totalSpd`(공격속도 스탯, `tempStats.spd`로 반영)와 `player._cdReduction`(쿨타임 감소, `_cdrCd`+`_cdrPet` 합산 후 상한 60%)은 완전히 별개 메커니즘. 각 무기 `fire()`에서 `spdScale=totalSpd/100`으로 쿨타임을 **나눗셈**(상한 없음), `_cdReduction`은 쿨타임에 **곱셈**(상한 60%)으로 적용됨. 예전엔 레벨업 스탯카드의 "공격속도"가 실수로 `_cdReduction` 풀에 얹혀서 "쿨타임"과 사실상 동일 효과였던 버그가 있었음(2026-07-15 수정). 공속 관련 신규 효과(펫/신목/레벨업 등) 추가 시 반드시 어느 경로(`tempStats.spd` vs `_cdrXxx`)로 연결할지 명확히 할 것 — 둘을 섞으면 재발함.

## 환경 설정 (Claude Code 전용, 현재 PC: midy0 계정 — 2026-07-08 갱신)
- **프로젝트 경로**: `D:\game make\mongdal-project`
- **Python**: `C:\Users\midy0\AppData\Local\Programs\Python\Python312\python.exe` (3.12, Pillow 설치됨). PATH의 `python`은 Windows Store 스텁일 수 있으니 전체 경로 사용 권장.
- **Node**: v24 LTS 설치됨. 새 셸에서 PATH 인식 안 되면 `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")` 후 사용.
- **빌드 명령 (PowerShell)**:
```powershell
$env:PYTHONUTF8 = "1"
$py = "C:\Users\midy0\AppData\Local\Programs\Python\Python312\python.exe"
Set-Location "D:\game make\mongdal-project\mongdal"
& $py build.py           # 풀빌드 → ../mongdal-fixed.html
& $py build.py --light   # 경량빌드 → ../mongdal-light.html
```
- (구 환경 참고: 예전 PC는 `C:\Claude\game make\...` 경로 + MS 계정 Python이었음 — 현재는 무효)

## 빌드/검증 명령어
```bash
# JS 문법 검증 (스크립트 블록 추출 후)
python3 -c "
import re
with open('mongdal-fixed.html') as f:
    content = f.read()
scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
with open('/tmp/extracted.js', 'w') as f:
    f.write(scripts[0])
"
node --check /tmp/extracted.js && echo "SYNTAX OK"
```

```python
# 이미지 추출 (base64 → PNG, 키 이름으로 검색)
import re, base64
with open('mongdal-fixed.html', 'r', encoding='utf-8') as f:
    content = f.read()
m = re.search(r"'KEY_NAME'\s*:\s*'data:image/png;base64,([A-Za-z0-9+/=]+)'", content)
data = base64.b64decode(m.group(1))
with open('/tmp/output.png', 'wb') as f:
    f.write(data)
```

## 작업 흐름 요약 (멀티파일 구조 — 2026-07-08 부활, 현재 표준)
1. 코드: `mongdal/js/` 해당 모듈 수정 (날짜 주석 필수)
2. 이미지: `mongdal/image_total/sprites/<폴더>/` 에 PNG 저장 + `js/data/sprite-config.js`에 키 등록
3. 빌드: `build.py` (풀) / `build.py --light` (경량)
4. 검증: 빌드된 HTML에서 `node --check` + 변경 키워드 grep 확인
- 알려진 무해 경고: `lobbyBg_wide`, `lobbyBuildings_*` 6종 이미지 없음 경고는 7/6 빌드부터 있던 기존 상태 (해당 키가 코드에서 실사용 안 되거나 폴백 있음 — 추후 정리 후보)

## 협업 스타일
- 사용자(민수)는 한국어로 소통.
- 버그 재현 조건을 사용자가 좁혀주면 Claude가 코드에서 원인을 확정하는 패턴.
- 모호한 요구사항은 짐작하지 말고 객관식 질문(2-4개 선택지)으로 확인 후 진행.
- 수정 전 항상 "이렇게 진행해도 될지" 확인받고, "반영해줘" 명시 후 실제 적용.
