"use client";

/**
 * Historikken-artefaktet — read-only revisjonslogg. Fasit: jarvis/meg-historikk.html
 * (søk + kanalfilter, gruppert per dag, hver rad viser godkjentAv + tidspunkt).
 *
 * Ekte datakilde: repository.ts sin hentLogg() — utleder logg-rader av Sak sin
 * egen status+oppdatert-historikk (ingen egen revisjonslogg-tabell, se
 * repository.ts sin filhode-kommentar). Bevisst avvik fra fasiten: radteksten
 * er en generisk "Godkjent/Avvist/Utført via <kanal>"-linje, ikke fasitens
 * AI-oppsummerte "Svart Øyvind Rossbach — treningstider bekreftet" — den
 * teksten finnes ikke som lagret data noe sted, og å dikte den opp ville
 * brutt "aldri fake data"-prinsippet resten av /meg-porten følger.
 */
import { useMemo, useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { InspektorTom } from "@/components/v2/inspektorpanel";
import { sammeDag, dagNavnLang } from "@/lib/uke-helpers";
import { SakKanal, type LoggRad } from "@/lib/jarvis/types";

const KANAL_IKON: Record<SakKanal, string> = {
  [SakKanal.EPOST]: "mail",
  [SakKanal.SMS]: "message-square",
  [SakKanal.IMESSAGE]: "message-circle",
  [SakKanal.TELEGRAM]: "send",
  [SakKanal.ANROP]: "phone",
  [SakKanal.KALENDER]: "calendar",
  [SakKanal.TASK]: "check-circle",
  [SakKanal.LYD]: "mic",
};

const KANAL_LABEL: Record<SakKanal, string> = {
  [SakKanal.EPOST]: "Gmail",
  [SakKanal.SMS]: "SMS",
  [SakKanal.IMESSAGE]: "iMessage",
  [SakKanal.TELEGRAM]: "Telegram",
  [SakKanal.ANROP]: "anrop",
  [SakKanal.KALENDER]: "Google Kalender",
  [SakKanal.TASK]: "oppgave",
  [SakKanal.LYD]: "lydopptak",
};

function dagLabel(dato: Date, na: Date): string {
  if (sammeDag(dato, na)) return "I dag";
  const igar = new Date(na);
  igar.setDate(igar.getDate() - 1);
  if (sammeDag(dato, igar)) return "I går";
  return `${dagNavnLang(dato)} ${dato.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long" })}`;
}

function klokke(iso: string): string {
  return new Date(iso).toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
}

export function HistorikkArtefakt({
  logg,
  na,
  onVelgSak,
}: {
  logg: LoggRad[];
  na: Date;
  onVelgSak: (id: string) => void;
}) {
  const [sok, setSok] = useState("");
  const [kanalFilter, setKanalFilter] = useState<SakKanal | "alle">("alle");

  const kanalerMedTreff = useMemo(() => {
    const set = new Set(logg.map((l) => l.kanal).filter((k): k is SakKanal => k != null));
    return (Object.values(SakKanal) as SakKanal[]).filter((k) => set.has(k));
  }, [logg]);

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return logg.filter((rad) => {
      if (kanalFilter !== "alle" && rad.kanal !== kanalFilter) return false;
      if (!q) return true;
      const tekst = `${rad.handling} ${rad.kanal ? KANAL_LABEL[rad.kanal] : ""} ${rad.godkjentAv}`.toLowerCase();
      return tekst.includes(q);
    });
  }, [logg, sok, kanalFilter]);

  const grupper = useMemo(() => {
    const map = new Map<string, { dato: Date; rader: LoggRad[] }>();
    for (const rad of filtrert) {
      const dato = new Date(rad.tidspunkt);
      const nokkel = dagLabel(dato, na);
      if (!map.has(nokkel)) map.set(nokkel, { dato, rader: [] });
      map.get(nokkel)!.rader.push(rad);
    }
    return Array.from(map.entries());
  }, [filtrert, na]);

  return (
    <div data-od-id="panel-historikk" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{filtrert.length} hendelser</div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk i loggen …"
          aria-label="Søk i historikken"
          data-od-id="input-sok"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 36,
            border: `1px solid ${T.border}`,
            borderRadius: T.rInput,
            background: T.panel,
            padding: "0 10px",
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        />
        <select
          value={kanalFilter}
          onChange={(e) => setKanalFilter(e.target.value as SakKanal | "alle")}
          aria-label="Filtrer på kanal"
          data-od-id="select-kanal"
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: T.rInput,
            background: T.panel,
            color: T.fg,
            fontFamily: T.ui,
            fontSize: 13,
            padding: "0 8px",
            minHeight: 36,
          }}
        >
          <option value="alle">Alle kanaler</option>
          {kanalerMedTreff.map((k) => (
            <option key={k} value={k}>
              {KANAL_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      {filtrert.length === 0 ? (
        <InspektorTom
          tittel="Ingen treff"
          tekst={logg.length === 0 ? "Ingenting er godkjent eller avvist ennå — loggen fylles etter hvert som saker avgjøres." : "Ingen hendelser matcher søket. Prøv et annet ord eller en annen kanal."}
        />
      ) : (
        grupper.map(([label, gruppe]) => (
          <div key={label}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, margin: "4px 0" }}>
              {label}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {gruppe.rader.map((rad) => (
                <li
                  key={rad.id}
                  style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.borderS}`, alignItems: "flex-start" }}
                >
                  <span style={{ width: 40, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 10.5, color: T.mut, paddingTop: 2 }}>
                    {klokke(rad.tidspunkt)}
                  </span>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      flex: "none",
                      borderRadius: T.rTag,
                      background: T.panel2,
                      border: `1px solid ${T.border}`,
                      display: "grid",
                      placeItems: "center",
                      color: T.mut,
                    }}
                  >
                    <Icon name={rad.kanal ? KANAL_IKON[rad.kanal] : "check-circle"} size={12} strokeWidth={1.8} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1, fontSize: 12.5, lineHeight: 1.45, fontFamily: T.ui, color: T.fg }}>
                    {rad.handling}
                    {rad.kanal && ` via ${KANAL_LABEL[rad.kanal]}`}
                    {rad.sakId && (
                      <>
                        {" — "}
                        <button
                          type="button"
                          onClick={() => onVelgSak(rad.sakId!)}
                          data-od-id={`cta-historikk-${rad.id}`}
                          style={{ display: "inline", background: "none", border: 0, padding: 0, color: T.fg, textDecoration: "underline", cursor: "pointer", fontSize: 12.5, fontFamily: T.ui }}
                        >
                          sak #{rad.sakId}
                        </button>
                      </>
                    )}
                    <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 2 }}>
                      <span style={{ color: T.up }}>✓ godkjent av {rad.godkjentAv}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
