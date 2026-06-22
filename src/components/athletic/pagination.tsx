"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  className?: string;
};

/** Paginering med sidetall + prev/next. 1-indeksert `page`. */
export function Pagination({ page, pageSize, total, onPage, className }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const nums: number[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== -1) nums.push(-1); // ellipsis-markør
  }

  const btn =
    "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-mono text-[11px] font-bold tabular-nums transition-colors";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t border-border px-4 py-3",
        className,
      )}
    >
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} av {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Forrige side"
          className={cn(btn, "text-muted-foreground hover:bg-secondary disabled:opacity-40")}
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        {nums.map((n, i) =>
          n === -1 ? (
            <span key={`e${i}`} className="px-1 font-mono text-[11px] text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                btn,
                n === page
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary",
              )}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Neste side"
          className={cn(btn, "text-muted-foreground hover:bg-secondary disabled:opacity-40")}
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
