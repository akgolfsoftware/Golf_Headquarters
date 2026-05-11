/**
 * PILOT — Edge · Offline
 * Bygd direkte fra wireframe/design-files-v2/screens/42-edge-offline.html
 * URL: /edge-offline-demo
 *
 * Full-screen edge case: ingen forbindelse, lokal kø.
 */

import { WifiOff, RefreshCw } from "lucide-react";

interface QueueRow {
  status: "pending" | "cached";
  title: string;
  meta: string;
}

const QUEUE: QueueRow[] = [
  {
    status: "pending",
    title: "Tap-event #438 · driver · 248 m",
    meta: "19:18:42 · landing right rough",
  },
  {
    status: "pending",
    title: "RPE-rad økt 19:04",
    meta: "19:14:11 · score 6/10 · «litt øm i venstre skulder»",
  },
  {
    status: "pending",
    title: "Video-klipp · 8,2 s · 1080p",
    meta: "19:11:02 · 2,8 MB · swing-vinkel front",
  },
  {
    status: "cached",
    title: "Tap-event #437 · 7-iron · 142 m",
    meta: "19:06:14 · landing green",
  },
  {
    status: "cached",
    title: "…og 8 hendelser til",
    meta: "alle lagret lokalt — ingen tapt",
  },
];

export default function EdgeOfflineDemo() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Offline-bar */}
        <div className="mb-6 flex w-full max-w-[640px] items-center gap-3 rounded-md bg-[#23211D] px-5 py-3 text-white">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#B8852A]" />
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-[#B8852A]/20 text-[#D1A85C]">
            <WifiOff className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left text-[13px] leading-relaxed">
            <b className="font-semibold">Du er offline.</b> Vi fortsetter å lagre lokalt — alt synces automatisk når
            forbindelsen er tilbake.
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-white/55">
              Siste synk 19:04 · oppstart-cache · range-WiFi har lav signalstyrke
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary/30 text-muted-foreground">
          <WifiOff className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-[32px] font-medium leading-[1.15] tracking-tight">
          Ingen panikk — <em className="font-normal italic">vi har dataene</em>
        </h1>
        <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-muted-foreground">
          12 swings, 3 RPE-rader og en video-klipp ligger trygt i køen. Du kan fortsette å logge — vi sender alt til
          Anders så snart vi er online igjen.
        </p>

        {/* Queue */}
        <div className="mt-8 w-full max-w-[560px] rounded-lg border border-border bg-card p-5 text-left">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.06em]">
            <span className="text-muted-foreground">Synk-kø · 12 hendelser</span>
            <span className="text-primary">3,4 MB</span>
          </div>
          <ul className="flex flex-col">
            {QUEUE.map((row, i) => (
              <li
                key={i}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed border-border py-2.5 last:border-b-0"
              >
                <span
                  className={`h-2 w-2 rounded-full ${row.status === "cached" ? "bg-[#1A7D56]" : "bg-[#B8852A]"}`}
                />
                <div className="text-[13px]">
                  <div className="text-foreground">{row.title}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{row.meta}</div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  {row.status === "cached" ? "Cachet ✓" : "Venter"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Prøv synk nå
          </button>
          <button className="rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary">
            Fortsett offline
          </button>
        </div>
      </div>
    </div>
  );
}
