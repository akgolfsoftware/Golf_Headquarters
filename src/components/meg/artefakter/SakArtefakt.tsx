"use client";

/**
 * Sak-artefaktet — én sak utvidet: utkast til svar, Godkjenn/Rediger/Avvis.
 * Fasit: jarvis/meg-sak.html. Gullregelen (nattsesjon-prompt Fase 2 punkt 3):
 * ingen mutasjon uten eksplisitt godkjenn-handling, og en 10 sekunders
 * angrefrist klient-side FØR selve kallet fyres.
 *
 * «Sendt via {kanal}» fra fasiten er BEVISST ikke UI-teksten her — se
 * kommentaren øverst i src/app/meg/actions.ts: godkjenning oppretter et
 * Gmail-UTKAST for EPOST-saker (aldri .send()), så panelet sier «Gmail-utkast
 * opprettet», ikke en sendt-bekreftelse appen ikke kan stå inne for.
 *
 * Redigert svar persisteres via onOppdaterSvar FØR godkjenning — serverens
 * godkjennSak leser foreslattSvar fra databasen, så en ren klient-redigering
 * ville ellers gått tapt (lagres både ved «Ferdig» og automatisk i
 * godkjenn-flyten hvis teksten er endret).
 */
import { useEffect, useRef, useState } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { InspektorBlokk, InspektorLinje, InspektorTom } from "@/components/v2/inspektorpanel";
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";

type Handling = "godkjenn" | "avvis";
type MutasjonSvar = { ok: true } | { ok: false; feil: string };

const STATUS_LABEL: Record<SakStatus, string> = {
  [SakStatus.VENTER]: "Venter på deg",
  [SakStatus.GODKJENT]: "Godkjent",
  [SakStatus.AVVIST]: "Avvist",
  [SakStatus.UTFORT]: "Utført",
  [SakStatus.UTLOPT]: "Utløpt",
};

const ANGREFRIST_MS = 10_000;

/**
 * `key={sak.id}` på kallstedet (MegApp) gir en fersk komponentinstans per
 * sak — det er hvordan svarUtkast/redigerer/ventende nullstilles når
 * brukeren velger en annen sak, uten en reset-effekt som kaller setState
 * synkront (React-anbefalingen: bruk key for å nullstille state, ikke en
 * effekt). Se https://react.dev/learn/you-might-not-need-an-effect.
 */
export function SakArtefakt({
  sak,
  onGodkjenn,
  onAvvis,
  onOppdaterSvar,
}: {
  sak: Sak | null;
  onGodkjenn: (id: string) => Promise<MutasjonSvar>;
  onAvvis: (id: string) => Promise<MutasjonSvar>;
  onOppdaterSvar: (id: string, tekst: string) => Promise<MutasjonSvar>;
}) {
  const [svarUtkast, setSvarUtkast] = useState(sak?.foreslattSvar ?? "");
  const [redigerer, setRedigerer] = useState(false);
  // Ventende handling under angrefristen — null når ingenting er i gang.
  const [ventende, setVentende] = useState<{ type: Handling; sekunderIgjen: number } | null>(null);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  // Alltid ferskeste utkast — angrefristens setTimeout-closure ville ellers
  // lest teksten slik den var da Godkjenn ble trykket, ikke slik den er når
  // fristen løper ut. Oppdateres i textarea-ens onChange (samme hendelse som
  // setSvarUtkast), aldri under render (react-hooks/refs).
  const svarUtkastRef = useRef(svarUtkast);

  // Rydder tidsurene ved avmontering (sak byttet via key, eller panelet lukket
  // midt i angrefristen) — ren opprydding, ingen setState i selve effekten.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  if (!sak) {
    return <InspektorTom tittel="Ingen sak valgt" tekst="Velg en sak fra køen for å se den her." />;
  }

  // Fanget som egne const-er: narrowingen fra guarden over overlever ikke inn
  // i en closure som slipper unna til setTimeout (TS antar sak-parameteren kan
  // ha endret seg innen callbacken kjører).
  const sakId = sak.id;
  const foreslattSvarOriginal = sak.foreslattSvar;

  /**
   * Persisterer redigert svarutkast hvis det avviker fra databasens
   * foreslattSvar. Returnerer false (med feilmelding satt) hvis lagringen
   * feilet eller teksten er tom — kalleren skal da IKKE gå videre.
   */
  async function lagreEndretSvar(): Promise<boolean> {
    if (foreslattSvarOriginal == null) return true;
    const tekst = svarUtkastRef.current.trim();
    if (tekst === foreslattSvarOriginal.trim()) return true;
    if (!tekst) {
      setFeilmelding("Svaret kan ikke være tomt.");
      return false;
    }
    const svar = await onOppdaterSvar(sakId, tekst);
    if (!svar.ok) {
      setFeilmelding(svar.feil);
      return false;
    }
    return true;
  }

  function start(type: Handling) {
    setFeilmelding(null);
    setVentende({ type, sekunderIgjen: 10 });
    intervalRef.current = window.setInterval(() => {
      setVentende((v) => (v ? { ...v, sekunderIgjen: Math.max(0, v.sekunderIgjen - 1) } : v));
    }, 1000);
    timeoutRef.current = window.setTimeout(async () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      // Redigert tekst må stå i databasen FØR godkjenning — serveren leser
      // foreslattSvar derfra når Gmail-utkastet opprettes.
      if (type === "godkjenn" && !(await lagreEndretSvar())) {
        setVentende(null);
        return;
      }
      const svar = type === "godkjenn" ? await onGodkjenn(sakId) : await onAvvis(sakId);
      setVentende(null);
      if (!svar.ok) setFeilmelding(svar.feil);
    }, ANGREFRIST_MS);
  }

  function angre() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setVentende(null);
  }

  const erAvgjort = sak.status !== SakStatus.VENTER;

  return (
    <div data-od-id="panel-sak" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <InspektorBlokk label="Fra">
        <InspektorLinje label={sak.avsender ?? "Ukjent avsender"} verdi={STATUS_LABEL[sak.status]} />
        {sak.emne && (
          <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{sak.emne}</div>
        )}
      </InspektorBlokk>

      <InspektorBlokk label="Innhold">
        <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13, lineHeight: 1.6, color: T.fg }}>
          {sak.innhold}
        </p>
      </InspektorBlokk>

      {sak.foreslattSvar != null && (
        <InspektorBlokk label="Foreslått svar">
          {redigerer ? (
            <textarea
              value={svarUtkast}
              onChange={(e) => {
                svarUtkastRef.current = e.target.value;
                setSvarUtkast(e.target.value);
              }}
              data-od-id="sak-svar-rediger"
              rows={4}
              style={{
                width: "100%",
                resize: "vertical",
                border: `1px solid ${T.border}`,
                borderRadius: T.rTag,
                padding: 10,
                background: T.bg,
                color: T.fg,
                fontFamily: T.bodyFont,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            />
          ) : (
            <p
              style={{
                margin: 0,
                padding: 10,
                border: `1px solid ${T.borderS}`,
                borderRadius: T.rTag,
                background: T.panel2,
                fontFamily: T.bodyFont,
                fontSize: 13,
                lineHeight: 1.6,
                color: T.fg,
              }}
            >
              {svarUtkast}
            </p>
          )}
        </InspektorBlokk>
      )}

      {feilmelding && (
        <div role="alert" style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>
          {feilmelding}
        </div>
      )}

      {ventende ? (
        <div
          data-od-id="sak-angrefrist"
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "10px 12px",
            borderRadius: T.rTag,
            border: `1px solid ${T.border}`,
            background: T.panel2,
          }}
        >
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>
            {ventende.type === "godkjenn" ? "Godkjenner" : "Avviser"} om {ventende.sekunderIgjen}s …
          </span>
          <button
            type="button"
            onClick={angre}
            data-od-id="sak-angre"
            className="v2-press v2-focus"
            style={{
              minHeight: 32,
              padding: "0 14px",
              borderRadius: T.rTag,
              border: `1px solid ${T.fg}`,
              background: "transparent",
              color: T.fg,
              fontFamily: T.ui,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Angre
          </button>
        </div>
      ) : erAvgjort ? (
        <div
          data-od-id={`state-${sak.status.toLowerCase()}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: T.rTag,
            border: `1px solid ${T.borderS}`,
            background: T.panel2,
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.mut,
          }}
        >
          <Icon name={sak.status === SakStatus.AVVIST ? "x-circle" : "check-circle"} size={15} strokeWidth={1.8} />
          {sak.status === SakStatus.GODKJENT && sak.kanal === SakKanal.EPOST
            ? "Godkjent — Gmail-utkast opprettet (sendes aldri automatisk)"
            : STATUS_LABEL[sak.status]}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => start("godkjenn")}
            data-od-id="sak-godkjenn"
            className="v2-press v2-focus"
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: T.rTag,
              border: `1px solid ${T.cta}`,
              background: T.cta,
              color: T.onCta,
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Godkjenn
          </button>
          {sak.foreslattSvar != null && (
            <button
              type="button"
              onClick={async () => {
                if (!redigerer) {
                  setRedigerer(true);
                  return;
                }
                // «Ferdig» lagrer endringen — feiler lagringen, blir brukeren
                // stående i redigeringsmodus med feilmeldingen synlig.
                setFeilmelding(null);
                if (await lagreEndretSvar()) setRedigerer(false);
              }}
              data-od-id="sak-rediger"
              className="v2-press v2-focus"
              style={{
                minHeight: 40,
                padding: "0 14px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {redigerer ? "Ferdig" : "Rediger"}
            </button>
          )}
          <button
            type="button"
            onClick={() => start("avvis")}
            data-od-id="sak-avvis"
            className="v2-press v2-focus"
            style={{
              minHeight: 40,
              padding: "0 14px",
              borderRadius: T.rTag,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.mut,
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Avvis
          </button>
        </div>
      )}
    </div>
  );
}
