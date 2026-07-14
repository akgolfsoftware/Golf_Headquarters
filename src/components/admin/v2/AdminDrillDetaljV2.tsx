"use client";

/**
 * AgencyOS v2 — Drill-detalj (`/admin/drills/[id]`, AgencyOS Bølge 1.2, 2026-07-14).
 * Port fra `(legacy)/drills/[id]/page.tsx` + `drill-detail-actions.tsx` — samme
 * felt-sett/logikk (inkl. Rediger/Dupliser/Slett via `duplicateDrill`/`deleteDrill`),
 * ny v2-presentasjon: stablede `Kort`-seksjoner i én kolonne (samme mønster som
 * Turneringer-hub/NyOvelseArk) i stedet for fasit-ens 2/3-kolonne-grid.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";
import { duplicateDrill, deleteDrill } from "@/app/admin/(legacy)/drills/actions";

const NGF_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

export interface AdminDrillDetaljV2Data {
  id: string;
  name: string;
  disiplinLabel: string;
  skillLabel: string | null;
  /** CSS-fargeverdi (token) for nivå-range-baren — akse-farge eller `T.lime` som fallback. */
  barFarge: string;
  morad: boolean;
  kilde: string | null;
  bruktIOkter: number;
  description: string | null;
  coachNotes: string | null;
  minKategori: string | null;
  maxKategori: string | null;
  minHcp: number | null;
  maxHcp: number | null;
  csTarget: Partial<Record<(typeof NGF_ORDER)[number], number>> | null;
  durationMin: number | null;
  intensitet: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
  lPhase: string | null;
  environment: string[];
  utstyr: string[];
  lPhases: string[];
  prerequisites: { id: string; name: string }[];
  tags: string[];
  videoUrl: string | null;
}

function Seksjon({ title, children }: { title: string; children: React.ReactNode }) {
  return <Kort eyebrow={title}>{children}</Kort>;
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{label}</span>
      <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.fg }}>{value}</span>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((t) => (
        <span key={t} style={{ borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, padding: "4px 10px", fontFamily: T.mono, fontSize: 10.5, color: T.fg2 }}>{t}</span>
      ))}
    </div>
  );
}

export function AdminDrillDetaljV2(d: AdminDrillDetaljV2Data) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const hasSessions = d.bruktIOkter > 0;

  const dupliser = () => {
    setFeil(null);
    startTransition(async () => {
      const res = await duplicateDrill(d.id);
      if ("error" in res) { setFeil(res.error); return; }
      if (res.success && res.data) router.push(`/admin/drills/${res.data.drillId}/rediger`);
    });
  };

  const slett = () => {
    if (hasSessions) {
      if (!confirm(`«${d.name}» er i bruk i pågående økter. Sletting blokkert — vurder å arkivere i stedet.`)) return;
    } else if (!confirm(`Slett drillen «${d.name}»?`)) return;
    setFeil(null);
    startTransition(async () => {
      const res = await deleteDrill(d.id);
      if ("error" in res) { setFeil(res.error); return; }
      router.push("/admin/drills");
    });
  };

  const minIdx = d.minKategori ? NGF_ORDER.indexOf(d.minKategori as (typeof NGF_ORDER)[number]) : 0;
  const maxIdx = d.maxKategori ? NGF_ORDER.indexOf(d.maxKategori as (typeof NGF_ORDER)[number]) : NGF_ORDER.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 760 }}>
      <Link href="/admin/drills" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={12} /> Tilbake til biblioteket
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps size={9}>{d.disiplinLabel}{d.skillLabel && ` · ${d.skillLabel}`}</Caps>
            <Tittel>{d.name}</Tittel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {d.morad && <StatusPill tone="lime">MORAD</StatusPill>}
              {d.kilde && <StatusPill tone="info">{d.kilde}</StatusPill>}
              <StatusPill tone="info">Brukt i {d.bruktIOkter} økt(er)</StatusPill>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/admin/drills/${d.id}/rediger`} style={{ textDecoration: "none" }}>
              <Knapp icon="pencil">Rediger</Knapp>
            </Link>
            <Knapp ghost icon="copy" onClick={dupliser} disabled={pending}>Dupliser</Knapp>
            <Knapp ghost icon="trash" onClick={slett} disabled={pending}>Slett</Knapp>
          </div>
        </div>
        {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</div>}
      </div>

      <Seksjon title="Beskrivelse">
        <p style={{ fontFamily: T.ui, fontSize: 13, color: d.description ? T.fg : T.mut, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
          {d.description ?? "Ingen beskrivelse lagret."}
        </p>
      </Seksjon>

      {d.coachNotes && (
        <Seksjon title="Coach-notater">
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, fontStyle: "italic", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{d.coachNotes}</p>
        </Seksjon>
      )}

      <Seksjon title="Nivå-range">
        <div style={{ display: "flex", height: 8, overflow: "hidden", borderRadius: 9999, background: T.panel2 }}>
          {NGF_ORDER.map((_, i) => (
            <div key={i} style={{ flex: 1, background: i >= minIdx && i <= maxIdx ? d.barFarge : "transparent" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
          {NGF_ORDER.map((k, i) => <span key={k} style={{ color: i >= minIdx && i <= maxIdx ? T.fg : T.mut, fontWeight: i >= minIdx && i <= maxIdx ? 700 : 500 }}>{k}</span>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
          <KV label="Min kategori" value={d.minKategori ?? "—"} />
          <KV label="Max kategori" value={d.maxKategori ?? "—"} />
          <KV label="HCP min" value={d.minHcp !== null ? String(d.minHcp) : "—"} />
          <KV label="HCP max" value={d.maxHcp !== null ? String(d.maxHcp) : "—"} />
        </div>
      </Seksjon>

      {d.csTarget && Object.keys(d.csTarget).length > 0 && (
        <Seksjon title="csTarget per NGF-kategori">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NGF_ORDER.filter((k) => d.csTarget?.[k] !== undefined).map((k) => (
              <KV key={k} label={k} value={String(d.csTarget?.[k])} />
            ))}
          </div>
        </Seksjon>
      )}

      <Seksjon title="Default oppsett">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <KV label="Varighet" value={d.durationMin ? `${d.durationMin} min` : "—"} />
          <KV label="Intensitet" value={typeof d.intensitet === "number" ? `${d.intensitet}/10` : "—"} />
          <KV label="Sets" value={d.defaultSets ? String(d.defaultSets) : "—"} />
          <KV label="Reps" value={d.defaultReps ? String(d.defaultReps) : "—"} />
          <KV label="repsSets-tekst" value={d.defaultRepsSets ?? "—"} />
          <KV label="csMin/Max" value={d.csMin !== null || d.csMax !== null ? `${d.csMin ?? "—"} / ${d.csMax ?? "—"}` : "—"} />
          <KV label="L-fase (primary)" value={d.lPhase ?? "—"} />
        </div>
      </Seksjon>

      <Seksjon title="Environment">
        {d.environment.length > 0 ? <Chips items={d.environment} /> : <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen.</span>}
      </Seksjon>

      <Seksjon title="Utstyr">
        {d.utstyr.length > 0 ? <Chips items={d.utstyr} /> : <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Intet utstyr.</span>}
      </Seksjon>

      <Seksjon title="L-faser">
        {d.lPhases.length > 0 ? <Chips items={d.lPhases} /> : <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen.</span>}
      </Seksjon>

      {d.prerequisites.length > 0 && (
        <Seksjon title="Prerequisites">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {d.prerequisites.map((p) => (
              <Link key={p.id} href={`/admin/drills/${p.id}`} style={{ fontFamily: T.ui, fontSize: 13, color: T.lime, textDecoration: "none" }}>{p.name}</Link>
            ))}
          </div>
        </Seksjon>
      )}

      {d.tags.length > 0 && (
        <Seksjon title="Tags">
          <Chips items={d.tags.map((t) => `#${t}`)} />
        </Seksjon>
      )}

      {d.videoUrl && (
        <Seksjon title="Video">
          <a href={d.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.ui, fontSize: 13, color: T.lime, wordBreak: "break-all" }}>{d.videoUrl}</a>
        </Seksjon>
      )}
    </div>
  );
}
