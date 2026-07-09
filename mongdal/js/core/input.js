// input.js - 키보드 + 터치 조이스틱
const Input = (() => {
  const keys = {};
  let joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
  const DEAD_ZONE = 10;
  const MAX_DIST  = 50;

  // ── 키보드 ──
  window.addEventListener('keydown', e => { keys[e.code] = true; });
  window.addEventListener('keyup',   e => { keys[e.code] = false; });

  // ── 터치 조이스틱 ──
  function onTouchStart(e) {
    const t = e.touches[0];
    if (t.clientY < 0) return; // 전체 화면 조이스틱
    joystick.active = true;
    joystick.startX = t.clientX;
    joystick.startY = t.clientY;
    joystick.dx = 0;
    joystick.dy = 0;
  }
  function onTouchMove(e) {
    e.preventDefault();
    if (!joystick.active) return;
    const t = e.touches[0];
    joystick.dx = t.clientX - joystick.startX;
    joystick.dy = t.clientY - joystick.startY;
  }
  function onTouchEnd() {
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
  }

  function attachTouch(el) {
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd);
    el.addEventListener('touchcancel',onTouchEnd);

    // 마우스 지원 (PC 테스트용 - 부유형 조이스틱)
    function onMouseDown(e) {
      if (e.clientY < 0) return;
      const rect = el.getBoundingClientRect();
      const sx = el.width  / rect.width;
      const sy = el.height / rect.height;
      joystick.active = true;
      joystick.startX = (e.clientX - rect.left) * sx;
      joystick.startY = (e.clientY - rect.top)  * sy;
      joystick.dx = 0; joystick.dy = 0;
      e.preventDefault();
    }
    function onMouseMove(e) {
      if (!joystick.active) return;
      const rect = el.getBoundingClientRect();
      const sx = el.width  / rect.width;
      const sy = el.height / rect.height;
      joystick.dx = (e.clientX - rect.left) * sx - joystick.startX;
      joystick.dy = (e.clientY - rect.top)  * sy - joystick.startY;
    }
    function onMouseUp() {
      joystick.active = false;
      joystick.dx = 0; joystick.dy = 0;
    }
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
  }

  // ── 방향 벡터 반환 (정규화) ──
  function getDir() {
    let dx = 0, dy = 0;

    // 키보드
    if (keys['ArrowLeft']  || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
    if (keys['ArrowUp']    || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown']  || keys['KeyS']) dy += 1;

    // 조이스틱
    if (joystick.active) {
      const dist = Math.hypot(joystick.dx, joystick.dy);
      if (dist > DEAD_ZONE) {
        const clamped = Math.min(dist, MAX_DIST);
        dx = (joystick.dx / dist) * (clamped / MAX_DIST);
        dy = (joystick.dy / dist) * (clamped / MAX_DIST);
      }
    }

    // 정규화
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    return { x: dx, y: dy };
  }

  // 조이스틱 UI 렌더 (캔버스에 그림)
  function drawJoystick(ctx, cw, ch) {
    if (!joystick.active) return;
    const bx = joystick.startX;
    const by = joystick.startY;
    const dist = Math.min(Math.hypot(joystick.dx, joystick.dy), MAX_DIST);
    const angle = Math.atan2(joystick.dy, joystick.dx);
    const hx = bx + Math.cos(angle) * dist;
    const hy = by + Math.sin(angle) * dist;

    // 베이스
    ctx.beginPath();
    ctx.arc(bx, by, MAX_DIST, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 핸들
    ctx.beginPath();
    ctx.arc(hx, hy, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212,160,23,0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,160,23,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return { getDir, attachTouch, drawJoystick };
})();
