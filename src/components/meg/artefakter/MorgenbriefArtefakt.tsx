"use client";

/**
 * Morgenbrief-artefaktet — rytme-dokumentet for dagen. Fasit:
 * jarvis/meg-morgenbrief.html (kø-status, "Dagens tre viktigste",
 * kalender-sammendrag, "Venter på deg").
 *
 * Bevisst avvik fra fasiten: "Dagens tre viktigste" er IKKE en AI-syntese
 * (fasitens tekst leser som redigert prosa) — det er de tre øverste VENTER-
 * sakene etter EXAKT samme prioriteringsregel som «Én ting nå»-kortet på
 * hjem-skjermen (src/lib/jarvis/en-ting-na.ts sin sammenlignPrioritet: over
 * frist vinner → ellers minst tid igjen). Konsistent med resten av /meg,
 * ikke oppdiktet innsikt. Har Meg-databasen (me_brief, se repository.ts)
 * en lagret morgenbrief-tekst, vises den som et tillegg under — ikke i
 * stedet for de ekte tallene. Lyd-avspilling er utelatt (ingen TTS-infra).
 */
import { T } from "@/lib/v2/tokens";
import type { Sak } from "@/generated/prisma/client";
import { SakStatus } from "@/generated/prisma/enums";
import type { BriefSnapshot, DagenData } from "@/lib/jarvis/types";
import { sammenlignPrioritet, tidIgjenMs } from "@/lib/jarvis/en-ting-na";

function sladTid(sak: Sak, na: Date): string {
  const ms = tidIgjenMs(sak, na);
  if (ms === null) return "ingen frist";
  const min = Math.round(Math.abs(ms) / 60000);
  const t = min >= 60 ? `${Math.floor(min / 60)}t ${min % 60}min` : `${min}min`;
  return ms < 0 ? `${t} over frist` : `${t} igjen`;
}

function klokke(iso: string): string {
  return new Date(iso).toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
}

export function MorgenbriefArtefakt({
  saker,
  dagen,
  brief,
  na,
  onVelgSak,
  onApneDagen,
}: {
  saker: Sak[];
  dagen: DagenData;
  brief: BriefSnapshot;
  na: Date;
  onVelgSak: (id: string) => void;
  onApneDagen: () => void;
}) {
  const ventende = saker.filter((s) => s.status === SakStatus.VENTER);
  const overFrist = ventende.filter((s) => (tidIgjenMs(s, na) ?? 1) < 0);
  const topp3 = [...ventende].sort((a, b) => sammenlignPrioritet(a, b, na)).slice(0, 3);
  const forsteAvtaler = dagen.elementer.filter((e) => e.type === "avtale").slice(0, 3);

  return (
    <div data-od-id="panel-morgenbrief" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rTag,
          padding: "12px 14px",
          marginBottom: 16,
        }}
        data-od-id="panel-ko-status"
      >
        <span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 600, lineHeight: 1, color: T.fg }}>{ventende.length}</span>
        <span style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.07em", textTransform: "uppercase", color: T.mut }}>
          saker venter
          <br />i køen nå
        </span>
        {overFrist.length > 0 && (
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 11, color: T.down }}>▲ {overFrist.length} over frist</span>
        )}
      </div>

      {brief.innhold && (
        <p style={{ fontFamily: T.bodyFont, fontSize: 14, lineHeight: 1.62, color: T.fg, maxWidth: "56ch", marginBottom: 16 }}>
          {brief.innhold}
        </p>
      )}

      <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>Dagens viktigste</h2>
      {topp3.length === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginBottom: 16 }}>Ingenting venter — ren kø.</p>
      ) : (
        <ol style={{ margin: "0 0 16px", paddingLeft: 20 }}>
          {topp3.map((s) => (
            <li key={s.id} style={{ marginBottom: 8, fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.5, color: T.fg }}>
              <button
                type="button"
                onClick={() => onVelgSak(s.id)}
                data-od-id={`cta-morgenbrief-topp-${s.id}`}
                style={{ background: "none", border: 0, padding: 0, color: T.fg, textAlign: "left", cursor: "pointer", font: "inherit" }}
              >
                {s.avsender ?? "Ukjent avsender"} — {s.emne ?? s.innhold.slice(0, 60)}
              </button>{" "}
              <span style={{ fontFamily: T.mono, fontSize: 11, color: (tidIgjenMs(s, na) ?? 1) < 0 ? T.down : T.mut }}>
                ({sladTid(s, na)})
              </span>
            </li>
          ))}
        </ol>
      )}

      <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>Kalenderen — kort</h2>
      {!dagen.kalenderTilgjengelig ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginBottom: 8 }}>Fikk ikke lest kalenderen.</p>
      ) : forsteAvtaler.length === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginBottom: 8 }}>Ingen avtaler i dag.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 8px", padding: 0 }}>
          {forsteAvtaler.map((e) => (
            <li key={e.id} style={{ display: "flex", gap: 10, fontSize: 13, padding: "2px 0", fontFamily: T.ui, color: T.fg }}>
              <span style={{ width: 96, flex: "none", color: T.mut, fontFamily: T.mono }}>
                {klokke(e.start)}
                {e.slutt && `–${klokke(e.slutt)}`}
              </span>
              {e.tittel}
            </li>
          ))}
        </ul>
      )}
      <p style={{ margin: "0 0 16px" }}>
        <button
          type="button"
          onClick={onApneDagen}
          data-od-id="cta-til-dagen"
          style={{ background: "none", border: 0, padding: 0, color: T.info, textDecoration: "underline", cursor: "pointer", fontFamily: T.ui, fontSize: 12.5 }}
        >
          Hele dagen som tidslinje →
        </button>
      </p>

      <h2 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>Venter på deg</h2>
      {ventende.length === 0 ? (
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingenting venter.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ventende.slice(0, 4).map((s) => (
            <li key={s.id} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "4px 0", fontSize: 13 }}>
              <button
                type="button"
                onClick={() => onVelgSak(s.id)}
                data-od-id={`cta-morgenbrief-venter-${s.id}`}
                style={{ background: "none", border: 0, padding: 0, color: T.fg, cursor: "pointer", fontFamily: T.ui, fontSize: 13 }}
              >
                {s.avsender ?? "Ukjent avsender"} · {s.emne ?? "—"}
              </button>
              <span
                style={{ marginLeft: "auto", flex: "none", fontFamily: T.mono, fontSize: 11, color: (tidIgjenMs(s, na) ?? 1) < 0 ? T.down : T.mut }}
              >
                {sladTid(s, na)}
              </span>
            </li>
          ))}
          {ventende.length > 4 && (
            <li style={{ padding: "4px 0", fontSize: 13, fontFamily: T.ui, color: T.mut }}>+ {ventende.length - 4} til i køen</li>
          )}
        </ul>
      )}

      <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 16 }}>
        {brief.generert ? `Generert ${klokke(brief.generert)}` : "Ingen morgenbrief-tekst generert ennå"}
      </div>
    </div>
  );
}
