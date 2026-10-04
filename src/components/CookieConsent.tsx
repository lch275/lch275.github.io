"use client";

import { useEffect, useState } from "react";
import { GA_MEASUREMENT_ID } from "@/lib/config";
import { getDictionary, type Locale } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "cookie-consent";
const GA_SCRIPT_ID = "google-analytics-script";
// 거부(미동의) 고객에게는 1시간마다 동의 팝업을 다시 노출한다.
const RE_PROMPT_INTERVAL_MS = 60 * 60 * 1000;

type ConsentChoice = "granted" | "denied";

type StoredConsent = {
  choice: ConsentChoice;
  timestamp: number;
};

function readStoredConsent(): StoredConsent | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.choice === "granted" || parsed?.choice === "denied") {
      return { choice: parsed.choice, timestamp: parsed.timestamp ?? 0 };
    }
  } catch {
    // 이전 버전(문자열만 저장)과의 호환: timestamp가 없으므로 즉시 재노출 대상으로 간주
    if (raw === "granted" || raw === "denied") {
      return { choice: raw, timestamp: 0 };
    }
  }
  return null;
}

function writeStoredConsent(choice: ConsentChoice) {
  const data: StoredConsent = { choice, timestamp: Date.now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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

interface Props {
  locale: Locale;
}

export default function CookieConsent({ locale }: Props) {
  const dict = getDictionary(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const stored = readStoredConsent();

      if (!stored) {
        setVisible(true);
        return;
      }

      if (stored.choice === "granted") {
        // 동의한 사용자는 재노출 대상이 아니다.
        applyConsent("granted");
        loadAnalytics();
        setVisible(false);
        return;
      }

      // 미동의(거부) 사용자: 마지막 거부로부터 1시간이 지났다면 다시 팝업을 띄운다.
      const elapsed = Date.now() - stored.timestamp;
      if (elapsed >= RE_PROMPT_INTERVAL_MS) {
        setVisible(true);
      } else {
        applyConsent("denied");
        setVisible(false);
      }
    };

    evaluate();
    // 페이지를 오래 열어두는 경우에도 1시간마다 재평가되도록 주기적으로 체크한다.
    const interval = window.setInterval(evaluate, RE_PROMPT_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const handleChoice = (choice: ConsentChoice) => {
    writeStoredConsent(choice);
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
      aria-label={dict.consent.label}
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6"
    >
      <div className="max-w-xl mx-auto rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-5 sm:p-6">
        <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">
          {dict.consent.message}
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleChoice("denied")}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md"
          >
            {dict.consent.decline}
          </button>
          <button
            type="button"
            onClick={() => handleChoice("granted")}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-md"
          >
            {dict.consent.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
