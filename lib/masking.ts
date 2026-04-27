/**
 * 공개 데모 마스킹 유틸리티
 *
 * 환경변수 NEXT_PUBLIC_DEMO_MODE="true" 설정 시 민감 정보를 런타임에 치환하여
 * 공개 데모 배포에서만 마스킹된 데이터를 노출합니다.
 *
 * NEXT_PUBLIC_* 접두사를 사용하면 클라이언트 번들에도 주입되어 헤더 배지 등
 * UI 컴포넌트에서 데모 모드 여부를 판별할 수 있습니다.
 */

// ───── 환경 플래그 ─────

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// 하위 호환 — 이전 이름 유지
export const isPublicMode = isDemoMode;

// ───── 키워드 치환 맵 ─────
// 환경변수에 정의된 시크릿 키워드들을 일반명으로 일괄 치환
// 스택 트레이스, 환경변수, 임의 텍스트에 적용
//
// 사용법: NEXT_PUBLIC_DEMO_KEYWORDS="키워드1,키워드2" 형태로 환경변수에 정의
// 코드에는 실제 회사명/서비스명을 남기지 않음

function buildKeywordReplacements(): Array<[RegExp, string]> {
  const raw = process.env.NEXT_PUBLIC_DEMO_KEYWORDS || "";
  const keywords = raw.split(",").map((k) => k.trim()).filter(Boolean);
  return keywords.map((kw, idx) => {
    const pattern = new RegExp(escapeRegExp(kw), "gi");
    return [pattern, `Sample${idx + 1}`] as [RegExp, string];
  });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const KEYWORD_REPLACEMENTS: Array<[RegExp, string]> = buildKeywordReplacements();

export function applyKeywordReplacements(text: string): string {
  let result = text;
  for (const [pattern, replacement] of KEYWORD_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ───── 해시 기반 일관 마스킹 ─────
// 같은 입력은 항상 같은 3자리 영숫자 해시로 변환되어
// 대시보드/상세/차트에서 동일 식별자가 동일하게 표시됨

export function hashToShort(input: string): string {
  if (!input) return "000";
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  // 3자리 영숫자 (base36)
  const positive = Math.abs(hash);
  return positive.toString(36).slice(-3).padStart(3, "0");
}

// ───── 개별 필드 마스킹 ─────

export function maskGitBranch(_value: string | null | undefined): string {
  return "main";
}

export function maskGitCommit(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 4) + "****";
}

export function maskGitMessage(_value: string | null | undefined): string {
  return "[redacted]";
}

export function maskDeviceName(value: string | null | undefined, platform?: string | null): string {
  if (platform === "ios") return "iOS Device";
  if (platform === "android") return "Android Device";
  return value ? "Test Device" : "";
}

export function maskApp(_value: string | null | undefined): string {
  return "DemoApp.apk";
}

export function maskAppName(_value: string | null | undefined): string {
  return "DemoApp";
}

export function maskRemark(_value: string | null | undefined): string | null {
  return null;
}

// 스택 트레이스 / 에러 메시지 마스킹
// - 로컬 경로 제거 (C:\Users\...)
// - 백슬래시 → 슬래시
// - 내부 디렉토리명 일반화
// - 키워드 치환 적용
export function maskStatusTrace(value: string | null | undefined): string | null {
  if (!value) return value ?? null;
  let masked = value;
  // Windows 사용자 경로
  masked = masked.replace(/[A-Z]:\\Users\\[^\\]+\\/gi, "/app/");
  // macOS 사용자 경로
  masked = masked.replace(/\/Users\/[^/]+\//g, "/app/");
  // 내부 디렉토리명 일반화
  masked = masked.replace(/appium-mobile-test[\\/]?/gi, "");
  masked = masked.replace(/venv[\\/]Lib[\\/]site-packages[\\/]/gi, "site-packages/");
  // 백슬래시 → 슬래시
  masked = masked.replace(/\\/g, "/");
  // 키워드 치환
  masked = applyKeywordReplacements(masked);
  return masked;
}

// 테스트 케이스명 (uid 해시 기반 → 동일 uid는 항상 동일 번호)
export function maskTestCaseName(_value: string | null | undefined, uid: string | null | undefined): string {
  const shortHash = hashToShort(uid || "").toUpperCase();
  return `Test Case #${shortHash}`;
}

// fullName: tests.<package>.<TestClass>#<test_method> → tests.module.Sample#test_<hash>
export function maskFullName(_value: string | null | undefined, uid: string | null | undefined): string {
  const shortHash = hashToShort(uid || "");
  return `tests.module.Sample#test_${shortHash}`;
}

export function maskSuite(_value: string | null | undefined): string | null {
  return "Sample Suite";
}

// Suite/Behavior 리스트의 개별 name 마스킹 (원본 이름 기반 해시로 일관성 유지)
export function maskSuiteListName(value: string | null | undefined, kind: "suite" | "behavior"): string {
  const shortHash = hashToShort(value || "").toUpperCase();
  const prefix = kind === "suite" ? "Suite" : "Feature";
  return `${prefix} #${shortHash}`;
}

// ───── 타입 ─────

type RunLike = {
  deviceName?: string | null;
  platform?: string | null;
  gitBranch?: string | null;
  gitCommit?: string | null;
  gitMessage?: string | null;
  app?: string | null;
  remark?: string | null;
  environment?: unknown;
  suites?: unknown;
  behaviors?: unknown;
};

type TestCaseLike = {
  uid?: string | null;
  name: string;
  fullName?: string | null;
  suite?: string | null;
  statusTrace?: string | null;
  statusMessage?: string | null;
  artifacts?: unknown[];
};

// ───── 집계 마스킹 함수 ─────

export function maskRun<T extends RunLike>(run: T): T {
  if (!DEMO_MODE) return run;

  const maskedEnv = run.environment
    ? maskEnvironment(run.environment as Record<string, unknown>)
    : run.environment;

  const suites = Array.isArray(run.suites)
    ? (run.suites as Array<{ name: string }>).map((s) => ({
        ...s,
        name: maskSuiteListName(s.name, "suite"),
      }))
    : run.suites;

  const behaviors = Array.isArray(run.behaviors)
    ? (run.behaviors as Array<{ name: string }>).map((b) => ({
        ...b,
        name: maskSuiteListName(b.name, "behavior"),
      }))
    : run.behaviors;

  return {
    ...run,
    deviceName: maskDeviceName(run.deviceName, run.platform),
    gitBranch: maskGitBranch(run.gitBranch),
    gitCommit: maskGitCommit(run.gitCommit),
    gitMessage: maskGitMessage(run.gitMessage),
    app: run.app != null ? maskApp(run.app) : run.app,
    remark: maskRemark(run.remark),
    environment: maskedEnv,
    suites,
    behaviors,
  };
}

export function maskRuns<T extends RunLike>(runs: T[]): T[] {
  if (!DEMO_MODE) return runs;
  return runs.map((r) => maskRun(r));
}

export function maskTestCase<T extends TestCaseLike>(tc: T): T {
  if (!DEMO_MODE) return tc;
  const uid = tc.uid ?? tc.fullName ?? tc.name;
  return {
    ...tc,
    name: maskTestCaseName(tc.name, uid),
    fullName: maskFullName(tc.fullName, uid),
    suite: maskSuite(tc.suite),
    statusTrace: maskStatusTrace(tc.statusTrace),
    statusMessage: maskStatusTrace(tc.statusMessage),
    artifacts: [], // 아티팩트는 데모 모드에서 숨김
  };
}

export function maskTestCases<T extends TestCaseLike>(testCases: T[]): T[] {
  if (!DEMO_MODE) return testCases;
  return testCases.map((tc) => maskTestCase(tc));
}

// Environment JSON 내부 필드 마스킹
function maskEnvironment(env: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = { ...env };
  const platform = typeof env.platform === "string" ? env.platform : undefined;

  if ("deviceName" in masked) masked.deviceName = maskDeviceName(masked.deviceName as string, platform);
  if ("gitBranch" in masked) masked.gitBranch = maskGitBranch(masked.gitBranch as string);
  if ("gitCommit" in masked) masked.gitCommit = maskGitCommit(masked.gitCommit as string);
  if ("gitMessage" in masked) masked.gitMessage = maskGitMessage(masked.gitMessage as string);
  if ("app" in masked) masked.app = maskApp(masked.app as string);
  if ("appName" in masked) masked.appName = maskAppName(masked.appName as string);

  // 기타 env 필드에 키워드 치환 적용
  for (const key of Object.keys(masked)) {
    const v = masked[key];
    if (typeof v === "string") {
      masked[key] = applyKeywordReplacements(v);
    }
  }

  return masked;
}

// 아티팩트 완전 숨김
export function maskArtifacts<T>(artifacts: T[]): T[] {
  if (!DEMO_MODE) return artifacts;
  return [];
}
