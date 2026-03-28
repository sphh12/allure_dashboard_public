# Allure Dashboard

QA 자동화 테스트 실행 결과를 시각화하는 대시보드 웹 애플리케이션.
Allure Report 데이터를 수집하여 테스트 이력 관리, 트렌드 분석, 실패 원인 추적을 제공합니다.

## 주요 기능

- **대시보드** — 전체 테스트 실행 통계 (Pass/Fail/Broken/Skip) 및 트렌드 차트
- **필터링** — OS(Android/iOS), Status, 날짜 범위, 키워드 검색 (복수 선택 지원)
- **실행 상세** — 개별 테스트 케이스 결과, 환경 정보, Artifact 확인
- **Remark** — 테스트 실행에 메모/비고 추가
- **다크/라이트 모드** — 테마 전환 지원

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript, React 19 |
| Database | PostgreSQL (Prisma ORM) |
| Charts | Recharts |
| Styling | Tailwind CSS 4.2 |
| Deployment | Vercel |

## 프로젝트 구조

```
app/
├── page.tsx                    # 메인 대시보드 (SSR)
├── layout.tsx                  # 루트 레이아웃 + 테마
├── runs/[timestamp]/page.tsx   # 실행 상세 페이지
└── api/runs/                   # REST API (CRUD)

components/
├── RunsTable.tsx               # 테스트 실행 목록 테이블
├── Filters.tsx                 # 필터 (OS, Status, 날짜, 검색)
├── StatsBar.tsx                # 상단 통계 카드
├── OverviewCharts.tsx          # 차트 (상태, 트렌드, 플랫폼)
├── FailedCaseList.tsx          # 실패/broken 테스트 상세
├── RemarkEditor.tsx            # Remark 편집기
└── ...

prisma/
└── schema.prisma               # DB 스키마 (Run, TestCase, Artifact)
```

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정 (Vercel에서 가져오기)
npx vercel link
npx vercel env pull .env.local

# Prisma 클라이언트 생성
npx prisma generate

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인 가능

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/runs` | 실행 목록 조회 (필터: platform, status, from, to, q) |
| POST | `/api/runs` | 새 실행 기록 생성 |
| GET | `/api/runs/[timestamp]` | 실행 상세 조회 |
| PATCH | `/api/runs/[timestamp]` | 실행 정보 수정 (remark 등) |
| DELETE | `/api/runs/[timestamp]` | 실행 기록 삭제 |
