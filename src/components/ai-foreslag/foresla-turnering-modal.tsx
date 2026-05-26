"use client";

/**
 * AIForeslaaTurneringModal — modal som foreslår turneringer matchet mot
 * spillerens HCP, kalender og avstand.
 *
 * Variant A "Modal med filter-strip" fra Claude Design-bundle
 * Sg2FEKvykU45c4naIgQx6w (s6-ai-turnering.jsx).
 */

import { useState } from "react";
import { Check, Calendar, Sparkles } from "lucide-react";
import { AthleticButton } from "@/components/athletic";
import { AIForeslagModalShell } from "./modal-shell";

type Match = "TOPP-VALG" | "PRIORITERT" | "BRA MATCH" | "OK";

type Tournament = {
  name: string;
  tour: string;
  date: string;
  loc: string;
  hcpReq: string;
  mine: string;
  prob: string;
  distance: string;
  travel: string;
  purse: string;
  match: Match;
};

const TOURNAMENTS: Tournament[] = [
  {
    name: "Olyo Tour · Larvik Open",
    tour: "OLYO TOUR",
    date: "14–16 JUN",
    loc: "Larvik GK",
    hcpReq: "0–5",
    mine: "+3,5",
    prob: "Topp 30% sannsynlighet for topp-10.",
    distance: "142 km",
    travel: "1t 56m",
    purse: "kr 80 000",
    match: "BRA MATCH",
  },
  {
    name: "Srixon Tour · Holtsmark",
    tour: "SRIXON",
    date: "21–22 JUN",
    loc: "Holtsmark GK",
    hcpReq: "+2 til 4",
    mine: "+3,5",
    prob: "Topp 40% sannsynlighet for topp-5.",
    distance: "38 km",
    travel: "42 min",
    purse: "kr 45 000",
    match: "TOPP-VALG",
  },
  {
    name: "Garmin Norges Cup · Oslo GK",
    tour: "GARMIN NC",
    date: "28–30 JUN",
    loc: "Oslo GK",
    hcpReq: "0–8",
    mine: "+3,5",
    prob: "Topp 25% sannsynlighet for å vinne.",
    distance: "12 km",
    travel: "18 min",
    purse: "kr 60 000",
    match: "TOPP-VALG",
  },
  {
    name: "Olyo Tour · Trondheim Klassisk",
    tour: "OLYO TOUR",
    date: "05–07 JUL",
    loc: "Trondheim GK",
    hcpReq: "0–5",
    mine: "+3,5",
    prob: "Topp 35% sannsynlighet for topp-10.",
    distance: "498 km",
    travel: "fly · 1t 10m",
    purse: "kr 80 000",
    match: "OK",
  },
  {
    name: "Junior NM 2026",
    tour: "NM",
    date: "20–24 JUL",
    loc: "Bærum GK",
    hcpReq: "U18",
    mine: "17 år",
    prob: "Topp 15% sannsynlighet for medalje.",
    distance: "8 km",
    travel: "15 min",
    purse: "STATUS",
    match: "PRIORITERT",
  },
];

const MATCH_COLORS: Record<Match, string> = {
  "TOPP-VALG": "bg-emerald-100 text-emerald-800",
  "PRIORITERT": "bg-purple-100 text-purple-800",
  "BRA MATCH": "bg-sky-100 text-sky-800",
  OK: "bg-muted text-muted-foreground",
};

export function AIForeslaaTurneringModal({
  open,
  onClose,
  onEnroll,
}: {
  open: boolean;
  onClose: () => void;
  onEnroll?: (names: string[]) => void;
}) {
  const [picked, setPicked] = useState<Set<number>>(new Set([1, 2]));
  const [filter, setFilter] = useState<string>("alle");

  const filtered = TOURNAMENTS.filter((t) => {
    if (filter === "alle") return true;
    if (filter === "olyo") return t.tour === "OLYO TOUR";
    if (filter === "srixon") return t.tour === "SRIXON";
    if (filter === "nm") return t.tour === "NM";
    if (filter === "juni") return t.date.includes("JUN");
    if (filter === "juli") return t.date.includes("JUL");
    return true;
  });

  function toggle(i: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleEnroll() {
    const names = TOURNAMENTS.filter((_, i) => picked.has(i)).map((t) => t.name);
    onEnroll?.(names);
    onClose();
  }

  return (
    <AIForeslagModalShell
      open={open}
      onClose={onClose}
      eyebrow="AI · Claude"
      titleLead="AI-foreslå"
      titleItalic="turnering"
      width={640}
      footerLeft="5 turneringer · juni–juli · matchet mot HCP og kalender"
      footerRight={
        <>
          <AthleticButton type="button" variant="ghost-light" size="sm" onClick={onClose}>
            Lukk
          </AthleticButton>
          <AthleticButton
            type="button"
            variant="lime"
            size="sm"
            disabled={picked.size === 0}
            onClick={handleEnroll}
          >
            Meld på {picked.size} valgt
          </AthleticButton>
        </>
      }
    >
      {/* Filter-strip */}
      <div className="mb-4 -mt-2 flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        <FilterPill label="Alle" count={5} active={filter === "alle"} onClick={() => setFilter("alle")} />
        <FilterPill label="Olyo" count={2} active={filter === "olyo"} onClick={() => setFilter("olyo")} />
        <FilterPill label="Srixon" count={1} active={filter === "srixon"} onClick={() => setFilter("srixon")} />
        <FilterPill label="NM" count={1} active={filter === "nm"} onClick={() => setFilter("nm")} />
        <span className="mx-1.5 h-4 w-px bg-border" />
        <FilterPill
          label="Juni"
          icon={<Calendar className="h-3 w-3" />}
          active={filter === "juni"}
          onClick={() => setFilter("juni")}
        />
        <FilterPill label="Juli" active={filter === "juli"} onClick={() => setFilter("juli")} />
      </div>

      <div className="space-y-3.5">
        {filtered.map((t) => {
          const idx = TOURNAMENTS.indexOf(t);
          return (
            <TournamentCard
              key={t.name}
              tournament={t}
              picked={picked.has(idx)}
              onToggle={() => toggle(idx)}
            />
          );
        })}
      </div>
    </AIForeslagModalShell>
  );
}

function FilterPill({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? "border-primary bg-primary text-accent"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-px tabular-nums ${active ? "bg-white/20" : "bg-muted"}`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function TournamentCard({
  tournament: t,
  picked,
  onToggle,
}: {
  tournament: Tournament;
  picked: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border bg-card p-4 transition ${
        picked ? "border-primary shadow-[0_0_0_3px_rgba(0,88,64,0.08)]" : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
              {t.tour}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {t.date}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold leading-snug">{t.name}</h3>
          <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
            {t.loc} · {t.distance} · {t.travel}
          </div>
        </div>
        <span
          className={`font-mono shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${MATCH_COLORS[t.match]}`}
        >
          {t.match}
        </span>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-3 gap-2 border-y border-border py-3">
        <Spec label="HCP-KRAV" value={t.hcpReq} />
        <Spec label="DITT NIVÅ" value={`${t.mine} ✓`} valueClass="text-emerald-700" />
        <Spec label="PURSE" value={t.purse} />
      </div>

      {/* AI-vurdering */}
      <div className="rounded-md border-l-[3px] border-accent bg-accent/10 py-2 pl-3 pr-2.5">
        <div className="font-mono inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
          <Sparkles className="h-3 w-3" /> AI-VURDERING
        </div>
        <p
          className="mt-1 text-sm leading-snug"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic" }}
        >
          {t.prob}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={`font-display flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-bold transition ${
            picked
              ? "bg-primary text-accent"
              : "bg-accent text-primary hover:brightness-105"
          }`}
        >
          {picked ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Påmeldt
            </>
          ) : (
            "Meld på"
          )}
        </button>
        <button
          type="button"
          className="font-display inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-xs font-semibold"
        >
          Detaljer →
        </button>
      </div>
    </article>
  );
}

function Spec({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className={`font-mono mt-0.5 text-xs font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
