// 다국어(i18n) 공통 정의 — 로케일 타입, 경로 생성, 날짜 포맷을 한곳에서 관리
// 정적 내보내기(output: "export") 환경이므로 미들웨어 기반 로케일 감지는 사용하지 않고
// 모든 로케일 경로를 빌드 시점에 생성한다.

import { SITE_URL } from "@/lib/config";
import { ko, type Dictionary } from "./dictionaries/ko";
import { en } from "./dictionaries/en";

export type { Dictionary };

// 지원 로케일 — 추가 시 이 배열과 dictionaries만 확장하면 된다
export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

// 기본 로케일은 URL 접두어 없이 루트에 서비스된다 (기존 색인 URL 보존 목적)
export const DEFAULT_LOCALE: Locale = "ko";

// <html lang> 및 hreflang에 사용하는 BCP 47 태그
export const HTML_LANG: Record<Locale, string> = {
  ko: "ko",
  en: "en",
};

// Open Graph 로케일 표기
export const OG_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};

// Intl 포맷에 사용하는 로케일 태그
const DATE_LOCALE: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
};

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

const DICTIONARIES: Record<Locale, Dictionary> = { ko, en };

// 로케일별 UI 문자열 사전 반환
// 정적 import이므로 서버 컴포넌트와 클라이언트 컴포넌트에서 모두 사용할 수 있다
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

// 로케일별 내부 링크 경로 생성 (next/link href 용, 뒤 슬래시 없음)
// ko: "/posts/fat-jar", en: "/en/posts/fat-jar"
export function localePath(locale: Locale, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${prefix}${normalized}` || "/";
}

// canonical·hreflang·사이트맵에 사용하는 절대 URL 생성
// next.config의 trailingSlash: true와 일치시키기 위해 항상 뒤 슬래시를 붙인다
export function localeUrl(locale: Locale, path = "/"): string {
  const withoutTrailing = localePath(locale, path);
  const withTrailing = withoutTrailing.endsWith("/")
    ? withoutTrailing
    : `${withoutTrailing}/`;
  return `${SITE_URL}${withTrailing}`;
}

// 접두어가 붙는 로케일(기본 로케일 제외)을 경로 앞에서 걷어내기 위한 패턴
const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const LOCALE_PREFIX_PATTERN = new RegExp(
  `^/(?:${PREFIXED_LOCALES.join("|")})(?=/|$)`
);

// 경로에서 로케일 접두어와 뒤 슬래시를 제거해 로케일 중립 경로로 정규화
// usePathname()은 인코딩·뒤 슬래시가 포함된 경로를 주므로 비교 전에 반드시 통과시킨다
export function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(LOCALE_PREFIX_PATTERN, "") || "/";
  return stripped !== "/" && stripped.endsWith("/")
    ? stripped.slice(0, -1)
    : stripped;
}

// 로케일 간 경로 변환 — 언어 스위처에서 현재 경로의 대응 경로를 계산할 때 사용
export function switchLocalePath(pathname: string, to: Locale): string {
  return localePath(to, stripLocalePrefix(pathname));
}

// 방문자의 선호 언어 목록(navigator.languages)에서 안내할 대상 로케일을 고른다.
//
// 자동 리다이렉트는 하지 않는다 (Google 권고). 안내 배너를 띄울지 판단하는 용도이며,
// 현재 보고 있는 로케일이 선호 목록에 있으면 안내할 필요가 없으므로 null을 반환한다.
export function pickPreferredLocale(
  preferred: readonly string[],
  current: Locale
): Locale | null {
  // "en-US" -> "en" 처럼 지역 구분자를 떼고 기본 언어만 본다
  const base = preferred
    .map((tag) => tag.toLowerCase().split("-")[0])
    .filter(Boolean);

  // 현재 로케일을 이미 선호하면 안내하지 않는다
  if (base.includes(current)) return null;

  // 선호 순서대로 보고, 지원하는 로케일 중 첫 번째를 고른다
  for (const lang of base) {
    const match = LOCALES.find((locale) => locale === lang);
    if (match && match !== current) return match;
  }
  return null;
}

type DateStyle = "long" | "short";

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { year: "numeric", month: "long", day: "numeric" },
  short: { year: "numeric", month: "short", day: "numeric" },
};

// 로케일에 맞춘 날짜 표기 — 기존 ko 출력과 동일한 결과를 유지한다
export function formatDate(
  value: string | Date,
  locale: Locale,
  style: DateStyle = "long"
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(DATE_LOCALE[locale], DATE_OPTIONS[style]);
}
