"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getDictionary,
  localePath,
  pickPreferredLocale,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n";

const STORAGE_KEY = "locale-hint-dismissed";

interface Props {
  locale: Locale;
  // 전체 로케일에서 실제로 생성된 경로 목록 (빌드 시점에 결정)
  availablePaths: string[];
}

// 방문자의 브라우저 언어가 현재 페이지 언어와 다를 때 다른 언어 버전을 안내한다.
//
// 자동 리다이렉트는 하지 않는다 — Google은 감지된 언어에 따라 사용자를 자동으로
// 다른 언어 버전으로 보내지 말라고 안내한다(크롤러가 전체 버전을 못 보게 되고,
// 원래 언어를 보려는 사용자를 방해한다). 그래서 링크만 제시하고 선택은 맡긴다.
//
// navigator는 서버에 없으므로 마운트 이후에만 렌더된다. 즉 프리렌더된 HTML에는
// 포함되지 않아 크롤러가 보는 문서에는 영향이 없다.
export default function LocaleHint({ locale, availablePaths }: Props) {
  const pathname = usePathname();
  const [target, setTarget] = useState<Locale | null>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // 스토리지를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 그냥 안내한다
    }
    if (dismissed) return;

    const preferred =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language];

    setTarget(pickPreferredLocale(preferred, locale));
  }, [locale]);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // 저장에 실패해도 이번 세션에서는 닫힌 상태를 유지한다
    }
    setTarget(null);
  };

  if (!target) return null;

  const dict = getDictionary(target);
  const mirrored = switchLocalePath(pathname, target);
  // 대응 페이지가 없으면(미번역 포스트) 해당 로케일 홈으로 보낸다
  const href = availablePaths.includes(mirrored)
    ? mirrored
    : localePath(target, "/");

  return (
    <div
      lang={target}
      className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 text-sm">
        <p className="text-gray-600 dark:text-neutral-400">
          {dict.localeHint.message}{" "}
          {/* 루트 레이아웃이 로케일별로 달라 전체 페이지 이동이 필요하므로 <a>를 쓴다 */}
          <a
            href={href}
            hrefLang={target}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {dict.localeHint.action} →
          </a>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
        >
          {dict.localeHint.dismiss}
        </button>
      </div>
    </div>
  );
}
