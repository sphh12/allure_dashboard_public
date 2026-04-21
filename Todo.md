# Todo

## 진행 중
- (없음)

## 남은 할일
- 3월 26일 기록에서 `-` 표시 원인 해결 (Allure 리포트 전송 시 deviceName, gitBranch, durationText 필드 누락 문제)
- 내일 데모 URL(feat/public-demo Preview)에서 마스킹 동작 체크리스트 검증
  - URL: `https://allure-dashboard-git-feat-public-demo-sph12test-6232s-projects.vercel.app`
  - 확인 항목: DEMO 배지 / Branch=main / Commit 4자리+**** / gitMessage=[redacted] / deviceName 일반화 / 테스트명 해시 표시 / Artifacts 숨김 / Remark 숨김 / 스택트레이스 경로 정규화

## 완료
- [x] 필터 UI 개선 (OS/Status 체크박스 드롭다운 + 복수 선택)
- [x] broken 테스트 이력 정리 (2/16, 3/16~17, 3/26)
- [x] 실패 테스트 케이스 상세 정보 표시 기능 (TestCase 모델 + FailedCaseList + AllCaseList + DB 반영 + 데이터 재업로드)
- [x] 공개 데모 마스킹 레이어 (feat/public-demo: DEMO_MODE 환경변수 + 해시 기반 일관 마스킹 + DEMO 배지 + robots noindex)
