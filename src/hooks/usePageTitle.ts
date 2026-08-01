import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | PreDent Canada` : "PreDent Canada";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
