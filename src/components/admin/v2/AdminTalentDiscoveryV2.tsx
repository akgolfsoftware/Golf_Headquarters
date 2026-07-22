"use client";

/**
 * AgencyOS Talent-discovery — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Scout-feed over spillere utenfor talent-tracking. T.* only.
 */

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  KpiFlis,
  FilterChips,
  Knapp,
  Velger,
  Inndata,
  ValideringsChip,
  TomTilstand,
  CTAPill,
  T,
} from "@/components/v2";
import {
  leggTilITalent,
  type LeggTilState,
} from "@/app/admin/(legacy)/talent/discovery/actions";

// ── Datakontrakt (mappes fra loaderen i ruten) ──────────────────
export interface TalentKandidat {
  id: string;
  navn: string;
  /** Rå HCP for filtrering; null = ukjent. */
  hcp: number | null;
  playingYears: number | null;
  homeClub: string | null;
}
export interface TalentDiscoveryV2Data {
  total: number;
  kandidater: TalentKandidat[];
  /** Unike hjemmeklubber (for filter-chips). */
  klubber: string[];
}

// Nivå-valg — speiler NIVAA i server action (leggTilITalent).
const NIVAA = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
type Niva = (typeof NIVAA)[number];

// HCP-range — 1:1 med den ekte skjermens HCP_RANGES.
const HCP_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: "0-5", label: "HCP 0–5", min: 0, max: 5 },
  { key: "5-15", label: "HCP 5–15", min: 5, max: 15 },
  { key: "15-30", label: "HCP 15–30", min: 15, max: 30 },
  { key: "30+", label: "HCP 30+", min: 30, max: 999 },
];

function fmtHcp(hcp: number | null): string {
  return hcp != null ? hcp.toFixed(1).replace(".", ",") : "—";
}

/** Én kandidat: rad + inline «legg til»-skjema. Egen state pr. rad. */
function KandidatRad({ k, last }: { k: TalentKandidat; last: boolean }) {
  const [apen, setApen] = useState(false);
  const [pending, start] = useTransition();
  const [res, setRes] = useState<LeggTilState>({ ok: false });
  const [niva, setNiva] = useState<Niva>("U14");
  const [klubb, setKlubb] = useState(k.homeClub ?? "");
  const [region, setRegion] = useState("");

  function submit() {
    if (pending) return;
    const fd = new FormData();
    fd.set("userId", k.id);
    fd.set("niva", niva);
    fd.set("klubb", klubb);
    fd.set("region", region);
    start(async () => setRes(await leggTilITalent({ ok: false }, fd)));
  }

  const aar =
    k.playingYears != null
      ? `${k.playingYears} spilte år`
      : "Spilte år ukjent";
  const sub = `${k.homeClub ?? "Ukjent klubb"} · ${aar}`;

  const meta = res.ok ? (
    <StatusPill tone="up">Lagt til</StatusPill>
  ) : (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, flex: "none" }}>
      <span style={{ textAlign: "right" }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 15,
            fontWeight: 700,
            color: T.fg,
            fontVariantNumeric: "tabular-nums",
            display: "block",
          }}
        >
          {fmtHcp(k.hcp)}
        </span>
        <Caps size={8.5} style={{ marginTop: 2 }}>Hcp</Caps>
      </span>
      <Knapp ghost icon={apen ? "x" : "plus"} onClick={() => setApen(!apen)}>
        {apen ? "Lukk" : "Legg til"}
      </Knapp>
    </span>
  );

  return (
    <div style={{ borderBottom: last && !apen ? "none" : `1px solid ${T.border}` }}>
      <Rad
        leading={<AvatarInit navn={k.navn} size={34} />}
        title={k.navn}
        sub={sub}
        meta={meta}
        trailing={null}
        last
      />
      {apen && !res.ok && (
        <div style={{ padding: "2px 0 16px" }}>
          <Kort tint pad="14px 16px">
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
              <Velger
                label="Nivå"
                options={[...NIVAA]}
                value={niva}
                onChange={(v) => setNiva(v as Niva)}
              />
              <Inndata
                label="Hjemmeklubb"
                value={klubb}
                onChange={setKlubb}
                placeholder="F.eks. GFGK"
              />
              <Inndata
                label="Region"
                value={region}
                onChange={setRegion}
                placeholder="F.eks. Østfold"
              />
            </div>
            {res.error && (
              <div style={{ marginTop: 12 }}>
                <ValideringsChip tone="advarsel" tekst={res.error} />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Knapp icon="check" onClick={submit} disabled={pending}>
                {pending ? "Lagrer…" : "Legg til i talent"}
              </Knapp>
            </div>
          </Kort>
        </div>
      )}
    </div>
  );
}

export function AdminTalentDiscoveryV2({ data }: { data: TalentDiscoveryV2Data }) {
  const [sok, setSok] = useState("");
  const [hcpAktiv, setHcpAktiv] = useState<string[]>([]);
  const [klubbAktiv, setKlubbAktiv] = useState<string[]>([]);

  const klubbValg = useMemo(() => data.klubber.slice(0, 16), [data.klubber]);

  const toggle =
    (arr: string[], set: (v: string[]) => void) => (x: string) =>
      set(arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x));

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    const valgteRanges = HCP_RANGES.filter((r) => hcpAktiv.indexOf(r.label) !== -1);
    return data.kandidater.filter((k) => {
      if (q) {
        const navn = k.navn.toLowerCase();
        const klubb = (k.homeClub ?? "").toLowerCase();
        if (!navn.includes(q) && !klubb.includes(q)) return false;
      }
      if (valgteRanges.length > 0) {
        if (k.hcp == null) return false;
        const treff = valgteRanges.some(
          (r) => (k.hcp as number) >= r.min && (k.hcp as number) < r.max,
        );
        if (!treff) return false;
      }
      if (klubbAktiv.length > 0 && (k.homeClub == null || klubbAktiv.indexOf(k.homeClub) === -1))
        return false;
      return true;
    });
  }, [data.kandidater, sok, hcpAktiv, klubbAktiv]);

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Talent · Discovery · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="talent">Finn nytt</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 460 }}>
          Spillere som ennå ikke er i talent-tracking. Søk, filtrer på HCP og
          klubb, og legg de mest aktuelle inn i oppfølgingen.
        </p>
      </div>
      <StatusPill tone={data.total > 0 ? "lime" : "info"}>
        {data.total === 0 ? "Alle i tracking" : `${data.total} kandidater`}
      </StatusPill>
    </div>
  );

  const primaerCta = (
    <Link href="/admin/talent/radar" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="radar" full>
        Åpne talent-radar
      </CTAPill>
    </Link>
  );

  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Kandidater" value={data.total} />
      <KpiFlis label="Klubber" value={data.klubber.length} />
      <KpiFlis label="I utvalg nå" value={filtrert.length} />
    </div>
  );

  const sokFelt = (
    <Inndata
      label={null}
      value={sok}
      onChange={setSok}
      placeholder="Søk spiller eller klubb …"
    />
  );

  const filterRad = (
    label: string,
    items: string[],
    active: string[],
    onToggle: (x: string) => void,
  ) =>
    items.length > 0 ? (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <Caps size={9} style={{ width: 64, flex: "none", paddingTop: 8 }}>{label}</Caps>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FilterChips items={items} active={active} onToggle={onToggle} />
        </div>
      </div>
    ) : null;

  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {filterRad("HCP", HCP_RANGES.map((r) => r.label), hcpAktiv, toggle(hcpAktiv, setHcpAktiv))}
      {filterRad("Klubb", klubbValg, klubbAktiv, toggle(klubbAktiv, setKlubbAktiv))}
    </div>
  );

  const liste = (
    <Kort
      eyebrow="Kandidater"
      action={<Caps size={9}>{filtrert.length === 1 ? "1 treff" : `${filtrert.length} treff`}</Caps>}
      pad="4px 20px"
    >
      {filtrert.length === 0 ? (
        <div style={{ padding: "8px 0" }}>
          <TomTilstand
            icon="users"
            title="Ingen treff"
            sub="Prøv å fjerne filtre eller endre søketeksten."
          />
        </div>
      ) : (
        filtrert.map((k, i) => (
          <KandidatRad key={k.id} k={k} last={i === filtrert.length - 1} />
        ))
      )}
    </Kort>
  );

  if (data.kandidater.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="users"
            title="Alle spillere er i tracking"
            sub="Ingen spillere står utenfor talent-oppfølgingen akkurat nå. Se radaren for oppfølging."
          />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {primaerCta}
      {sokFelt}
      {filtre}
      {liste}
    </div>
  );
}
