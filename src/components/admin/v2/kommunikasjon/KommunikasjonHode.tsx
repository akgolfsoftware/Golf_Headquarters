/**
 * Kommunikasjon-hodet: «Academy · Kommunikasjon» + fanerad (MASTERPLAN 15.7).
 *
 * Canvas (designsystem/canvas/agencyos-ia/Kommunikasjon.dc.html) tegner også
 * en «Ny melding»-CTA i V2Shell-toppbaren — den er IKKE bygget her: det
 * finnes ingen eksisterende «opprett/send ny melding»-handling å koble den
 * til (Innboks-saker avgjøres, e-post skrives som svar på en mottatt sak,
 * maler redigeres via AdminEmailV2s egen «Ny mal»). En knapp uten reell
 * handling er ikke produksjonsklar — se PR-beskrivelsen for detaljer.
 *
 * Fanene er ekte lenker med `?fane=`, ikke klient-state — samme mønster som
 * KoHode/OppgaverHode/TurneringHode.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "../godkjenninger/tl-inspektor";
import { kommunikasjonHref, type KommunikasjonFane, type KommunikasjonFaneId } from "@/lib/admin/kommunikasjon/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function KommunikasjonHode({
  faner,
  aktiv,
  antall,
}: {
  faner: KommunikasjonFane[];
  aktiv: KommunikasjonFaneId;
  /** Antall per fane. Mangler et tall, vises ingen teller (jf. «Kart» i Turnering). */
  antall: Partial<Record<KommunikasjonFaneId, number>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <TlCaps>Academy</TlCaps>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Kommunikasjon</h1>
        <p style={{ margin: "8px 0 0", maxWidth: "62ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          E-post, meldinger og maler ett sted. Utkast skrives her — sending krever alltid ditt ja.
        </p>
      </div>

      <nav aria-label="Kommunikasjon-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          const n = antall[f.id];
          return (
            <Link
              key={f.id}
              href={kommunikasjonHref(f.id)}
              aria-current={er ? "page" : undefined}
              className={PRESS}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 16px",
                borderRadius: TL.radius.pill,
                background: er ? TL.fill : TL.dim,
                color: er ? TL.onFill : TL.text,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              <span>{f.label}</span>
              {n !== undefined && (
                <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.75 }}>{n.toLocaleString("nb-NO")}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
