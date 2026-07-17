// promo-codes.js - 프로모션 코드 시스템
// [UPDATE 2026-07-15] 260715_MTOPC.md 2번: 스테이지1~20 보상 시스템 추가 이전 클리어자 소급 보상용.
// 민수 확인: "스테이지19까지만 깬 사람"처럼 애매하게 걸치면 억울하니, 고정값이 아니라
// "이미 클리어한 스테이지분만" beginnerGiftFor()로 합산 지급 — 못 깬 스테이지는 나중에 실제 클리어 시 정상 지급됨.

const PROMO_CODES = {
  // [UPDATE 2026-07-15] 최초 리딤 코드 — 게임 이름 그대로 "MONGDAL"로 확정
  MONGDAL: {
    desc: '초반 스테이지 보상 시스템 추가 이전 클리어자 소급 보상',
    oneTimeGlobal: true,
    computeReward(saveData) {
      const parts = [];
      for (let stageId = 1; stageId <= 20; stageId++) {
        if (!Unlock.cleared(saveData, stageId)) continue;
        for (const p of beginnerGiftFor(stageId)) {
          const existing = parts.find(x => x.key === p.key);
          if (existing) existing.amount += p.amount;
          else parts.push({ key: p.key, amount: p.amount });
        }
      }
      return parts;
    },
  },
};

// 반환: { ok, msg? , parts? }
function redeemPromoCode(saveData, inputCode) {
  const c = (inputCode || '').trim().toUpperCase();
  if (!c) return { ok:false, msg:'코드를 입력해주세요' };
  saveData.redeemedCodes = saveData.redeemedCodes || [];
  if (saveData.redeemedCodes.includes(c)) return { ok:false, msg:'이미 사용한 코드입니다' };
  const def = PROMO_CODES[c];
  if (!def) return { ok:false, msg:'존재하지 않는 코드입니다' };
  const parts = def.computeReward ? def.computeReward(saveData) : [];
  // 아직 해당 스테이지를 하나도 안 깬 신규 유저가 미리 써도 소진되지 않도록, 보상 0일 땐 코드를 사용 처리하지 않음
  if (!parts.length) return { ok:false, msg:'지금은 받을 보상이 없습니다 (해당 스테이지를 클리어한 뒤 다시 시도해주세요)' };
  for (const p of parts) saveData[p.key] = (saveData[p.key]||0) + p.amount;
  saveData.redeemedCodes.push(c);
  Save.save(saveData);
  return { ok:true, parts };
}
