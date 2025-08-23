// 코드 블록 컴포넌트 - MDX 콘텐츠의 <pre> 태그를 대체하여 복사 기능 제공
// 클라이언트 컴포넌트로 구현하여 사용자 인터랙션 처리

"use client";

import { isValidElement, useCallback, useMemo, useState } from "react";

// pre 태그의 모든 props를 상속받으면서 children을 명시적으로 정의
export type PreProps = React.ComponentProps<"pre"> & { children?: React.ReactNode };

// React 노드에서 순수 텍스트를 추출하는 재귀 함수
// MDX 렌더링 결과는 복잡한 React 노드 구조이므로 텍스트만 추출 필요
function extractText(node: React.ReactNode): string {
  // null 또는 undefined인 경우 빈 문자열 반환
  if (node == null) return "";
  
  // 문자열이나 숫자인 경우 문자열로 변환하여 반환
  if (typeof node === "string" || typeof node === "number") return String(node);
  
  // 배열인 경우 각 요소를 재귀적으로 처리하여 합침
  if (Array.isArray(node)) return node.map(extractText).join("");
  
  // React 엘리먼트인 경우 children을 재귀적으로 처리
  if (isValidElement(node)) {
    const { children } = (node.props as { children?: React.ReactNode });
    return extractText(children);
  }
  
  // 그 외의 경우 빈 문자열 반환
  return "";
}

// 코드 블록 컴포넌트 - 복사 버튼이 있는 향상된 pre 태그
export default function CodeBlock(props: PreProps) {
  // props를 분해하여 children과 className을 분리
  const { children, className, ...rest } = props;
  
  // 복사 상태 관리 - 복사 완료 시 시각적 피드백 제공
  const [copied, setCopied] = useState(false);

  // 코드 텍스트를 메모이제이션하여 불필요한 재계산 방지
  // children이 변경될 때만 다시 계산하고 앞뒤 공백 제거
  const codeText = useMemo(() => extractText(children).trim(), [children]);

  // 복사 버튼 클릭 핸들러를 메모이제이션
  const onCopy = useCallback(async () => {
    try {
      // 클립보드 API를 사용하여 코드 텍스트 복사
      await navigator.clipboard.writeText(codeText);
      
      // 복사 완료 상태로 변경하고 1.2초 후 원래 상태로 복원
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 클립보드 API 실패 시 조용히 무시 (사용자에게 에러 표시하지 않음)
    }
  }, [codeText]);

  return (
    // 상대 위치 컨테이너 - 복사 버튼을 절대 위치로 배치하기 위함
    // group 클래스로 호버 시 복사 버튼 표시 효과
    <div className="relative group">
      {/* 복사 버튼 - 호버 시에만 표시되는 플로팅 버튼 */}
      <button
        type="button"
        onClick={onCopy}
        // 절대 위치로 우상단에 배치, 호버 시 opacity 변경으로 부드러운 등장
        // 다크모드 지원을 위해 배경색 분기 처리
        className="absolute right-2 top-2 z-10 rounded bg-black/60 px-2 py-1 text-lg text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/20"
        aria-label="Copy code" // 접근성을 위한 스크린 리더용 레이블
      >
        {/* 복사 상태에 따른 텍스트 변경으로 사용자 피드백 제공 */}
        {copied ? "Copied" : "Copy"}
      </button>
      
      {/* 원본 pre 태그 - 모든 기존 props와 스타일 유지 */}
      <pre className={className} {...rest}>
        {children}
      </pre>
    </div>
  );
}


