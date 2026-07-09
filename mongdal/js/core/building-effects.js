// building-effects.js - 건물 효과를 게임에 적용

const BuildingEffects = (() => {

  // 현재 건물 레벨 가져오기
  function getBuildingLevel(saveData, buildingId) {
    return (saveData.buildings || {})[buildingId] || 1;
  }

  // 건물 레벨에 해당하는 effect 객체 반환
  function getEffect(buildingId, level) {
    const bDef = GAME_DATA.buildings.find(b => b.id === buildingId);
    if (!bDef) return null;
    const lvData = bDef.levels.find(l => l.lv === level);
    return lvData?.effect || null;
  }

  // 건물이 로비에 활성화되기 전까지 모든 효과 비활성화
  function applySinmok()      {}
  function getSeonangBonus()  { return { count: 0, rare: false }; }
  function getUiwonEffect()   { return null; }
  function getJangsangBonus() { return { dmgMult: 1.0, hpMult: 1.0 }; }
  function getYongwangBonus() { return { slotBonus: 0, effectMult: 1.0 }; }
  function applyAll()         {}

  return {
    getBuildingLevel,
    getEffect,
    getSeonangBonus,
    getUiwonEffect,
    getJangsangBonus,
    getYongwangBonus,
    applyAll,
  };
})();
