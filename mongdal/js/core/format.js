// format.js - 숫자 표기 중앙 관리 (골드/재화/데미지 등 큰 수 k/m/b/t 압축 표기)
// [UPDATE 2026-08-06] 로그라이크 특성상 후반 수치가 기하급수적으로 커져서(대장간 강화 비용, 데미지 등)
// toLocaleString()만 쓰면 "20,480,000"처럼 자리수가 계속 늘어나 버튼/카드 밖으로 밀려나는 문제가 반복됨 —
// 1,000 미만은 그대로, 그 이상은 k(천)/m(백만)/b(십억)/t(조) 단위로 자동 압축.
const Format = (() => {
  function num(n) {
    n = Math.floor(n || 0);
    const sign = n < 0 ? '-' : '';
    n = Math.abs(n);
    if (n >= 1e12) return sign + (n / 1e12).toFixed(2) + 't';
    if (n >= 1e9)  return sign + (n / 1e9).toFixed(2) + 'b';
    if (n >= 1e6)  return sign + (n / 1e6).toFixed(2) + 'm';
    if (n >= 1e3)  return sign + (n / 1e3).toFixed(2) + 'k';
    return sign + n.toLocaleString();
  }
  return { num };
})();
