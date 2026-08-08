import { lazy, Suspense, useEffect, useRef, useState } from "react";

const SchoolTrendChart = lazy(() => import("./SchoolTrendChart"));

type TrendData = Array<{
  year: number;
  gpa: number | null;
  datAa?: number;
  datPat?: number;
}>;

export default function DeferredSchoolTrendChart({
  data,
}: {
  data: TrendData;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="min-h-[300px]" aria-busy={!visible}>
      {visible ? (
        <Suspense
          fallback={
            <div className="h-[300px] animate-pulse rounded-lg bg-[var(--page-muted)]" />
          }
        >
          <SchoolTrendChart data={data} />
        </Suspense>
      ) : null}
    </div>
  );
}
