"use client";

/**
 * PortalHvorforDette — «Hvorfor dette tallet»-utvidelsen fra Paper-fasiten
 * (.why-mønster i playerhq-chat-desktop.html): kilde / beregning / forbehold.
 *
 * Innholdet bygges DETERMINISTISK fra det faktiske verktøy-resultatet, ikke
 * fra fritekst modellen dikter opp — samme prinsipp som resten av portal-
 * chat: tall skal spores til en ekte kilde, aldri en påstand.
 */

import { T } from "@/lib/v2/tokens";
import type { PortalToolCall } from "./types";

type HvorforInnhold = { kilde: string; beregning: string; forbehold: string };

function innholdFor(tc: PortalToolCall): HvorforInnhold | null {
  if (tc.state !== "result" || !tc.output || tc.output.ok !== true) return null;
  const data = tc.output.data as Record<string, unknown> | null | undefined;
  const hentetTidspunkt = new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  if (tc.toolName === "hentUkeplan" && data) {
    const antall = typeof data.antallOkter === "number" ? data.antallOkter : 0;
    return {
      kilde: `Ukeplanen din, lest kl. ${hentetTidspunkt}.`,
      beregning: `${antall} ${antall === 1 ? "økt" : "økter"} funnet i inneværende uke (mandag–søndag).`,
      forbehold: "Planen kan endres av coachen din når som helst — dette er et øyeblikksbilde, ikke en låst avtale.",
    };
  }

  if (tc.toolName === "hentDagensOkt" && data) {
    const antall = typeof data.antall === "number" ? data.antall : 0;
    const totalMin = typeof data.totalMin === "number" ? data.totalMin : 0;
    return {
      kilde: `Dagens økter, hentet kl. ${hentetTidspunkt}.`,
      beregning:
        antall > 0
          ? `${antall} ${antall === 1 ? "økt" : "økter"} i dag, til sammen ${totalMin} min.`
          : "Ingen økter registrert i dag.",
      forbehold: "Viser kun økter registrert i systemet — avtaler gjort utenom appen vises ikke her.",
    };
  }

  if (tc.toolName === "hentSisteOkt") {
    if (!data) {
      return {
        kilde: `Søk gjennom fullførte økter, kl. ${hentetTidspunkt}.`,
        beregning: "Fant ingen fullførte økter ennå.",
        forbehold: "En økt regnes ikke som fullført før den er markert ferdig i appen.",
      };
    }
    const d = data as { kilde: string; dato: string; resultatPct: number | null; totalReps: number | null };
    const dato = new Date(d.dato).toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
    const resultatTekst =
      d.resultatPct != null
        ? `Resultat logget: ${d.resultatPct} %${d.totalReps != null ? ` over ${d.totalReps} reps` : ""}.`
        : "Ingen tallresultat logget for denne økta.";
    return {
      kilde: `Siste fullførte økt, ${dato} (${d.kilde === "plan" ? "fra treningsplanen" : "egen økt"}).`,
      beregning: resultatTekst,
      forbehold: "Resultatet er kun det som faktisk ble logget etter økta — ulogget innsats teller ikke med.",
    };
  }

  return null;
}

export function PortalHvorforDette({ toolCall }: { toolCall: PortalToolCall }) {
  const innhold = innholdFor(toolCall);
  if (!innhold) return null;

  return (
    <details style={{ margin: "12px 0 16px", border: `1px solid ${T.border}`, borderRadius: T.rCard, background: T.panel }}>
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: 44,
          padding: "0 16px",
          cursor: "pointer",
          listStyle: "none",
          fontFamily: T.ui,
          fontSize: 12.5,
          fontWeight: 500,
          color: T.mut,
        }}
      >
        Hvorfor dette tallet
      </summary>
      <ul style={{ margin: 0, padding: "12px 16px 16px 24px", fontSize: 13.5, color: T.mut, lineHeight: 1.6 }}>
        <li style={{ marginBottom: 8 }}>
          <strong style={{ color: T.fg, fontWeight: 500 }}>Kilde: </strong>
          {innhold.kilde}
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong style={{ color: T.fg, fontWeight: 500 }}>Beregning: </strong>
          {innhold.beregning}
        </li>
        <li>
          <strong style={{ color: T.fg, fontWeight: 500 }}>Forbehold: </strong>
          {innhold.forbehold}
        </li>
      </ul>
    </details>
  );
}
