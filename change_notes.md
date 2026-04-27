# Change Notes

## 2026-04-21
### 테스트 케이스 상세 기능 DB 반영
- Prisma 스키마에 `TestCase` 모델 + `Artifact.testCaseId` FK 추가 후 `prisma db push`로 DB 반영
- 스키마 드리프트 발견 → `remark` 컬럼 스키마 복원으로 데이터 손실 방지
- 기존 리포트를 업데이트된 업로드 스크립트로 재업로드 (testCases 데이터 포함)
- `@anthropic-ai/sdk` 의존성 설치

### 공개 데모 마스킹 레이어 추가
- `NEXT_PUBLIC_DEMO_MODE=true` 환경변수로 on/off 제어되는 마스킹 시스템 도입
- `lib/masking.ts` — 서버 사이드 마스킹 유틸리티 (필드별 + 해시 기반 일관 마스킹 + 키워드 치환 맵)
- 마스킹 대상:
  - Run 레벨: `app`, `deviceName`, `gitBranch`/`gitCommit`/`gitMessage`, `remark`
  - TestCase 레벨: `name`, `fullName`, `suite`, `statusMessage`, `statusTrace`
  - Suite/Behavior 리스트: 이름 해시 기반 치환
  - Environment: 사용자 정의 키워드 일괄 치환 (`NEXT_PUBLIC_DEMO_KEYWORDS` 환경변수)
  - Artifacts: 전체 숨김
- `components/DemoBadge.tsx` — 상단 중앙 주황색 "Demo Mode" 배지
- `app/robots.ts` — 데모 모드 시 크롤러 차단
- `app/layout.tsx` — noindex metadata + 배지 삽입
- API 변경:
  - GET 응답에 `Cache-Control: no-store` 헤더
  - 쓰기 API(POST/PATCH/DELETE) 데모 모드에서 403 차단
  - `/api/analyze` 차단, `/api/trigger` GET 빈 응답

### 배포 전략 의사결정
- 마스킹 코드를 별도 브랜치(`feat/public-demo`)에 격리하고 메인 브랜치에는 반영하지 않는 전략 채택
- Vercel Preview 배포 URL을 공개 데모용으로 사용
- 메인 브랜치의 기능 변경은 주기적으로 rebase/merge로 데모 브랜치에 반영

## 2026-04-12
- 메인 테이블 헤더 클릭 정렬 기능 추가

## 2026-04-07
- 테스트 트리거 API 추가 (`/api/trigger`) — 외부에서 테스트 실행 요청 수락 + 폴링 기반 처리

## 2026-04-01
- 상세 페이지 상태 카드 세로 중앙 정렬
- glass 패널 테두리 + 입체감 강화 (다크/라이트 모드)

## 2026-03-30
- AI 분석 기능 추가 (실패 케이스 자동 원인 분석, Anthropic SDK / Vercel AI Gateway 지원)
- Clear 버튼 빨간색 강조
- Pass Rate 2단 표시 (Overall / Latest), No Data 상태 표시

## 2026-03-29
- 필터 UI 개선 — OS(Platform → OS) / Status 체크박스 드롭다운 전환, 복수 선택 지원
- 드롭다운 닫힐 때 조회 실행, 배경 불투명 처리
- 상세 페이지 UI 개선 — 테스트 케이스 펼치기, Environment 정리, StatusBadge 수정
- Pass Rate 2단(Overall/Latest) + 그래프 No Data 표시 + Latest 클릭 이동
- 전체 테스트 케이스 목록 + Environment 불필요 항목 숨김
- README, change_notes, Todo 문서 생성

## 2026-03-27
- 실패 테스트 케이스 상세 정보 표시 기능 추가 (에러 메시지, 스택 트레이스, 스텝, severity)

## 2026-03-09
- 라이트 모드 텍스트 가시성 수정 (`text-white/*` 클래스 → inline style)
- ThemeToggle 배경 제거 + 아이콘 색상 적용

## 2026-03-08
- 차트 시각화 추가 — 상태 분포, 트렌드, 플랫폼별 분석
- 다크/라이트 모드 도입 + 인터랙티브 필터링

## 2026-03-01
- 상세 페이지 Remark(메모) 기능 추가, 대시보드 테이블에 Remark 컬럼
- 전체 UI 텍스트 한글 → 영어 전환 (대시보드, ArtifactViewer, RemarkEditor 등)
- date picker 개선 (네이티브 type="date" 복원, 포커스 시 yyyy→mm→dd 자동 이동, 캘린더 아이콘 cursor 처리)
- 날짜 필터 DB timestamp 형식 불일치 버그 수정
- Remark 영역 버튼에 cursor-pointer 적용

## 2026-02-25
- 반응형 웹 변환 + Status 필터 버튼 추가
- StatsBar 항상 전체 데이터 기준 집계 + Run 단위 변경
- runs PATCH API 추가 (gitMessage 등 필드 수정용)
- Behaviors → Actions 명칭 변경 (상세 페이지)
- 상세 페이지 gitMessage를 DB 최상위 필드 우선 사용 (인코딩 깨짐 방지)
- APP 항목에 파일명만 표시, Environment 항목 표시 개선
- EnvCard 텍스트 잘림 시에만 툴팁 표시 (2px 여유값 + 리사이즈 대응, 대소문자 무관 매칭)

## 2026-02-22
- CLAUDE.md 프로젝트 가이드 신규 생성
- `.gitignore`에 `.claude/` 추가 (Git 추적 제외)

## 2026-02-21
- Allure Dashboard 초기 구축 — Next.js 16 + React 19 + Prisma + PostgreSQL
- Vercel Blob 첨부파일 뷰어 구현 (이미지/비디오/JSON/XML/로그)
- runs DELETE 엔드포인트 추가
