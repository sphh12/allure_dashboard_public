# Claude 응답 가이드 - Allure Dashboard

## 프로젝트 개요

Appium 모바일 자동화 테스트 결과를 시각화하는 웹 대시보드.
`~/appium/tools/upload_to_dashboard.py`에서 데이터를 업로드하고, 이 대시보드에서 조회/분석합니다.

- **프로덕션 URL**: https://allure-dashboard-three.vercel.app
- **GitHub**: sphh12/allure-dashboard (private)
- **배포**: GitHub push → Vercel 자동 배포

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15 (App Router) | 프레임워크 |
| TypeScript | 5.x | 타입 시스템 |
| Tailwind CSS | 4.x | 스타일링 |
| Prisma | 6.x | ORM |
| Vercel Postgres (Neon) | - | 메타데이터 DB |
| Vercel Blob | Public | 첨부파일 저장 (스크린샷/비디오/로그) |

## 응답 규칙

- 기본 응답 언어: **한국어**
- 코드 주석: 한국어
- 변수명/함수명: 영어

---

## 프로젝트 구조

```
allure-dashboard/
├── app/
│   ├── api/runs/
│   │   ├── route.ts                    # GET (목록) / POST (등록)
│   │   └── [timestamp]/
│   │       ├── route.ts                # GET (상세) / DELETE (삭제)
│   │       └── artifacts/
│   │           └── route.ts            # GET (목록) / POST (일괄 등록)
│   ├── runs/[timestamp]/
│   │   └── page.tsx                    # 실행 상세 페이지
│   ├── layout.tsx                      # 루트 레이아웃 (다크 테마)
│   ├── page.tsx                        # 메인 대시보드 페이지
│   └── globals.css                     # 글로벌 스타일
├── components/
│   ├── ArtifactViewer.tsx              # 첨부파일 뷰어 (이미지/비디오/텍스트)
│   ├── Filters.tsx                     # 검색/필터 UI
│   ├── RunsTable.tsx                   # 실행 목록 테이블
│   ├── StatsBar.tsx                    # 통계 바
│   └── StatusBadge.tsx                 # 상태 배지
├── lib/
│   ├── prisma.ts                       # Prisma 클라이언트 싱글톤
│   └── utils.ts                        # 유틸리티 (포맷팅, 색상, 상태 도출)
├── prisma/
│   └── schema.prisma                   # DB 스키마
├── next.config.ts                      # Blob 이미지 도메인 설정
├── package.json
└── .env.local                          # 환경변수 (Git 미추적)
```

---

## DB 스키마

### Run (테스트 실행 기록)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | cuid | PK |
| timestamp | String (unique) | 실행 시각 (YYYYMMDD_HHMMSS) |
| status | String | pass / fail / broken / skip |
| platform | String | android / ios |
| total, passed, failed, broken, skipped | Int | 테스트 통계 |
| durationMs, durationText | Int, String | 실행 시간 |
| deviceName, platformVersion, app | String | 디바이스 정보 |
| gitBranch, gitCommit, gitMessage | String? | Git 정보 |
| buildName | String? | 빌드명 |
| suites, behaviors, packages, environment | Json? | 상세 데이터 |
| artifacts | Artifact[] | 첨부파일 관계 |

### Artifact (첨부파일)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | cuid | PK |
| runId | String (FK) | Run 참조 |
| type | String | screenshot / video / logcat / page_source / capabilities |
| name | String | 표시명 |
| source | String | Allure 해시 파일명 (중복 방지) |
| url | String | Vercel Blob URL |
| contentType | String? | MIME 타입 |
| sizeBytes | Int? | 파일 크기 |

- **유니크 제약**: `@@unique([runId, source])` — 같은 Run에 같은 source 파일 중복 방지
- **Cascade 삭제**: Run 삭제 시 Artifact도 함께 삭제

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/runs` | 실행 목록 (필터: platform, status, from, to, q) |
| POST | `/api/runs` | 실행 등록/수정 (timestamp 기준 upsert) |
| GET | `/api/runs/[ts]` | 실행 상세 (artifacts 포함) |
| DELETE | `/api/runs/[ts]` | 실행 삭제 |
| GET | `/api/runs/[ts]/artifacts` | 첨부파일 목록 |
| POST | `/api/runs/[ts]/artifacts` | 첨부파일 일괄 등록 (upsert) |

---

## 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 (pooled) | 필수 |
| `DATABASE_URL_UNPOOLED` | Neon PostgreSQL 연결 (non-pooled, 마이그레이션용) | 필수 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 읽기/쓰기 토큰 | 필수 |
| `POSTGRES_*` | Vercel이 자동 주입하는 DB 변수들 | Vercel 환경 |

**로컬 개발 시**: `vercel env pull`로 `.env.local` 생성

---

## 배포

- **자동 배포**: GitHub `sphh12/allure-dashboard` → push 시 Vercel 자동 배포
- **Git 이메일**: `sph12.test@gmail.com` (Vercel 팀 이메일과 일치해야 배포 권한 있음)
- **수동 배포**: `vercel --prod` (Vercel CLI)
- **DB 마이그레이션**: `npx prisma db push` (`.env.local` 로드 필요)

```bash
# DB 마이그레이션 (로컬에서)
set -a && source .env.local && set +a && npx prisma db push

# Prisma 클라이언트 재생성
npx prisma generate
```

---

## 개발

```bash
# 의존성 설치
npm install

# 환경변수 동기화
vercel env pull

# 개발 서버
npm run dev    # http://localhost:3000 (Turbopack)
```

---

## 관련 프로젝트

- **appium** (`~/appium/`): 테스트 실행 + 이 대시보드에 결과 업로드
  - `tools/upload_to_dashboard.py`: 리포트 데이터 + Blob 첨부파일 업로드
  - `tools/run_allure.py`: 테스트 → 리포트 → 업로드 자동화
