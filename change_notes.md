# Change Notes

## 2026-04-21
### 테스트 케이스 상세 기능 DB 반영
- Prisma 스키마에 `TestCase` 모델 + `Artifact.testCaseId` FK 추가 후 `prisma db push`로 Neon DB 반영
- 스키마 드리프트 발견 → `remark` 컬럼 스키마 복원으로 데이터 손실 방지
- 기존 37개 리포트를 업데이트된 `upload_to_dashboard.py`로 재업로드 (testCases 데이터 포함)
- `@anthropic-ai/sdk` 로컬 의존성 설치 (package-lock 업데이트)

### 공개 데모 마스킹 레이어 추가 (feat/public-demo 브랜치 전용)
- `NEXT_PUBLIC_DEMO_MODE=true` 환경변수로 on/off 제어되는 마스킹 시스템 도입
- `lib/masking.ts` — 서버 사이드 마스킹 유틸리티 (필드별 + 해시 기반 일관 마스킹 + 키워드 치환 맵)
- 마스킹 대상:
  - Run 레벨: `app`, `deviceName`, `gitBranch`/`gitCommit`/`gitMessage`, `remark`
  - TestCase 레벨: `name`, `fullName`, `suite`, `statusMessage`, `statusTrace`
  - Suite/Behavior 리스트: 이름 해시 기반 치환
  - Environment: 회사명 키워드 일괄 치환
  - Artifacts: 전체 숨김
- `components/DemoBadge.tsx` — 상단 중앙 주황색 "Demo Mode" 배지
- `app/robots.ts` — 데모 모드 시 크롤러 차단
- `app/layout.tsx` — noindex metadata + 배지 삽입
- API 변경:
  - GET 응답에 `Cache-Control: no-store` 헤더
  - 쓰기 API(POST/PATCH/DELETE) 데모 모드에서 403 차단
  - `/api/analyze` 차단, `/api/trigger` GET 빈 응답

### 배포 전략 (옵션 B 채택)
- 이 마스킹 코드는 **`feat/public-demo` 브랜치에만 존재**하며 `main`에는 반영하지 않음
- Vercel Preview 배포 URL이 공개 데모용으로 사용됨
- `main`의 기능 변경을 데모에 반영하려면 주기적으로 rebase/merge 필요

### 참고: 채택하지 않은 옵션 A
- **구조**: 마스킹 코드를 `main`에 포함시키고 환경변수로만 동작 제어
- **장점**:
  - 단일 코드베이스 → main의 신규 기능이 데모에도 자동 반영
  - 브랜치 동기화 유지보수 불필요
  - 표준 패턴 (대부분 프로젝트가 이렇게 운영)
- **단점**:
  - 실수로 프로덕션에 `NEXT_PUBLIC_DEMO_MODE=true`를 설정하면 프로덕션이 마스킹됨
  - 마스킹 관련 코드가 프로덕션 번들에도 포함됨 (dead code로 존재)
- **옵션 B를 선택한 이유**: main을 절대 건드리지 않고 완전 격리하기 위함

## 2026-03-29
- 필터 UI 개선: Platform → OS 이름 변경, select → 체크박스 드롭다운 전환
- Status 필터 추가 (Pass/Fail/Broken/Skip)
- 복수 선택 지원 (쉼표 구분, Prisma in 쿼리)
- 드롭다운 닫힐 때 조회 실행 (즉시 반영 방지)
- 드롭다운 배경 불투명 처리
- 전체 테스트 케이스 목록 + Environment 불필요 항목 숨김
- 2월 16일 broken 안드로이드 이력 11건 삭제
- 3월 16~17일 broken 이력 3건 삭제
- 3월 26일 broken 이력 2건 삭제

## 2026-03-27
- 실패 테스트 케이스 상세 정보 표시 기능 추가

## 2026-03-09
- ThemeToggle 배경 제거 + 아이콘 색상 적용
- 라이트 모드 텍스트 가시성 수정 (text-white/* → inline style)

## 2026-03-08
- 차트 시각화 + 다크/라이트 모드 + 인터랙티브 필터링

## 2026-03-01
- Remark 영역 모든 버튼에 cursor-pointer 추가
- 날짜 필터 DB timestamp 형식 불일치 버그 수정
- date picker를 커스텀 텍스트 입력으로 교체
- date picker 포커스 시 네이티브 필드 표시 개선
