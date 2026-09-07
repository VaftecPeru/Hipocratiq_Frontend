"use client";

import { useEffect } from "react";

const AUTH_TITLE_SUFFIX = " | Hipocratiq";

export function useAuthDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) {
      document.title = `${title}${AUTH_TITLE_SUFFIX}`;
    }
  }, [title]);
}
