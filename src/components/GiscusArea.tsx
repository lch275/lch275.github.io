"use client";

import Giscus from "@giscus/react";
import { HTML_LANG, type Locale } from "@/lib/i18n";

interface Props {
    locale: Locale;
}

// mapping="pathname"이므로 /posts/x/ 와 /en/posts/x/ 는 별도 댓글 스레드를 사용한다
export default function GiscusArea({ locale }: Props) {
    return (
        <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-800">
            <Giscus
                id="comments"
                repo="lch275/lch275.github.io"
                repoId="R_kgDONqoa8g"
                category="General"
                categoryId="DIC_kwDONqoa8s4CmC9L"
                mapping="pathname"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme="preferred_color_scheme"
                lang={HTML_LANG[locale]}
                loading="lazy"
            />
        </div>
    );
}
