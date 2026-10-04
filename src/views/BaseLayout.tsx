// 로케일별 루트 레이아웃의 공용 셸
// <html>/<body>는 루트 레이아웃에만 올 수 있으므로, 로케일별 루트 레이아웃이
// 이 컴포넌트를 각자의 locale로 렌더링한다.

import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import LocaleHint from "@/components/LocaleHint";
import TranslationNotice from "@/components/TranslationNotice";
import { SITE_NAME } from "@/lib/config";
import {
  DEFAULT_LOCALE,
  getDictionary,
  HTML_LANG,
  localeUrl,
  type Locale,
} from "@/lib/i18n";
import { listAllRoutePaths } from "@/lib/routes";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

interface Props {
  locale: Locale;
  children: React.ReactNode;
}

export default async function BaseLayout({ locale, children }: Props) {
  const dict = getDictionary(locale);
  // 언어 스위처가 존재하지 않는 경로로 링크하지 않도록 빌드 시점 경로 목록을 넘긴다
  const availablePaths = await listAllRoutePaths();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: localeUrl(locale, "/"),
    description: dict.siteDescription,
    inLanguage: HTML_LANG[locale],
  };

  return (
    <html lang={HTML_LANG[locale]}>
      {/*
        아래 두 규칙은 "루트 레이아웃 밖"을 전제로 경고하지만, 이 컴포넌트는
        로케일별 루트 레이아웃이 그대로 렌더링하는 셸이므로 실제로는 루트 레이아웃이다.
        (리팩터 전후 빌드 산출물이 동일함을 확인했다)
      */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/*
          동의 전에는 gtag.js 스크립트 자체를 로드하지 않는다(Basic Consent Mode).
          여기서는 dataLayer/gtag 스텁과 기본 동의 상태(전체 거부)만 등록해두고,
          실제 스크립트 로드 및 gtag('config', ...) 호출은 사용자가 동의했을 때
          CookieConsent 컴포넌트에서 수행한다.
        */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <Script
          id="google-analytics-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied'
                });
                `,
          }}
        />
      </head>
      <body className={`${notoSansKR.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {dict.skipToContent}
        </a>
        <SiteHeader locale={locale} availablePaths={availablePaths} />
        {/*
          번역된 페이지에는 번역 고지를, 원문 페이지에는 언어 안내를 보여준다.
          번역 고지가 이미 원문 링크를 포함하므로 둘을 함께 띄우면 중복이다.
        */}
        {locale === DEFAULT_LOCALE ? (
          <LocaleHint locale={locale} availablePaths={availablePaths} />
        ) : (
          <TranslationNotice locale={locale} availablePaths={availablePaths} />
        )}
        <main id="main-content">{children}</main>
        <SiteFooter />
        <CookieConsent locale={locale} />
      </body>
    </html>
  );
}
