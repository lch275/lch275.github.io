"use client";

import { usePathname } from "next/navigation";
import {
  getDictionary,
  localePath,
  LOCALES,
  switchLocalePath,
  type Locale,
  withTrailingSlash,
} from "@/lib/i18n";

interface Props {
  locale: Locale;
  // 전체 로케일에서 실제로 생성된 경로 목록 (빌드 시점에 결정)
  availablePaths: string[];
}

export default function LanguageSwitcher({ locale, availablePaths }: Props) {
  const pathname = usePathname();

  return (
    <>
      {LOCALES.filter((target) => target !== locale).map((target) => {
        const mirrored = switchLocalePath(pathname, target);
        // 대응 페이지가 없으면(예: 아직 번역되지 않은 포스트) 해당 로케일 홈으로 보낸다.
        // 존재하지 않는 URL로 링크해 404를 만들지 않기 위함이다.
        const href = availablePaths.includes(mirrored)
          ? mirrored
          : localePath(target, "/");
        const languageName = getDictionary(target).languageName;

        return (
          // 로케일별로 루트 레이아웃이 달라 전체 페이지 이동이 필요하므로 <a>를 사용한다
          <a
            key={target}
            href={withTrailingSlash(href)}
            hrefLang={target}
            lang={target}
            aria-label={getDictionary(locale).nav.switchTo(languageName)}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {languageName}
          </a>
        );
      })}
    </>
  );
}
