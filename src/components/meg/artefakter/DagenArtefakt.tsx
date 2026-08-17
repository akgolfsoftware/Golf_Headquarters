"use client";

/**
 * Dagen-artefaktet — agenda-tidslinje for i dag. Fasit: jarvis/meg-dagen.html
 * (agenda-liste, aldri knust grid; "nå"-linje; blokk-kort for innboksrunder).
 *
 * Ekte datakilder: Google-kalender (src/lib/meg/connectors/google.ts,
 * samme ADMIN-tilkobling som Gmail) + et snapshot av Sak-køen for
 * innboksblokkene. Sammensetningen er ren logikk i src/lib/jarvis/dagen.ts.
 *
 * Bevisste avvik fra fasiten (ærlig-tomme-tilstander-prinsippet, samme som
 * Maskinrommet/Kalendervakten): reisetid mellom avtaler er utelatt (ingen
 * geokoding/rutetjeneste i repoet), og det finnes ingen "Fys — base"/
 * "Morgenbrief generert"-rader (de artefaktene er ikke bygget ennå).
 * Innboksblokkene viser et nå-snapshot av køen, ikke en prognose for hvilke
 * frister som "rekkes" på blokkens fremtidige tidspunkt.
 */
import { T } from "@/lib/v2/tokens";
import { InspektorTom } from "@/components/v2/inspektorpanel";
import type { DagenData, DagenElement } from "@/lib/jarvis/types";

function formatKlokke(iso: string): string {
  return new Date(iso).toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
}

function formatTid(el: DagenElement): string {
  const start = formatKlokke(el.start);
  if (!el.slutt) return start;
  return `${start}–${formatKlokke(el.slutt)}`;
}

function ElementRad({ el, onApneSaker }: { el: DagenElement; onApneSaker: () => void }) {
  const ledig = el.type === "ledig";
  const blokk = el.type === "innboksblokk";

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          width: 78,
          flex: "none",
          textAlign: "right",
          paddingTop: 3,
          fontFamily: T.mono,
          fontSize: 11,
          color: T.mut,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTid(el)}
      </span>
      <span style={{ width: 10, flex: "none", display: "flex", justifyContent: "center", alignSelf: "stretch", position: "relative" }}>
        <span style={{ position: "absolute", top: 0, bottom: 0, width: 1, background: T.border }} />
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: T.rPill,
            background: el.ferdig ? T.up : T.panel,
            border: `1.5px solid ${el.ferdig ? T.up : T.mut}`,
            marginTop: 6,
            position: "relative",
            zIndex: 1,
          }}
        />
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          background: ledig ? "transparent" : T.panel,
          border: `1px ${ledig ? "dashed" : "solid"} ${ledig ? T.borderS : T.border}`,
          borderLeft: blokk ? `3px solid ${T.fg}` : undefined,
          borderRadius: T.rTag,
          padding: "8px 10px",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: ledig ? T.mono : T.disp,
            fontSize: ledig ? 10.5 : 13,
            fontWeight: ledig ? 500 : 600,
            letterSpacing: ledig ? "0.06em" : undefined,
            textTransform: ledig ? "uppercase" : undefined,
            color: ledig ? T.mut : el.ferdig ? T.mut : T.fg,
          }}
        >
          {el.tittel}
        </span>
        {el.undertekst && (
          <span style={{ display: "block", fontSize: 11.5, color: T.mut, fontFamily: T.ui, marginTop: 2 }}>
            {el.undertekst}
            {el.lenke === "saker" && (
              <>
                {" · "}
                <button
                  type="button"
                  onClick={onApneSaker}
                  data-od-id={`cta-blokk-${el.id}`}
                  style={{
                    display: "inline",
                    minHeight: "auto",
                    background: "none",
                    border: 0,
                    padding: 0,
                    color: T.info,
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontFamily: T.ui,
                  }}
                >
                  åpne saker
                </button>
              </>
            )}
          </span>
        )}
      </span>
    </div>
  );
}

export function DagenArtefakt({ data, na, onApneSaker }: { data: DagenData; na: Date; onApneSaker: () => void }) {
  if (!data.kalenderTilgjengelig) {
    return (
      <InspektorTom
        tittel="Fikk ikke lest kalenderen"
        tekst={
          data.kalenderFeil?.startsWith("Google er ikke koblet")
            ? "Google-tilkoblingen mangler eller er ikke aktiv. Koble til på nytt i AgencyOS."
            : "Kalenderkallet feilet. Prøv å laste inn på nytt om et øyeblikk."
        }
      />
    );
  }

  const avtaler = data.elementer.filter((e) => e.type === "avtale").length;
  const blokker = data.elementer.filter((e) => e.type === "innboksblokk").length;

  const naMs = na.getTime();
  let naaLinjeSatt = false;

  return (
    <div data-od-id="panel-dagen" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginBottom: 8 }}>
        {avtaler} avtale{avtaler === 1 ? "" : "r"} · {blokker} innboksblokk{blokker === 1 ? "" : "er"}
      </div>

      {data.elementer.length === 0 ? (
        <InspektorTom tittel="Ingenting planlagt" tekst="Ingen kalenderhendelser eller innboksrunder funnet for i dag." />
      ) : (
        data.elementer.map((el, i) => {
          const elStartMs = new Date(el.start).getTime();
          const visNaaLinjeFør = !naaLinjeSatt && elStartMs > naMs;
          if (visNaaLinjeFør) naaLinjeSatt = true;
          return (
            <div key={el.id}>
              {visNaaLinjeFør && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }} aria-label="Nå">
                  <span style={{ width: 78, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 10, color: T.handling }}>
                    {formatKlokke(na.toISOString())} nå
                  </span>
                  <span style={{ flex: 1, height: 1, background: T.handling, opacity: 0.6 }} />
                </div>
              )}
              <ElementRad el={el} onApneSaker={onApneSaker} />
              {i === data.elementer.length - 1 && !naaLinjeSatt && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }} aria-label="Nå">
                  <span style={{ width: 78, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 10, color: T.handling }}>
                    {formatKlokke(na.toISOString())} nå
                  </span>
                  <span style={{ flex: 1, height: 1, background: T.handling, opacity: 0.6 }} />
                </div>
              )}
            </div>
          );
        })
      )}

      <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 8 }}>
        Oppdatert {formatKlokke(na.toISOString())}
        {data.ledigMinutterIgjen > 0 && (
          <>
            {" · ledig i dag "}
            {data.ledigMinutterIgjen >= 60
              ? `${Math.floor(data.ledigMinutterIgjen / 60)}t ${data.ledigMinutterIgjen % 60}m`
              : `${data.ledigMinutterIgjen} min`}
          </>
        )}
      </div>
    </div>
  );
}
