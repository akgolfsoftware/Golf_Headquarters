"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Raske handlinger-seksjon for /admin/stats/overview, v2-port 16. juli 2026.
 *
 * «Sjekk DB-helse» kjører en ekte read-only DB-ping. De tre andre er bevisst
 * inaktive (utadvendt / ikke koblet / sensitiv) og merket som det, i stedet for
 * å se klikkbare ut men gjøre ingenting.
 */

import { useState, useTransition } from "react";
import { Icon } from "@/components/v2/icon";
import { Reveal } from "@/components/stats/reveal";
import { sjekkDbHelse, type DbHelseResultat } from "@/app/admin/(legacy)/stats/overview/actions";

type LaastGrunn = "utadvendt" | "ikke koblet" | "sensitiv";

const LAAST: { tekst: string; grunn: LaastGrunn }[] = [
  { tekst: "Kjør manuell sync av PGA-data", grunn: "utadvendt" },
  { tekst: "Send ukentlig roundup nå", grunn: "ikke koblet" },
  { tekst: "Roter CRON_SECRET", grunn: "sensitiv" },
];

const GRUNN_TEKST: Record<LaastGrunn, string> = {
  utadvendt: "Treffer DataGolf — kjøres fra ops",
  "ikke koblet": "Endepunkt ikke bygget",
  sensitiv: "Hemmelighet — kjøres fra terminal",
};

export function RaskeHandlingerV2() {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<DbHelseResultat | null>(null);

  function kjorDbHelse() {
    startTransition(async () => {
      setResultat(null);
      const r = await sjekkDbHelse();
      setResultat(r);
    });
  }

  return (
    <div data-paper-wave-h="statsraskehandlinger" data-paper-pattern  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
      <Reveal delay={0}>
        <button
          type="button"
          onClick={kjorDbHelse}
          disabled={pending}
          style={{
            display: "flex", flexDirection: "column", gap: 10, width: "100%", height: "100%",
            borderRadius: TL.radius.card, border: `1px solid ${TL.hair}`, background: TL.elev, padding: 20,
            textAlign: "left", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1,
          }}
        >
          <Icon name={pending ? "loader" : "play"} size={16} style={{ color: TL.fill }} className={pending ? "animate-spin" : undefined} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: TL.text }}>Sjekk DB-helse</span>
          {resultat && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: resultat.ok ? TL.ok : TL.danger }}>
              <Icon name={resultat.ok ? "check" : "triangle-alert"} size={12} />
              {resultat.ok ? `OK · ${resultat.latencyMs} ms · ${resultat.brukere} brukere` : `Feil · ${resultat.latencyMs} ms`}
            </span>
          )}
        </button>
      </Reveal>

      {LAAST.map((h, i) => (
        <Reveal key={h.tekst} delay={(i + 1) * 40}>
          <div
            title={GRUNN_TEKST[h.grunn]}
            style={{
              display: "flex", flexDirection: "column", gap: 10, width: "100%", height: "100%",
              borderRadius: TL.radius.card, border: `1px dashed ${TL.hair}`, background: TL.dock, padding: 20,
              textAlign: "left", cursor: "not-allowed",
            }}
          >
            <Icon name="play" size={16} style={{ color: TL.mute }} />
            <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: TL.mute }}>{h.tekst}</span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>{GRUNN_TEKST[h.grunn]}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
