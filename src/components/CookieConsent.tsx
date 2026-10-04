"use client";

import { useEffect, useState } from "react";
import { GA_MEASUREMENT_ID } from "@/lib/config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "cookie-consent";
const GA_SCRIPT_ID = "google-analytics-script";

type ConsentChoice = "granted" | "denied";

function applyConsent(choice: ConsentChoice) {
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
  });
}

// 동의가 있을 때만 gtag.js를 로드하고 GA를 초기화한다.
// 동의 전에는 이 함수가 호출되지 않으므로 Google로 어떤 요청도 나가지 않는다.
function loadAnalytics() {
  if (document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | ConsentChoice
      | null;

    if (stored === "granted") {
      // 이전에 동의한 사용자: 동의 상태를 재적용하고 GA를 로드한다.
      applyConsent("granted");
      loadAnalytics();
      return;
    }

    if (stored === "denied") {
      // 이전에 거부한 사용자: 기본값(denied)을 유지할 뿐, GA는 로드하지 않는다.
      applyConsent("denied");
      return;
    }

    setVisible(true);
  }, []);

  const handleChoice = (choice: ConsentChoice) => {
    window.localStorage.setItem(STORAGE_KEY, choice);
    applyConsent(choice);
    if (choice === "granted") {
      loadAnalytics();
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="쿠키 사용 동의"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6"
    >
      <div className="max-w-xl mx-auto rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 sm:p-6">
        <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">
          이 사이트는 방문자 통계 분석을 위해 쿠키를 사용합니다. 동의하시면
          Google Analytics를 통한 분석에 사용되며, 거부하셔도 서비스 이용에는
          제한이 없습니다.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleChoice("denied")}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md"
          >
            거부
          </button>
          <button
            type="button"
            onClick={() => handleChoice("granted")}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-md"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
