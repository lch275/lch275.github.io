"use client";

import Giscus from "@giscus/react";

export default function GiscusArea() {
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
                lang="ko"
                loading="lazy"
            />
        </div>
    );
}
