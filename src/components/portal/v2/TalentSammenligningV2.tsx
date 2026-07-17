"use client";

/**
 * PlayerHQ · Talent · Sammenligning — v2 (retning C «Presis»).
 * Side-ved-side med en annen spiller på samme nivå: søk/velg (URL-param
 * ?q / ?spiller / ?periode — samme kontrakt som legacy), overlappende
 * RadarProfil, akse-barer og SG-utvikling over valgt periode. Anonymiser-
 * bryteren kaller server-action `toggleAnonymiser` (uendret logikk).
 * Ingen falske tall — tomtilstander når data mangler.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  TomTilstand,
  HjelpTips,
  CTAPill,
  Knapp,
  RadarProfil,
  DiffKort,
  Inndata,
  Velger,
  Bryter,
  PillVelger,
} from "@/components/v2";
import { toggleAnonymiser } from "@/app/portal/talent/sammenligning/actions";
import type { TalentAkseKey } from "./TalentFellesV2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type SammenligningPeriode = "30d" | "90d" | "1ar";

export interface TalentSammenligningData {
  niva: string;
  mittNavn: string;
  minKlubb: string | null;
  minAnonymisert: boolean;
  /** Aktive URL-params (kontrakten mot server-page). */
  q: string;
  spillerId: string;
  periode: SammenligningPeriode;
  /** Kandidater på samme nivå (navn allerede anonymisert der spilleren ber om det). */
  kandidater: { id: string; navn: string; klubb: string | null }[];
  /** Valgt motspiller, eller null. */
  valgt: { navn: string; klubb: string | null } | null;
  /** De fem aksene: min verdi + motspillerens (null når ingen valgt/uvurdert). */
  akser: { key: TalentAkseKey; label: string; min: number | null; andre: number | null }[];
  /** SG-snitt siste runder i perioden (naa) mot runder før perioden (foer). */
  sgDeltas: { label: string; naa: number | null; foer: number | null }[];
}

const PERIODE_VALG: { v: SammenligningPeriode; l: string }[] = [
  { v: "30d", l: "30 d" },
  { v: "90d", l: "90 d" },
  { v: "1ar", l: "1 år" },
];

const PERIODE_TEKST: Record<SammenligningPeriode, string> = {
  "30d": "siste 30 dager mot rundene før",
  "90d": "siste 90 dager mot rundene før",
  "1ar": "siste år mot rundene før",
};

function fmtSg2(v: number | null): string {
  if (v === null) return "—";
  return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2).replace(".", ",");
}

function fmt10(v: number | null): string {
  return v === null ? "—" : v.toFixed(1).replace(".", ",");
}

export function TalentSammenligningV2({ data }: { data: TalentSammenligningData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sok, setSok] = useState(data.q);
  const [spillerId, setSpillerId] = useState(data.spillerId);

  function naviger(params: { q?: string; spiller?: string; periode?: string }) {
    const p = new URLSearchParams();
    if (params.q) p.set("q", params.q);
    if (params.spiller) p.set("spiller", params.spiller);
    if (params.periode) p.set("periode", params.periode);
    const qs = p.toString();
    router.push(`/portal/talent/sammenligning${qs ? `?${qs}` : ""}`);
  }

  const harValgt = data.valgt !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Talent · Sammenligning</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="deg">Sammenlign</Tittel>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <StatusPill tone="lime">Nivå {data.niva}</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
            Velg en spiller på {data.niva}-nivå for å se hvordan dere ligger mot hverandre.
          </span>
        </div>
      </div>

      {/* Anonymiser meg */}
      <Kort pad="14px 18px">
        <Bryter
          label="Anonymiser meg"
          sub={pending ? "Lagrer …" : "Vis meg som «Spiller» i andres sammenligninger"}
          defaultChecked={data.minAnonymisert}
          onChange={(neste) => {
            startTransition(() => {
              void toggleAnonymiser(neste);
            });
          }}
        />
      </Kort>

      {/* Søk + velg */}
      <Kort eyebrow="Velg motspiller">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Inndata
            label="Søk etter navn"
            value={sok}
            placeholder={`Søk blant spillere på ${data.niva}`}
            onChange={setSok}
          />
          <Velger
            label="Velg fra liste"
            value={spillerId}
            options={[
              { value: "", label: "— Ingen valgt —" },
              ...data.kandidater.map((k) => ({
                value: k.id,
                label: k.klubb ? `${k.navn} · ${k.klubb}` : k.navn,
              })),
            ]}
            onChange={setSpillerId}
          />
          <Knapp
            icon="git-compare"
            full
            onClick={() => naviger({ q: sok, spiller: spillerId, periode: data.periode })}
          >
            Sammenlign
          </Knapp>
          {data.q && data.kandidater.length === 0 && (
            <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>
              Ingen treff på «{data.q}» på {data.niva}-nivå.
            </span>
          )}
        </div>
      </Kort>

      {!harValgt ? (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spiller valgt"
            sub="Velg en spiller fra lista eller søk for å se sammenligning."
          />
        </Kort>
      ) : (
        <>
          {/* Radar */}
          <Kort
            eyebrow={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Radar — dere to <HjelpTips k="talentVurdering" size={11} />
              </span>
            }
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <RadarProfil
                akser={data.akser.map((a) => ({ label: a.label, verdi: a.min }))}
                sammenlign={data.akser.map((a) => a.andre)}
                max={10}
                size={300}
              />
            </div>
            {/* Legende */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 12 }}>
              <LegendeRad farge={T.lime} navn={data.mittNavn} klubb={data.minKlubb} stiplet={false} />
              <LegendeRad farge={T.fg2} navn={data.valgt!.navn} klubb={data.valgt!.klubb} stiplet />
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href="/portal/talent/sammenligning" style={{ textDecoration: "none" }}>
                <CTAPill ghost icon="rotate-cw">Tilbakestill</CTAPill>
              </Link>
            </div>
          </Kort>

          {/* Akser side om side */}
          <Kort eyebrow="Akser side om side">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.akser.map((a) => (
                <div key={a.key}>
                  <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, display: "block", marginBottom: 8 }}>
                    {a.label}
                  </span>
                  <AkseLinje navn={data.mittNavn} verdi={a.min} farge={T.lime} />
                  <div style={{ height: 7 }} />
                  <AkseLinje navn={data.valgt!.navn} verdi={a.andre} farge={T.fg2} />
                </div>
              ))}
            </div>
          </Kort>
        </>
      )}

      {/* Din fremgang (SG) — vises alltid, som i legacy */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Din fremgang <HjelpTips k="sgOmrade" size={11} />
          </span>
        }
        action={
          <PillVelger
            options={PERIODE_VALG}
            value={data.periode}
            onChange={(v) => naviger({ q: data.q, spiller: data.spillerId, periode: v })}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
          {data.sgDeltas.map((d) => {
            const diff = d.naa !== null && d.foer !== null ? d.naa - d.foer : null;
            return (
              <DiffKort
                key={d.label}
                label={d.label}
                foer={d.foer === null ? null : fmtSg2(d.foer)}
                etter={d.naa === null ? null : fmtSg2(d.naa)}
                enhet="SG"
                delta={diff === null ? null : fmtSg2(diff)}
                god={diff !== null && diff >= 0}
                periode={PERIODE_TEKST[data.periode]}
              />
            );
          })}
        </div>
      </Kort>
    </div>
  );
}

function LegendeRad({ farge, navn, klubb, stiplet }: { farge: string; navn: string; klubb: string | null; stiplet: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {stiplet ? (
          <span aria-hidden style={{ width: 18, height: 0, borderTop: `2px dashed ${farge}`, flex: "none" }} />
        ) : (
          <span aria-hidden style={{ width: 18, height: 3, borderRadius: 2, background: farge, flex: "none" }} />
        )}
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {navn}
        </span>
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none" }}>{klubb ?? "—"}</span>
    </div>
  );
}

function AkseLinje({ navn, verdi, farge }: { navn: string; verdi: number | null; farge: string }) {
  const pct = verdi === null ? 0 : Math.max(0, Math.min(100, (verdi / 10) * 100));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {navn}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums", flex: "none" }}>
          {fmt10(verdi)} / 10
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 9999, background: T.track, marginTop: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 9999, background: farge, opacity: 0.9 }} />
      </div>
    </div>
  );
}
