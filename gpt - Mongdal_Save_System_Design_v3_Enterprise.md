# 몽달 Save System Design v3
## Enterprise Architecture Specification

> 목적: 몽달의 세이브 시스템을 장기적으로 유지 가능한 표준 아키텍처로 정의한다.

# 1. 설계 원칙
- SaveManager만 저장/로드 담당
- GameState 전체 저장
- SaveVersion으로만 마이그레이션
- Import는 반드시 Preview 후 적용
- JSON 구조는 최대한 유지
- 서버 없이도 완전 동작
- Firebase 추가 시 SaveManager 수정 최소화

# 2. 모듈 구조
```
Game
├─ SaveManager
├─ MigrationManager
├─ Checksum
├─ Compression
├─ Clipboard
├─ DeviceDetector
├─ PreviewBuilder
└─ CloudProvider(Future)
```

# 3. SaveData 스키마
```json
{
 header:"MDL1",
 saveVersion:9,
 gameVersion:"0.2.4",
 meta:{
   saveId:"",
   saveName:"",
   savedAtUTC:"",
   playTimeSec:0,
   device:"",
   os:"",
   browser:""
 },
 player:{},
 progress:{chapter:0,stage:0,maxStage:0},
 currencies:{},
 companions:{},
 weapons:{},
 weaponDeck:[],
 pets:{},
 buildings:{},
 achievements:{},
 collection:{},
 options:{},
 statistics:{},
 futureData:{}
}
```

# 4. SaveManager API
- exportSave()
- importSave(code)
- validate(code)
- buildPreview()
- applySave()
- autoBackup()
- restoreBackup()
- migrate()
- createChecksum()
- verifyChecksum()

# 5. 상태 머신
Idle
→ Exporting
→ Validating
→ Decompressing
→ Migrating
→ Preview
→ Applying
→ Complete
→ Error

# 6. Import UX
1. 붙여넣기
2. 코드 검사
3. Preview 생성
4. 사용자 확인
5. 적용
6. 자동 백업 생성

# 7. Preview 표시
- Save ID
- 게임 버전
- Save Version
- 스테이지
- 플레이 시간
- 동료 수
- 건물 진행률
- 마지막 저장
- 저장 환경
- 브라우저

# 8. Migration 규칙
모든 버전은 순차 적용.
v7→v8
v8→v9
...
절대 중간 버전 삭제 금지.

# 9. 압축
JSON→LZString→Base64→Checksum→MDL Header

# 10. Checksum
목적:
- 손상 감지
- 실수 수정 감지
목적이 아님:
- 치트 방지

# 11. Device
OS:
Windows/macOS/Linux/Android/iOS
Browser:
Chrome/Edge/Firefox/Safari

# 12. Backup 정책
save_current
save_backup
backup은 마지막 정상 저장만 유지.

# 13. 오류 메시지
- Header 오류
- Checksum 오류
- 지원하지 않는 SaveVersion
- JSON 손상
- 압축 해제 실패

# 14. Firebase 확장
CloudProvider 인터페이스만 추가.
SaveData 변경 금지.

# 15. 테스트
기능:
- Export
- Import
- Migration
- Backup
환경:
- Chrome
- Edge
- Safari
- Firefox
- Android
- iPhone

예외:
- 코드 잘림
- 한 글자 변경
- 다른 버전
- 빈 문자열
- 매우 큰 세이브

# 16. AI 구현 규칙
- localStorage 직접 접근 금지
- SaveManager 통해서만 저장
- 신규 시스템은 futureData 또는 신규 section 추가
- 기존 필드 삭제보다 Migration 사용

# 17. 향후 로드맵
Phase1 Export/Import
Phase2 Preview/Backup
Phase3 Migration 자동화
Phase4 Firebase
Phase5 Steam Cloud 대응

# 부록 A
추천 라이브러리
- LZString
- Web Crypto API
- Clipboard API

# 부록 B
AI 작업 분할
1.SaveManager.js
2.MigrationManager.js
3.SavePreview.js
4.DeviceDetector.js
5.Checksum.js
6.Compression.js
7.CloudProvider.js

각 파일은 단일 책임 원칙(SRP)을 따른다.

# 최종 결론
이 문서는 몽달 세이브 시스템의 공식 아키텍처이다.
향후 모든 구현은 본 문서를 기준으로 진행한다.
