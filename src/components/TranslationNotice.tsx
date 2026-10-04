"use client";

import { usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  getDictionary,
  localePath,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n";

interface Props {
  // 번역된 페이지의 로케일 (기본 로케일이 아닌 로케일)
  locale: Locale;
  // 전체 로케일에서 실제로 생성된 경로 목록 (빌드 시점에 결정)
  availablePaths: string[];
}

// 번역된 페이지임을 밝히고 원문으로 가는 링크를 제공한다.
//
// 상태나 브라우저 API에 의존하지 않으므로 프리렌더된 HTML에 그대로 포함된다.
// 고지 성격의 내용이라 JS가 꺼져 있거나 크롤러가 보는 문서에서도 보여야 한다.
// (usePathname을 쓰기 위해서만 클라이언트 컴포넌트다)
export default function TranslationNotice({ locale, availablePaths }: Props) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  const original = switchLocalePath(pathname, DEFAULT_LOCALE);
  // 대응하는 원문 페이지가 없으면 원문 로케일 홈으로 보낸다
  const href = availablePaths.includes(original)
    ? original
    : localePath(DEFAULT_LOCALE, "/");

  return (
    <div className="border-b border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 text-sm text-amber-900 dark:text-amber-200">
        {dict.translationNotice.message}{" "}
        {/* 로케일별로 루트 레이아웃이 달라 전체 페이지 이동이 필요하므로 <a>를 쓴다 */}
        <a
          href={href}
          hrefLang={DEFAULT_LOCALE}
          className="font-medium underline hover:no-underline"
        >
          {dict.translationNotice.action} →
        </a>
      </div>
    </div>
  );
}
