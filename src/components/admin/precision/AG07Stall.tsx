"use client";

/**
 * AG-07 Stall i Precision Athletics — porting av /admin/spillere.
 * Grunnlag: designsystem/precision-athletics/ui_kits/agencyos/screens/AG-07.jsx.
 *
 * Grupperingen er BYTTET per beslutninger.md §SKJERMENE I PLAYERHQ OG AGENCYOS
 * ETTER GRILLINGEN RUNDE 8 (Anders 28.09.2026): «Stall i tre bånd: I dag ·
 * Trener nå · Hele stallen. Coach kan sende melding under økta.» Dette
 * overstyrer AG-07-tegningens gruppering på status (Aktiv/Skadet/Pause/Ny/
 * Inaktiv) — den grupperingen brukes ikke her.
 *
 * ACWR er ikke i datamodellen (§Særlig for A2, 28.09) — vises ikke i det hele
 * tatt her, i stedet for et hardkodet tall.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Flag, MessageSquarePlus, Search, UserPlus, Users } from "lucide-react";
import { Sidehode, Knapp, KnappLenke, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Bolkoverskrift, Sokefelt, SegmentertValg, Tabell, type Kolonne } from "@/components/precision/pa-a2";
import type { StallBaandRad } from "@/lib/admin/stall-precision-data";
import { fmtSg } from "@/lib/v2/format";

export type AG07Props = {
  tilstand?: "data" | "tom";
  total: number;
  iDag: readonly StallBaandRad[];
  trenerNaa: readonly StallBaandRad[];
  heleStallen: readonly StallBaandRad[];
  nyttGruppeFilter: readonly { id: string; label: string }[];
};

/**
 * Rust (--signal) er forbeholdt det som haster eller ødelegger, høyst én per
 * flate (beslutninger.md §Farge betyr akse). En stall-status som gjentas per
 * rad kan ikke bruke rust — «Bak plan» og «Ønsker veil.» bruker warn (amber)
 * i stedet, aldri signal.
 */
const STATUS_TONE: Record<StallBaandRad["status"], "ok" | "warn" | "neutral"> = {
  aktiv: "ok",
  bak: "warn",
  veil: "warn",
  inaktiv: "neutral",
  hviler: "neutral",
};

function klokke(minutt: number): string {
  return `${String(Math.floor(minutt / 60)).padStart(2, "0")}:${String(minutt % 60).padStart(2, "0")}`;
}

function avtaleUtlop(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" }).format(new Date(iso));
}

/** Fasitens programnavn (beslutninger.md §Data · GRUPPE_LABEL i den gamle Stallen-siden). */
const GRUPPE_LABEL: Record<string, string> = {
  WANG: "WANG Toppidrett",
  GFGK: "GFGK Junior",
  AKA: "AK Golf Academy",
};
const gruppeNavn = (r: StallBaandRad) => (r.group ? (GRUPPE_LABEL[r.group] ?? r.group) : "Uten gruppe");

export function AG07Stall({ tilstand = "data", total, iDag, trenerNaa, heleStallen, nyttGruppeFilter }: AG07Props) {
  const router = useRouter();
  const gaaTilSpiller = (r: StallBaandRad) => router.push(`/admin/spillere/${r.id}`);
  const [q, setQ] = useState("");
  const [grp, setGrp] = useState<string>("alle");

  const filtrert = useMemo(() => {
    const s = q.trim().toLowerCase();
    return heleStallen.filter((r) => {
      const treffQ = !s || r.name.toLowerCase().includes(s);
      const treffGrp = grp === "alle" || (r.group ?? "").toUpperCase() === grp.toUpperCase();
      return treffQ && treffGrp;
    });
  }, [heleStallen, q, grp]);

  const felles: Kolonne<StallBaandRad>[] = [
    { key: "navn", label: "Spiller", lead: true, render: (r) => <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ font: "500 var(--fs-14)/1.3 var(--font-sans)" }}>{r.name}</span>
      <span className="kicker">{gruppeNavn(r).toUpperCase()}</span>
    </span> },
    { key: "status", label: "Status", render: (r) => <StatusPille tone={STATUS_TONE[r.status]}>{r.statusLabel}</StatusPille> },
    { key: "hcp", label: "HCP", mono: true, align: "right", render: (r) => r.hcp },
    { key: "sg", label: "SG-form", mono: true, align: "right", render: (r) => (r.sgTrend.length ? fmtSg(r.sgTrend[r.sgTrend.length - 1]) : "—") },
    { key: "adh", label: "Etterlevelse", mono: true, align: "right", render: (r) => (r.adhPct == null ? "—" : `${r.adhPct} %`) },
  ];

  const iDagKol: Kolonne<StallBaandRad>[] = [
    felles[0]!,
    { key: "tid", label: "Neste økt", mono: true, render: (r) => r.nesteOktLabel },
    { key: "status", label: "Status", render: (r) => <StatusPille tone={STATUS_TONE[r.status]}>{r.statusLabel}</StatusPille> },
  ];

  const trenerNaaKol: Kolonne<StallBaandRad>[] = [
    felles[0]!,
    { key: "okt", label: "Pågår", render: (r) => r.paagaaende ? `${r.paagaaende.tittel} · ${klokke(r.paagaaende.startMinute)}–${klokke(r.paagaaende.startMinute + r.paagaaende.durationMinutes)}` : "—" },
    { key: "live", label: "", render: () => <StatusPille tone="live">Pågår</StatusPille> },
    { key: "meld", label: "", align: "right", render: (r) => <span onClick={(e) => e.stopPropagation()}><KnappLenke variant="secondary" size="sm" icon={MessageSquarePlus} href={`/admin/innboks?spiller=${r.id}`}>Send melding</KnappLenke></span> },
  ];

  const heleKol: Kolonne<StallBaandRad>[] = [
    ...felles,
    { key: "neste", label: "Neste økt", mono: true, render: (r) => r.nesteOktLabel },
    { key: "siste", label: "Siste aktivitet", mono: true, render: (r) => r.sisteAktivitetLabel },
    { key: "avtale", label: "Avtale utløper", mono: true, align: "right", render: (r) => avtaleUtlop(r.avtaleUtlopIso) },
  ];

  return <div className="pa-side">
    <Sidehode
      kicker={`Stall · ${tilstand === "tom" ? "—" : `${total} spillere`}`}
      title="Stall"
      sub="I dag · Trener nå · Hele stallen. Etterlevelse = gjennomført tid mot planlagt tid, siste fire uker."
    />
    {tilstand === "tom" ? (
      <TomTilstand icon={Users} title="Ingen spillere ennå" text="Legg til første spiller for å komme i gang." actions={<KnappLenke href="/admin/spillere/ny" icon={UserPlus}>Ny spiller</KnappLenke>} />
    ) : <>
      <section style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <Bolkoverskrift icon={CalendarClock} tittel="I dag" antall={iDag.length} />
        {iDag.length === 0
          ? <TomTilstand icon={CalendarClock} title="Ingen økter i dag" text="Ingen spillere har en planlagt økt i dag." />
          : <Tabell kolonner={iDagKol} rader={iDag} onVelg={gaaTilSpiller} tomTekst="Ingen økter i dag." />}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <Bolkoverskrift icon={Flag} tittel="Trener nå" antall={trenerNaa.length} />
        {trenerNaa.length === 0
          ? <TomTilstand icon={Flag} title="Ingen økt pågår" text="Ingen spillere er i en pågående økt nå." />
          : <Tabell kolonner={trenerNaaKol} rader={trenerNaa} onVelg={gaaTilSpiller} tomTekst="Ingen økt pågår." />}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <Bolkoverskrift icon={Users} tittel="Hele stallen" antall={filtrert.length} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Sokefelt label="Søk etter navn" value={q} onChange={setQ} />
          <SegmentertValg label="Gruppe" value={grp} onChange={setGrp} options={nyttGruppeFilter} />
          <span style={{ flex: 1 }} />
          <KnappLenke href="/admin/spillere/ny" icon={UserPlus} variant="secondary">Ny spiller</KnappLenke>
        </div>
        {filtrert.length === 0
          ? <TomTilstand icon={Search} title="Ingen treff" text={`Ingen spillere heter «${q}» i valgt gruppe.`} actions={<Knapp variant="ghost" onClick={() => { setQ(""); setGrp("alle"); }}>Nullstill søk</Knapp>} />
          : <Tabell kolonner={heleKol} rader={filtrert} onVelg={gaaTilSpiller} tomTekst="Ingen spillere." />}
      </section>
    </>}
  </div>;
}
