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

// 로케일 간 경로 변환 — 언어 스위처에서 현재 경로의 대응 경로를 계산할 때 사용
export function switchLocalePath(pathname: string, to: Locale): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const normalized =
    stripped !== "/" && stripped.endsWith("/") ? stripped.slice(0, -1) : stripped;
  return localePath(to, normalized);
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
