"use client";

/**
 * AO-03 Kø — Klar · Pågår · Venter godkjenning. Én hvit Kjør (første klare).
 *
 * Fasit: designsystem/train-lock/AO-01 Cockpit ko godkjenning.dc.html
 * (§AO-03 Ko).
 *
 * Tom-tilstand (AoTom) dekker i tillegg GAP-2c «Jarvis-kø tom»
 * (Fasit: designsystem/train-lock/GAP-2 Tilstander drift.dc.html) — ingen
 * fabrikkerte tall, kun hel setning. Begge henvisningene er beholdt ved
 * sammenslåingen 30.08: skjermen bygger på to fasitfiler.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TL } from "@/lib/v2/train-lock";
import { triggerAgentManually } from "@/app/admin/(legacy)/agents/actions";
import type { AgenticosKoData, AgenticosKoRad } from "@/lib/agencyos/last-agenticos";
import { AoCaps, AoKnapp, AoPrikk, AoRad, AoTom } from "./tl-agenticos";

const FILTERE = ["Alle", "Akademi", "Produkt", "Drift"] as const;
type Filter = (typeof FILTERE)[number];

function trefferFilter(rad: AgenticosKoRad, f: Filter): boolean {
  if (f === "Alle") return true;
  return rad.filterTekst.toUpperCase().includes(f.toUpperCase());
}

export function AdminAgenticosKo({ data }: { data: AgenticosKoData }) {
  const [filter, setFilter] = useState<Filter>("Alle");
  const klar = useMemo(() => data.klar.filter((r) => trefferFilter(r, filter)), [data.klar, filter]);
  const pagar = useMemo(() => data.pagar.filter((r) => trefferFilter(r, filter)), [data.pagar, filter]);
  const venter = useMemo(() => data.venter.filter((r) => trefferFilter(r, filter)), [data.venter, filter]);
  const totalt = klar.length + pagar.length + venter.length;

  return (
    <div data-screen-label="AO-03 Ko" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 16,
          borderBottom: `1px solid ${TL.hair}`,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>Kø</span>
        <div
          style={{
            height: 30,
            background: TL.dock,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            padding: 3,
            gap: 0,
          }}
        >
          {FILTERE.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  height: 24,
                  borderRadius: 999,
                  border: "none",
                  background: on ? TL.fill : "transparent",
                  color: on ? TL.onFill : TL.mute,
                  padding: "0 11px",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {f === "Alle" ? `Alle · ${totalt}` : f}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <AoKnapp href="/admin/workspace">Ny oppgave</AoKnapp>
      </div>

      {totalt === 0 ? (
        // Fasit: designsystem/train-lock/GAP-2 Tilstander drift.dc.html
        // (GAP-2c/2f Jarvis-kø tom, PX-7 29.08.2026) — «ingen fabrikkerte
        // tall»: fasitens «sist merget»-liste er IKKE lagt til her (ville krevd
        // ny data/felt utenfor scope), kun tittel/tekst/CTA er portert.
        <AoTom
          tittel="Ingen som venter"
          tekst="Research lander i Cockpit. Du får varsel når noe trenger et blikk."
          cta={<AoKnapp variant="primaer" href="/admin/workspace">Start en ny kjøring</AoKnapp>}
        />
      ) : (
        <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 16 }}>
          {klar.length > 0 ? (
            <Seksjon tittel={`Klar · ${klar.length}`}>
              {klar.map((r, i) => (
                <KoRad key={r.id} rad={r} kjor={i === 0 && Boolean(r.kjorSlug)} last={i === klar.length - 1 && pagar.length === 0 && venter.length === 0} />
              ))}
            </Seksjon>
          ) : null}
          {pagar.length > 0 ? (
            <Seksjon tittel={`Pågår · ${pagar.length}`}>
              {pagar.map((r, i) => (
                <KoRad key={r.id} rad={r} last={i === pagar.length - 1 && venter.length === 0} />
              ))}
            </Seksjon>
          ) : null}
          {venter.length > 0 ? (
            <Seksjon tittel={`Venter godkjenning · ${venter.length}`}>
              {venter.map((r, i) => (
                <KoRad key={r.id} rad={r} last={i === venter.length - 1} />
              ))}
              {data.researchCount > 0 ? (
                <p style={{ margin: "8px 0 0", fontSize: 11, color: TL.mute, lineHeight: 1.5 }}>
                  {data.researchCount} research-resultater ligger i Cockpit — aldri i denne kolonnen.
                </p>
              ) : null}
            </Seksjon>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Seksjon({ tittel, extra, children }: { tittel: string; extra?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <AoCaps>
          {tittel}
          {extra ? <span style={{ fontWeight: 600 }}> {extra}</span> : null}
        </AoCaps>
      </div>
      {children}
    </div>
  );
}

function KoRad({ rad, kjor, last }: { rad: AgenticosKoRad; kjor?: boolean; last?: boolean }) {
  return (
    <AoRad last={last}>
      {rad.prikk ? <AoPrikk color={TL.viz.target} /> : null}
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: TL.text, minWidth: 0 }}>{rad.tittel}</span>
      <span
        style={{
          fontSize: rad.merke ? 9 : 11,
          fontWeight: rad.merke ? 600 : 400,
          letterSpacing: rad.merke ? "0.08em" : undefined,
          textTransform: rad.merke ? "uppercase" : undefined,
          color: rad.merkeWarn ? TL.warn : TL.mute,
          flex: "none",
        }}
      >
        {rad.merke ?? rad.meta}
      </span>
      {kjor && rad.kjorSlug ? (
        <KjorRadKnapp slug={rad.kjorSlug} />
      ) : (
        <AoKnapp variant="lenke" href={rad.href}>
          {rad.lenkeLabel}
        </AoKnapp>
      )}
    </AoRad>
  );
}

function KjorRadKnapp({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <AoKnapp
      variant="primaer"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await triggerAgentManually(slug);
          if (res.ok) toast.success(res.melding);
          else toast.error(res.melding);
          router.refresh();
        })
      }
    >
      {pending ? "Kjører …" : "Kjør"}
    </AoKnapp>
  );
}
