/**
 * DEMO — Facility detail · loading
 * Bygd fra wireframe modaler-C/03-facility-detail-loading.html
 * URL: /facility-detail-loading-demo
 */

import { Loader2, X } from "lucide-react";

export default function FacilityDetailLoadingDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Hero skeleton */}
        <div className="relative flex h-[180px] items-end bg-gradient-to-r from-[#1F2724] via-[#2A332F] to-[#1F2724] px-6 py-5">
          <span className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
        </div>

        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div className="flex flex-col gap-2">
            <span className="h-2.5 w-60 animate-pulse rounded-sm bg-secondary" />
            <span className="h-7 w-48 animate-pulse rounded-md bg-secondary" />
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-3.5 border-b border-border bg-card px-6 py-3.5">
          <span className="h-4 w-20 animate-pulse rounded-sm bg-secondary" />
          <span className="h-4 w-16 animate-pulse rounded-sm bg-secondary" />
          <span className="h-4 w-14 animate-pulse rounded-sm bg-secondary" />
          <span className="h-4 w-32 animate-pulse rounded-sm bg-secondary" />
        </div>

        {/* Body */}
        <div className="relative px-6 py-6">
          {/* Spinner tag */}
          <div className="absolute left-1/2 top-4 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] font-semibold text-muted-foreground shadow-md">
            <Loader2 size={11} strokeWidth={2} className="animate-spin" />
            Henter fasilitet …
          </div>

          {/* Price card skeleton */}
          <div className="mt-8 mb-5 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-5 py-4">
            <div className="flex flex-col gap-2">
              <span className="h-2.5 w-14 animate-pulse rounded-sm bg-secondary" />
              <span className="h-6 w-32 animate-pulse rounded-md bg-secondary" />
              <span className="h-2.5 w-48 animate-pulse rounded-sm bg-secondary" />
            </div>
            <span className="h-9 w-24 animate-pulse rounded-md bg-secondary" />
          </div>

          {/* Description skeleton */}
          <div className="mb-5 flex flex-col gap-2">
            <span className="h-3 w-full animate-pulse rounded-sm bg-secondary" />
            <span className="h-3 w-[96%] animate-pulse rounded-sm bg-secondary" />
            <span className="h-3 w-[74%] animate-pulse rounded-sm bg-secondary" />
          </div>

          {/* Stats skeleton */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3.5"
              >
                <span className="h-2 w-[70%] animate-pulse rounded-sm bg-secondary" />
                <span className="h-5 w-1/2 animate-pulse rounded-md bg-secondary" />
                <span className="h-2.5 w-[80%] animate-pulse rounded-sm bg-secondary" />
              </div>
            ))}
          </div>

          {/* Address skeleton */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
            <span className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-secondary" />
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="h-3 w-3/5 animate-pulse rounded-sm bg-secondary" />
              <span className="h-2.5 w-4/5 animate-pulse rounded-sm bg-secondary" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Lukk
          </button>
          <div className="flex items-center gap-2">
            <span className="h-9 w-[70px] animate-pulse rounded-md bg-secondary" />
            <span className="h-9 w-[110px] animate-pulse rounded-md bg-accent/40" />
          </div>
        </footer>
      </div>
    </div>
  );
}
