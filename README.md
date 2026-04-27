# 📊 Allure Dashboard

> QA 자동화 테스트 실행 결과를 시각화하는 대시보드 웹 애플리케이션

Allure Report 데이터를 수집하여 테스트 이력 관리, 트렌드 분석, 실패 원인 추적을 제공합니다.

---

## 🌐 Live Demo

> **▶ [Allure Dashboard 데모 보기](https://allure-dashboard-git-feat-public-demo-sph12test-6232s-projects.vercel.app)**
>
> 마스킹 처리된 실제 테스트 실행 데이터 확인 가능 · 누구나 접속 가능

---

## 주요 기능

- **대시보드** — 전체 테스트 실행 통계 (Pass/Fail/Broken/Skip) 및 트렌드 차트
- **필터링** — OS(Android/iOS), Status, 날짜 범위, 키워드 검색 (복수 선택 지원)
- **실행 상세** — 개별 테스트 케이스 결과, 환경 정보, Artifact 확인
- **실패 분석** — 실패한 테스트의 에러 메시지, 스택 트레이스, 스텝별 상세 표시
- **AI 분석** — 실패 케이스 자동 원인 분석 (Anthropic API / Vercel AI Gateway)
- **Remark** — 테스트 실행에 메모/비고 추가
- **공개 데모 모드** — 환경변수로 마스킹 on/off 제어 (`NEXT_PUBLIC_DEMO_MODE`)
- **다크/라이트 모드** — 테마 전환 지원

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript, React 19 |
| Database | PostgreSQL (Prisma ORM) |
| Storage | Vercel Blob (아티팩트) |
| Charts | Recharts |
| Styling | Tailwind CSS 4.2 |
| AI | Anthropic SDK / Vercel AI Gateway |
| Deployment | Vercel |

## 프로젝트 구조

```
app/
├── page.tsx                    # 메인 대시보드 (SSR)
├── layout.tsx                  # 루트 레이아웃 + 테마 + 데모 배지
├── runs/[timestamp]/page.tsx   # 실행 상세 페이지
├── robots.ts                   # 검색엔진 노출 제어 (데모 모드)
└── api/
    ├── runs/                   # REST API (CRUD)
    ├── analyze/                # AI 실패 분석
    └── trigger/                # 테스트 트리거 큐

components/
├── RunsTable.tsx               # 테스트 실행 목록 테이블
├── Filters.tsx                 # 필터 (OS, Status, 날짜, 검색)
├── StatsBar.tsx                # 상단 통계 카드
├── OverviewCharts.tsx          # 차트 (상태, 트렌드, 플랫폼)
├── FailedCaseList.tsx          # 실패/broken 테스트 상세
├── AllCaseList.tsx             # 전체 테스트 케이스 목록
├── ArtifactViewer.tsx          # 아티팩트 (이미지/비디오/로그) 뷰어
├── RemarkEditor.tsx            # Remark 편집기
├── DemoBadge.tsx               # 데모 모드 표시 배지
└── ...

lib/
├── prisma.ts                   # Prisma 싱글턴 클라이언트
├── masking.ts                  # 데모 모드 마스킹 유틸리티
└── utils.ts                    # 공통 유틸 (timestamp, status 등)

prisma/
└── schema.prisma               # DB 스키마 (Run, TestCase, Artifact, TriggerRequest)
```

---

## Quick Start

### 1. 클론 및 의존성 설치

```bash
git clone https://github.com/sphh12/allure_dashboard_public.git
cd allure_dashboard_public
npm install
```

### 2. 환경변수 설정

```bash
# 템플릿 복사
cp .env.example .env

# .env 파일을 열어 값 입력
# - DATABASE_URL (필수): PostgreSQL 연결 문자열
# - BLOB_READ_WRITE_TOKEN (선택): Vercel Blob Storage 토큰
# - NEXT_PUBLIC_DEMO_MODE (선택): "true"로 설정 시 마스킹 모드
# - AI_GATEWAY_API_KEY 또는 ANTHROPIC_API_KEY (선택): AI 분석용
```

### 3. 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# DB 스키마 반영
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인 가능

---

## 데모 모드

`NEXT_PUBLIC_DEMO_MODE=true`로 설정하면 모든 민감 데이터가 자동으로 마스킹됩니다.

### 마스킹 대상

| 필드 | 마스킹 결과 |
|---|---|
| `gitBranch` | `main` 고정 |
| `gitCommit` | 앞 4글자 + `****` |
| `gitMessage` | `[redacted]` |
| `deviceName` | `Android Device` / `iOS Device` |
| `app` / `appName` | `DemoApp.apk` / `DemoApp` |
| 테스트 케이스명 | `Test Case #<해시>` (uid 기반 일관 마스킹) |
| Suite/Behavior | `Suite #<해시>` / `Feature #<해시>` |
| 스택 트레이스 | 로컬 경로/사용자 디렉토리 제거 |
| Artifacts | 전체 숨김 |
| Remark | 숨김 |

### 추가 키워드 마스킹

`NEXT_PUBLIC_DEMO_KEYWORDS` 환경변수에 쉼표로 구분된 키워드를 정의하면 환경 변수, 스택 트레이스 내 해당 키워드가 `Sample1`, `Sample2`... 로 일괄 치환됩니다.

```bash
NEXT_PUBLIC_DEMO_KEYWORDS="MyCompany,InternalService,SomeProductName"
```

### 데모 모드의 추가 동작

- 모든 쓰기 API(POST/PATCH/DELETE)는 403 차단
- `/api/analyze` (AI 분석) 비활성화
- API 응답에 `Cache-Control: no-store` 헤더 추가
- `robots.txt`에서 모든 크롤러 차단
- 페이지 메타에 `noindex, nofollow` 설정
- 상단 중앙에 "Demo Mode" 배지 표시

---

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/runs` | 실행 목록 조회 (필터: platform, status, from, to, q) |
| POST | `/api/runs` | 새 실행 기록 생성 |
| GET | `/api/runs/[timestamp]` | 실행 상세 조회 |
| PATCH | `/api/runs/[timestamp]` | 실행 정보 수정 (remark 등) |
| DELETE | `/api/runs/[timestamp]` | 실행 기록 삭제 |
| GET | `/api/runs/[timestamp]/artifacts` | 아티팩트 목록 |
| POST | `/api/runs/[timestamp]/artifacts` | 아티팩트 등록 |
| POST | `/api/analyze` | AI 기반 실패 분석 |
| GET | `/api/trigger?status=pending` | 대기 중인 트리거 조회 |
| POST | `/api/trigger` | 새 테스트 트리거 생성 |
| PATCH | `/api/trigger` | 트리거 상태 업데이트 |

---

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결 및 배포
vercel link
vercel --prod
```

환경변수는 Vercel Dashboard → Settings → Environment Variables에서 설정합니다.

### 데이터 업로드 파이프라인

별도의 업로드 스크립트를 통해 Allure Report 결과를 본 대시보드 API로 전송합니다.
스크립트는 `widgets/`, `data/test-cases/` 등을 파싱하여 `POST /api/runs`로 메타데이터를, `POST /api/runs/[timestamp]/artifacts`로 아티팩트를 전송합니다.

---

## License

MIT
