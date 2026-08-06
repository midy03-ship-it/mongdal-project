# VFX 기술 노트

재사용 가능한 화면 연출 기법을 모아두는 문서. 시즌7(어계)·시즌8(황계) 쪽에서 비슷한 "현실 붕괴/왜곡" 계열
연출을 많이 쓸 것 같아서, 발견/구현한 기법을 여기 기록해두고 필요할 때 재사용한다.

새 기법을 추가할 때는 아래 항목 형식을 따를 것: 발견 경위 → 원리 → 재현 코드 → 적용 위치 제안.

---

## 1. 현실 붕괴(Reality Collapse) — 화면이 한 점으로 빨려들어가는 연출

**발견 경위 (2026-07-26)**

버그로 우연히 발견함. `boss.js`의 `_drawTelegraph()`가 `player`를 인자로 안 받는데 `homing_orbs`/
`chain_lightning` 패턴 예고선 코드가 `player.x/y`를 직접 참조해서 매 프레임 `player is not defined`
예외가 터졌음(원본 버그 수정 내역은 아래 "관련 커밋 메모" 참고). 이 크래시가 시각적으로 "화면이 좌상단으로
빨려들어가며 멈추는" 효과처럼 보였고, 사용자가 이 비주얼 자체를 마음에 들어해서 의도적 이펙트로 정리해둠.

**원리**

`render()`는 매 프레임 이렇게 시작한다:

```js
ctx.save();
ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip();
...
ctx.save(); ctx.scale(zoom,zoom);   // 월드 좌표계 진입
...(월드 오브젝트 그리기)...
ctx.restore();  // 줌 스케일 해제
ctx.restore();  // 클립 해제
```

프레임 도중 예외가 터지면 그 프레임의 `ctx.restore()` 두 줄이 실행되지 않는다. 다음 프레임이 다시
`ctx.save(); ctx.scale(zoom,zoom);`을 그 위에 얹어버리므로, `scale` 변환이 프레임마다 누적된다.
`ctx.scale()`은 캔버스 원점(좌상단 0,0)을 기준으로 확대/축소하기 때문에, 이 상태가 누적될수록 모든
오브젝트가 원점 쪽으로 점점 강하게 쪼그라들며 빨려들어가는 것처럼 보인다. 크래시가 반복될수록 배율이
기하급수적으로 커지므로 가속도가 붙는 느낌도 자연스럽게 나온다.

**의도적으로 재현하는 코드 (제어된 버전)**

버그는 "크래시로 인해 restore가 누락되며 무한 누적"되는 방식이라 재현 불가능한 사고였다. 실제로 쓰려면
`progress`(0→1) 값을 애니메이션으로 직접 제어하고, **반드시 save/restore 짝을 맞춰서** 구현한다.

```js
// progress: 0(정상) → 1(완전히 빨려들어감). 1→0으로 진행시키면 "복귀" 연출이 됨.
// targetX/Y: 빨려들어갈 지점의 월드 좌표(플레이어 위치, 보스 위치, 화면 중앙 등 자유롭게 지정)
function drawRealityCollapse(ctx, progress, targetX, targetY, drawWorldFn) {
  const scale = 1 + progress * 8; // 최대 배율은 연출 강도에 맞게 조정 (8~15 정도가 극적)
  ctx.save();
  ctx.translate(targetX, targetY);
  ctx.scale(scale, scale);
  ctx.translate(-targetX, -targetY);
  drawWorldFn(ctx); // 이 안에서 월드 콘텐츠(적/이펙트/배경 등)를 평소처럼 그림
  ctx.restore(); // 반드시 짝 맞춰서 해제 — 안 지키면 버그 재현됨
}
```

부가 연출 아이디어:
- `progress`가 커질수록 `ctx.globalAlpha`도 같이 줄여서 "빨려들어가며 흐려짐" 조합 가능.
- 완전히 빨려들어간 시점(`progress===1`)에 화면 전체 화이트/블랙 플래시를 넣고, 이후 `progress`를
  1→0으로 역재생하면 "붕괴 후 복귀" 완성.
- `targetX/Y`를 화면 중앙이 아니라 특정 오브젝트(보스, 법칙 아티팩트 등) 위치로 잡으면 "그 존재가 현실을
  빨아들인다"는 느낌을 줄 수 있음 — 시즌7(어계, 외신 테마)에 특히 잘 어울릴 것.
- 왜곡의 법칙(`law_distortion`)에서 이미 쓴 "캔버스 자기 자신을 확대 샘플링하는 볼록렌즈" 기법
  (`game.js`의 `_drawLawScreenEffects`, `ctx.drawImage(canvas, ...)`)과 조합하면 국소적 렌즈 왜곡 +
  전체 붕괴를 함께 연출할 수도 있음.

**적용 후보**
- 시즌7(어계) 보스 필살기 — 외신이 현실을 붕괴시키는 연출
- 시즌8(황계) 엔딩/전환 컷씬 — 반물질계로의 전이 연출
- 법칙 시스템에 "붕괴의 법칙" 강화판으로도 재활용 가능 (현재는 화면 전체 확대 블링크만 씀)

**관련 코드 위치**
- 버그 원인이었던 `_drawTelegraph()`: `mongdal/js/entities/boss.js`
- 참고할 기존 화면급 이펙트 패턴: `mongdal/js/scenes/game.js`의 `_drawLawFieldEffects`,
  `_drawLawScreenEffects` (2026-07-25 법칙 이펙트 작업에서 구현한 것들 — save/restore 짝 맞추는 예시로
  참고하기 좋음)
