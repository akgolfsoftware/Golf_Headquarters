"use client";

/**
 * AgencyOS — Drill-detalj (v2, retning C «Presis»). Rekomponering av
 * /admin/drills/[id] med BEVART funksjon: Rediger/Dupliser/Slett (samme
 * `duplicateDrill`/`deleteDrill`-actions), samme datavisning (beskrivelse,
 * coach-notater, nivå-range, csTarget-tabell, default-oppsett, environment,
 * utstyr, L-faser, prerequisites, tags, video).
 *
 * NGF-range-baren (min–max kategori A–L) er en enkel, egenkomponert
 * strek-visualisering — ikke et v2-kjernemønster, men samme kompleksitet
 * som andre skjerm-spesifikke mini-visualiseringer i biblioteket
 * (OktBlokk, EgentreningVindu i agencyos.jsx). Ingen ny mockup nødvendig.
 *
 * Bygget av v2-komponenter. Ingen ad-hoc UI utover NGF-baren, ingen rå hex
 * (kun T.*).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { NgfKategori } from "@/generated/prisma/enums";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  Bit,
  StatusPill,
  AkseChip,
  ValideringsChip,
  CTAPill,
  Knapp,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { deleteDrill, duplicateDrill } from "@/app/admin/(legacy)/drills/actions";

const NGF_ORDER: readonly NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

export interface AdminDrillDetaljData {
  id: string;
  navn: string;
  omrade: AkseKey;
  skillLabel: string | null;
  beskrivelse: string | null;
  coachNotater: string | null;
  morad: boolean;
  kilde: string | null;
  oktAntall: number;
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
  minHcp: number | null;
  maxHcp: number | null;
  csTarget: Partial<Record<NgfKategori, number>> | null;
  varighetMin: number | null;
  intensitet: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
  lFase: string | null;
  environment: string[];
  utstyr: string[];
  lFaser: string[];
  prerequisites: { id: string; navn: string }[];
  tags: string[];
  videoUrl: string | null;
}

function NgfRangeBar({ min, max }: { min: NgfKategori | null; max: NgfKategori | null }) {
  const minIdx = min ? NGF_ORDER.indexOf(min) : 0;
  const maxIdx = max ? NGF_ORDER.indexOf(max) : NGF_ORDER.length - 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", height: 6, borderRadius: 9999, overflow: "hidden", background: T.track }}>
        {NGF_ORDER.map((_, i) => (
          <div key={i} style={{ flex: 1, background: i >= minIdx && i <= maxIdx ? T.lime : "transparent" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 9.5 }}>
        {NGF_ORDER.map((k, i) => (
          <span key={k} style={{ color: i >= minIdx && i <= maxIdx ? T.fg : T.mut, fontWeight: i >= minIdx && i <= maxIdx ? 700 : 400 }}>{k}</span>
        ))}
      </div>
    </div>
  );
}

export function AdminDrillDetaljV2({ data }: { data: AdminDrillDetaljData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [bekreftSlett, setBekreftSlett] = useState(false);

  function dupliser() {
    setFeil(null);
    startTransition(async () => {
      const res = await duplicateDrill(data.id);
      if ("error" in res) { setFeil(res.error); return; }
      if (res.success && res.data) router.push(`/admin/drills/${res.data.drillId}/rediger`);
    });
  }

  function slett() {
    setFeil(null);
    startTransition(async () => {
      const res = await deleteDrill(data.id);
      if ("error" in res) { setFeil(res.error); setBekreftSlett(false); return; }
      router.push("/admin/drills");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>{`${data.skillLabel ? `${data.skillLabel} · ` : ""}Brukt i ${data.oktAntall} økt(er)`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={data.navn}>Drill:</Tittel>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <AkseChip a={data.omrade} />
            {data.morad && <StatusPill tone="lime">MORAD</StatusPill>}
            {data.kilde && <Bit monoTekst>{data.kilde}</Bit>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/drills/${data.id}/rediger`} style={{ textDecoration: "none" }}>
            <CTAPill icon="pencil">Rediger</CTAPill>
          </Link>
          <Knapp ghost icon="copy" onClick={dupliser} disabled={pending}>Dupliser</Knapp>
          {bekreftSlett ? (
            <Knapp icon="alert-triangle" onClick={slett} disabled={pending} style={{ color: T.down }}>
              {pending ? "Sletter…" : "Bekreft slett"}
            </Knapp>
          ) : (
            <Knapp ghost icon="trash-2" onClick={() => setBekreftSlett(true)} disabled={pending}>Slett</Knapp>
          )}
        </div>
      </div>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}
      {bekreftSlett && data.oktAntall > 0 && (
        <ValideringsChip tone="advarsel" tekst={`«${data.navn}» er i bruk i ${data.oktAntall} økt(er) — sletting kan feile. Vurder å arkivere i stedet.`} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Beskrivelse">
            <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {data.beskrivelse ?? "Ingen beskrivelse lagret."}
            </p>
          </Kort>

          {data.coachNotater && (
            <Kort eyebrow="Coach-notater">
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, fontStyle: "italic", color: T.fg2, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {data.coachNotater}
              </p>
            </Kort>
          )}

          <Kort eyebrow="Nivå-range">
            <NgfRangeBar min={data.minKategori} max={data.maxKategori} />
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 10, marginTop: 14 }}>
              <StatFelt label="Min kategori" verdi={data.minKategori ?? "—"} />
              <StatFelt label="Max kategori" verdi={data.maxKategori ?? "—"} />
              <StatFelt label="HCP min" verdi={data.minHcp != null ? String(data.minHcp) : "—"} />
              <StatFelt label="HCP max" verdi={data.maxHcp != null ? String(data.maxHcp) : "—"} />
            </div>
          </Kort>

          {data.csTarget && Object.keys(data.csTarget).length > 0 && (
            <Kort eyebrow="csTarget per NGF-kategori">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {NGF_ORDER.filter((k) => data.csTarget![k] !== undefined).map((k, i, arr) => (
                  <Rad key={k} title={k} meta={<span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{data.csTarget![k]}</span>} trailing={null} last={i === arr.length - 1} />
                ))}
              </div>
            </Kort>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Default oppsett">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <StatRad label="Varighet" verdi={data.varighetMin ? `${data.varighetMin} min` : "—"} />
              <StatRad label="Intensitet" verdi={data.intensitet != null ? `${data.intensitet}/10` : "—"} />
              <StatRad label="Sets" verdi={data.defaultSets != null ? String(data.defaultSets) : "—"} />
              <StatRad label="Reps" verdi={data.defaultReps != null ? String(data.defaultReps) : "—"} />
              <StatRad label="repsSets-tekst" verdi={data.defaultRepsSets ?? "—"} />
              <StatRad label="csMin / csMax" verdi={data.csMin != null || data.csMax != null ? `${data.csMin ?? "—"} / ${data.csMax ?? "—"}` : "—"} />
              <StatRad label="lFase (primær)" verdi={data.lFase ?? "—"} sistLinje />
            </div>
          </Kort>

          <Kort eyebrow="Environment">
            {data.environment.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{data.environment.map((e) => <Bit key={e} monoTekst>{e}</Bit>)}</div>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen.</p>
            )}
          </Kort>

          <Kort eyebrow="Utstyr">
            {data.utstyr.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {data.utstyr.map((u) => <li key={u} style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>· {u}</li>)}
              </ul>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Intet utstyr.</p>
            )}
          </Kort>

          <Kort eyebrow="L-faser">
            {data.lFaser.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{data.lFaser.map((p) => <Bit key={p} monoTekst>{p}</Bit>)}</div>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen.</p>
            )}
          </Kort>

          {data.prerequisites.length > 0 && (
            <Kort eyebrow="Prerequisites">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {data.prerequisites.map((p, i, arr) => (
                  <Rad key={p.id} title={p.navn} onClick={() => router.push(`/admin/drills/${p.id}`)} last={i === arr.length - 1} />
                ))}
              </div>
            </Kort>
          )}

          {data.tags.length > 0 && (
            <Kort eyebrow="Tags">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{data.tags.map((t) => <Bit key={t}>#{t}</Bit>)}</div>
            </Kort>
          )}

          {data.videoUrl && (
            <Kort eyebrow="Video">
              <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.ui, fontSize: 13, color: T.lime, wordBreak: "break-all" }}>
                {data.videoUrl}
              </a>
            </Kort>
          )}
        </div>
      </div>
    </div>
  );
}

function StatFelt({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div>
      <Caps size={8.5}>{label}</Caps>
      <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, marginTop: 3 }}>{verdi}</div>
    </div>
  );
}

function StatRad({ label, verdi, sistLinje }: { label: string; verdi: string; sistLinje?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: sistLinje ? "none" : `1px solid ${T.border}` }}>
      <Caps size={9}>{label}</Caps>
      <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>{verdi}</span>
    </div>
  );
}
