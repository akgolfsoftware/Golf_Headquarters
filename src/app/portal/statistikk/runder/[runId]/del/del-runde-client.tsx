"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  Share2,
  Square,
  UserCheck,
  X,
} from "lucide-react";

type Format = "story" | "post" | "pdf" | "link";
type Synlighet = "privat" | "coach" | "offentlig";

type Runde = {
  id: string;
  score: number;
  relativ: number;
  kursNavn: string;
  playedAt: string;
  sgPutt: number | null;
  sgOtt: number | null;
  sgArg: number | null;
  sgApp: number | null;
};

type Spiller = {
  navn: string;
  initial: string;
  hcp: number | null;
  homeClub: string | null;
};

type Props = {
  runde: Runde;
  spiller: Spiller;
};

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativStr(r: number): string {
  if (r === 0) return "E";
  return r > 0 ? `+${r}` : `${r}`;
}

function sgFmt(v: number | null): string {
  if (v === null) return "–";
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
}

export function DelRundeClient({ runde, spiller }: Props) {
  const [format, setFormat] = useState<Format>("story");
  const [synlighet, setSynlighet] = useState<Synlighet>("coach");
  const [kopiert, setKopiert] = useState(false);
  const [lasterNed, setLasterNed] = useState(false);

  const sgPills: { label: string; v: number | null }[] = [
    { label: "PUTT", v: runde.sgPutt },
    { label: "IRON", v: runde.sgApp },
    { label: "CHIP", v: runde.sgArg },
    { label: "DRIVE", v: runde.sgOtt },
  ];

  const harSgData = sgPills.some((p) => p.v !== null);

  function kopierLenke() {
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://akgolf.no"}/r/${runde.id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2400);
    });
  }

  function lastNed() {
    setLasterNed(true);
    setTimeout(() => setLasterNed(false), 1600);
  }

  // Kort-stil basert på format
  const kortStil =
    format === "pdf"
      ? "bg-card border border-border text-foreground"
      : format === "link"
        ? "bg-gradient-to-b from-background to-[#ECECDF] text-foreground"
        : "bg-gradient-to-br from-[#006C50] to-[#003A2A] text-white";

  const scoreStil =
    format === "pdf"
      ? "text-primary text-[56px]"
      : format === "link"
        ? "text-primary text-[80px]"
        : "text-accent text-[96px]";

  const merkeStil =
    format === "pdf" || format === "link" ? "text-primary" : "text-accent";

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Del runde
          </h1>
          <p className="mt-1.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
            <strong className="text-foreground">{runde.kursNavn}</strong>
            {" · "}
            {formatDato(runde.playedAt)}
            {" · "}
            <strong className="text-foreground">
              {runde.score} ({relativStr(runde.relativ)})
            </strong>
          </p>
        </div>
        <Link
          href="/portal/statistikk"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>

      {/* Forhåndsvisning */}
      <div className="mb-5 flex items-center justify-center rounded-2xl bg-muted/40 p-4">
        <div
          className={`relative w-full max-w-xs overflow-hidden rounded-xl shadow-2xl ${kortStil} ${
            format === "story"
              ? "aspect-[9/16]"
              : format === "post"
                ? "aspect-square"
                : format === "link"
                  ? "aspect-[4/3]"
                  : "aspect-[8.5/11]"
          } flex flex-col p-6`}
        >
          {/* Bakgrunnsdekor (kun på story/post) */}
          {(format === "story" || format === "post") && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 90% 10%, rgba(209,248,67,0.20), transparent 60%)",
              }}
            />
          )}

          {/* Spillerhode */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
                format === "pdf" || format === "link"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground"
              }`}
            >
              {spiller.initial}
            </div>
            <div>
              <p
                className={`font-display text-sm font-semibold leading-tight ${
                  format === "pdf" || format === "link"
                    ? "text-foreground"
                    : "text-white"
                }`}
              >
                {spiller.navn}
              </p>
              <p
                className={`font-mono text-[10px] leading-snug ${
                  format === "pdf"
                    ? "text-muted-foreground"
                    : format === "link"
                      ? "text-muted-foreground"
                      : "text-accent/75"
                }`}
              >
                {spiller.hcp !== null ? `HCP ${spiller.hcp}` : ""}
                {spiller.homeClub ? ` · ${spiller.homeClub}` : ""}
              </p>
            </div>
          </div>

          {/* Score-blokk */}
          <div className="relative z-10 mt-auto">
            <p
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                format === "pdf" || format === "link"
                  ? "text-muted-foreground"
                  : "text-accent/70"
              }`}
            >
              RUNDE · 18 HULL
            </p>
            <p className={`font-display font-bold leading-none ${scoreStil}`}>
              {runde.score}
            </p>
            <div
              className={`mt-1 flex items-center gap-2 font-mono text-sm font-semibold ${
                format === "pdf" || format === "link"
                  ? "text-muted-foreground"
                  : "text-white/80"
              }`}
            >
              <span
                className={`rounded px-2 py-0.5 font-bold ${
                  format === "pdf" || format === "link"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/20 text-accent"
                }`}
              >
                {relativStr(runde.relativ)}
              </span>
              {runde.kursNavn} · {formatDato(runde.playedAt)}
            </div>

            {/* SG-piller */}
            {harSgData && (
              <div className="mt-4 flex flex-wrap gap-1">
                {sgPills
                  .filter((p) => p.v !== null)
                  .map((p) => (
                    <span
                      key={p.label}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] ${
                        format === "pdf" || format === "link"
                          ? "border-border bg-muted text-foreground"
                          : "border-white/16 bg-white/10 text-white"
                      }`}
                    >
                      {p.label}
                      <span
                        className={
                          (p.v ?? 0) >= 0
                            ? format === "pdf" || format === "link"
                              ? "text-emerald-600"
                              : "text-accent"
                            : format === "pdf" || format === "link"
                              ? "text-red-500"
                              : "text-red-300"
                        }
                      >
                        {sgFmt(p.v)}
                      </span>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Merke */}
          <p
            className={`absolute bottom-4 right-4 z-10 font-display text-[11px] font-bold uppercase tracking-[0.16em] ${merkeStil}`}
          >
            AK GOLF
          </p>
        </div>
      </div>

      {/* Format-velger */}
      <div className="mb-4">
        <span className="mb-1.5 block font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Format
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: "story", ikon: ImageIcon, nm: "Story", dim: "1080×1920" },
              { id: "post", ikon: Square, nm: "Post", dim: "1080×1080" },
              { id: "pdf", ikon: FileText, nm: "PDF", dim: "FULL SG-DATA" },
              { id: "link", ikon: Share2, nm: "Lenke", dim: "DELBAR URL" },
            ] as const
          ).map(({ id, ikon: Ikon, nm, dim }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-all ${
                format === id
                  ? "border-accent bg-accent/10 shadow-[0_0_0_2px_theme(colors.accent)]"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md ${
                  format === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Ikon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="font-display text-[11.5px] font-semibold leading-tight text-foreground">
                {nm}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/70">
                {dim}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Synlighet */}
      <div className="mb-6">
        <span className="mb-1.5 block font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Synlighet
        </span>
        <div className="grid grid-cols-3 gap-0.5 rounded-xl border border-border bg-muted p-1">
          {(
            [
              { id: "privat", ikon: Lock, label: "Privat" },
              { id: "coach", ikon: UserCheck, label: "Coach kan se" },
              { id: "offentlig", ikon: Globe, label: "Offentlig" },
            ] as const
          ).map(({ id, ikon: Ikon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSynlighet(id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-all ${
                synlighet === id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ikon className="h-3 w-3" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Handling-knapper */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={kopierLenke}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          {kopiert ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Kopier lenke
            </>
          )}
        </button>
        <button
          type="button"
          onClick={lastNed}
          disabled={lasterNed}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          {lasterNed ? "Laster ned…" : "Last ned"}
        </button>
      </div>

      {/* Toast */}
      {kopiert && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-6 py-2 text-sm font-medium text-white shadow-xl">
          <span className="flex items-center gap-2">
            <Check
              className="h-4 w-4 text-accent"
              strokeWidth={2.5}
            />
            Lenke kopiert
          </span>
        </div>
      )}
    </div>
  );
}
