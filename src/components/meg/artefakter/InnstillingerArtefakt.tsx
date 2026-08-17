"use client";

/**
 * Innstillinger-artefaktet — «fire ting du kan skru på» (fasitens egen
 * formulering, ikke et admin-panel). Fasit: jarvis/meg-innstillinger.html
 * (bryter-rader + SLA-select, autolagring, ingen Lagre-knapp).
 *
 * Ekte skriving via oppdaterInnstilling (src/app/meg/actions.ts) til
 * JarvisInnstilling — men INGEN forbruker leser feltene tilbake ennå.
 * Bevisst avvik fra fasiten: en kort forklaringslinje sier dette rett ut,
 * i stedet for å la bryterne se ut som de har full effekt med en gang.
 */
import { useState } from "react";
import { T } from "@/lib/v2/tokens";
import type { Innstillinger, InnstillingEndring } from "@/lib/jarvis/types";

type MutasjonSvar = { ok: true } | { ok: false; feil: string };

function Bryter({ pa, onToggle, label }: { pa: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pa}
      aria-label={label}
      onClick={onToggle}
      className="v2-focus"
      style={{
        position: "relative",
        width: 40,
        height: 24,
        flex: "none",
        borderRadius: T.rPill,
        background: pa ? T.fg : T.panel2,
        border: `1px solid ${pa ? T.fg : T.borderS}`,
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 1,
          left: pa ? 17 : 1,
          width: 18,
          height: 18,
          borderRadius: T.rPill,
          background: T.panel,
          border: `1px solid ${T.border}`,
          transition: "left 0.15s ease",
        }}
      />
    </button>
  );
}

function InnstillingRad({ navn, detalj, children }: { navn: string; detalj: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.borderS}` }}>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>{navn}</span>
        <span style={{ display: "block", fontSize: 11.5, color: T.mut, fontFamily: T.ui }}>{detalj}</span>
      </span>
      {children}
    </div>
  );
}

export function InnstillingerArtefakt({
  innstillinger,
  onEndre,
}: {
  innstillinger: Innstillinger;
  onEndre: (endring: InnstillingEndring) => Promise<MutasjonSvar>;
}) {
  const [verdier, setVerdier] = useState(innstillinger);
  const [status, setStatus] = useState<"idle" | "lagrer" | "lagret" | "feil">("idle");

  async function endre(endring: InnstillingEndring) {
    const forrige = verdier;
    setVerdier((v) => ({ ...v, [endring.felt]: endring.verdi }));
    setStatus("lagrer");
    const svar = await onEndre(endring);
    if (svar.ok) {
      setStatus("lagret");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setVerdier(forrige);
      setStatus("feil");
    }
  }

  return (
    <div data-od-id="panel-innstillinger" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          border: `1px dashed ${T.border}`,
          borderRadius: T.rTag,
          padding: "8px 10px",
          marginBottom: 16,
          fontFamily: T.ui,
          fontSize: 11.5,
          color: T.mut,
        }}
      >
        Valgene lagres, men styrer ikke innsamlerne/SLA-fristen ennå — det er fortsatt hardkodet andre steder i koden.
      </div>

      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginBottom: 4 }}>
        Kanaler — innsamlere av/på
      </div>
      <InnstillingRad navn="Gmail" detalj="hvert 10. min">
        <Bryter pa={verdier.kanalGmail} onToggle={() => endre({ felt: "kanalGmail", verdi: !verdier.kanalGmail })} label="Gmail" />
      </InnstillingRad>
      <InnstillingRad navn="iMessage + SMS" detalj="hvert 5. min">
        <Bryter pa={verdier.kanalImessage} onToggle={() => endre({ felt: "kanalImessage", verdi: !verdier.kanalImessage })} label="iMessage og SMS" />
      </InnstillingRad>
      <InnstillingRad navn="Telegram" detalj="hvert 5. min">
        <Bryter pa={verdier.kanalTelegram} onToggle={() => endre({ felt: "kanalTelegram", verdi: !verdier.kanalTelegram })} label="Telegram" />
      </InnstillingRad>
      <InnstillingRad navn="Anrop" detalj="ubesvarte → køen">
        <Bryter pa={verdier.kanalAnrop} onToggle={() => endre({ felt: "kanalAnrop", verdi: !verdier.kanalAnrop })} label="Anrop" />
      </InnstillingRad>
      <InnstillingRad navn="Kalender" detalj="vakten sjekker hver time">
        <Bryter pa={verdier.kanalKalender} onToggle={() => endre({ felt: "kanalKalender", verdi: !verdier.kanalKalender })} label="Kalender" />
      </InnstillingRad>

      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, margin: "16px 0 4px" }}>
        Rytme
      </div>
      <InnstillingRad navn="SLA-terskel" detalj="frist for skriftlig svar">
        <select
          value={verdier.slaTerskelTimer}
          onChange={(e) => endre({ felt: "slaTerskelTimer", verdi: Number(e.target.value) })}
          aria-label="SLA-terskel"
          data-od-id="select-sla"
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: T.rInput,
            background: T.panel,
            color: T.fg,
            fontFamily: T.mono,
            fontSize: 12,
            padding: "0 8px",
            minHeight: 32,
          }}
        >
          <option value={4}>4 t</option>
          <option value={6}>6 t (standard)</option>
          <option value={8}>8 t</option>
        </select>
      </InnstillingRad>
      <InnstillingRad navn="Stemme" detalj="les briefen og svar høyt">
        <Bryter pa={verdier.stemmeAktivert} onToggle={() => endre({ felt: "stemmeAktivert", verdi: !verdier.stemmeAktivert })} label="Stemme" />
      </InnstillingRad>
      <InnstillingRad navn="Stille tidsrom" detalj="ingen varsler 22:00–07:00">
        <Bryter
          pa={verdier.stilleTidsromAktivert}
          onToggle={() => endre({ felt: "stilleTidsromAktivert", verdi: !verdier.stilleTidsromAktivert })}
          label="Stille tidsrom"
        />
      </InnstillingRad>

      <div style={{ fontFamily: T.mono, fontSize: 10.5, color: status === "feil" ? T.down : T.mut, marginTop: 16 }}>
        {status === "lagrer" && "Lagrer …"}
        {status === "lagret" && "✓ Lagret"}
        {status === "feil" && "Kunne ikke lagre — prøv igjen"}
        {status === "idle" && "Lagres automatisk"}
      </div>
    </div>
  );
}
