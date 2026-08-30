/**
 * Ukesdigest — spillerens uke (D3).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-ukesdigest.html
 *
 * Fire seksjoner i fasitens rekkefølge: Gjennomført · Slik slo du · Neste uke ·
 * Verdt å vite. Nevneren står i klartekst overalt, og den hoppede økta telles
 * synlig — fasitens egen regel: «den telles, den gjemmes ikke».
 *
 * Ingen clay her. Digesten er noe man leser, ikke en handling som skal utføres,
 * så «Én ting nå»-monopolet røres ikke.
 */

import type { ReactNode } from "react";

import { TL } from "@/lib/v2/train-lock";

import { TomTilstand } from "@/components/v2";
import { PaperPage, PaperTopp, PaperKropp } from "@/components/portal/v2/SideChrome";
import type { UkesdigestData, DigestDag } from "@/lib/portal/ukesdigest";

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Oslo",
});

function tid(minutter: number): string {
  const t = Math.floor(minutter / 60);
  const m = minutter % 60;
  if (t === 0) return `${m} m`;
  return m === 0 ? `${t} t` : `${t} t ${m} m`;
}

function Kort({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: TL.font.mono,
          fontSize: TL.storrelse.capsSm,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: TL.mute,
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </span>
      {children}
    </section>
  );
}

/** Tallpar med nevneren under — fasitens `.dtall .c`. */
function Tall({ verdi, under }: { verdi: string; under: string }) {
  return (
    <div style={{ minWidth: 120 }}>
      <span
        style={{
          display: "block",
          fontFamily: TL.font.mono,
          fontSize: TL.storrelse.tallMin,
          fontWeight: 600,
          color: TL.text,
          lineHeight: 1.1,
        }}
      >
        {verdi}
      </span>
      <span style={{ display: "block", fontSize: TL.storrelse.meta, color: TL.mute, marginTop: 2 }}>
        {under}
      </span>
    </div>
  );
}

/** Én linje med navn, valgfri note og tall til høyre — fasitens `.sgl`. */
function Linje({
  navn,
  note,
  verdi,
  retning,
}: {
  navn: string;
  note?: string;
  verdi: string;
  retning?: "opp" | "ned";
}) {
  const farge = retning === "opp" ? TL.ok : retning === "ned" ? TL.danger : TL.text;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "8px 0",
        borderTop: `1px solid ${TL.hair}`,
      }}
    >
      <span style={{ fontSize: TL.storrelse.kropp, color: TL.text, flex: "none" }}>{navn}</span>
      {note && (
        <span style={{ fontSize: TL.storrelse.meta, color: TL.mute, minWidth: 0, flex: 1 }}>{note}</span>
      )}
      <span
        style={{
          marginLeft: "auto",
          fontFamily: TL.font.mono,
          fontSize: TL.storrelse.kropp,
          fontWeight: 600,
          color: farge,
          flex: "none",
        }}
      >
        {verdi}
      </span>
    </div>
  );
}

function Ukestripe({ uke }: { uke: DigestDag[] }) {
  const gjennomfort = uke.filter((d) => d.tilstand === "gjennomfort").length;
  const hoppet = uke.filter((d) => d.tilstand === "hoppet").length;

  return (
    <div
      role="img"
      aria-label={`Uka: ${gjennomfort} økter fullført${hoppet > 0 ? `, ${hoppet} hoppet` : ""}`}
      style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, margin: "12px 0" }}
    >
      {uke.map((d, i) => {
        const fylt = d.tilstand === "gjennomfort";
        const hopp = d.tilstand === "hoppet";
        return (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "8px 0",
              borderRadius: TL.radius.row,
              fontFamily: TL.font.mono,
              fontSize: TL.storrelse.capsSm,
              background: fylt ? TL.text : hopp ? TL.dim : "transparent",
              color: fylt ? TL.scene : hopp ? TL.mute : TL.mute,
              border: fylt ? "none" : `1px solid ${hopp ? TL.hair : TL.hair}`,
              textDecoration: hopp ? "line-through" : "none",
            }}
          >
            {d.kort}
          </div>
        );
      })}
    </div>
  );
}

function Hjelp({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: TL.font.sans,
        fontSize: TL.storrelse.meta,
        color: TL.mute,
        lineHeight: 1.5,
        marginTop: 10,
      }}
    >
      {children}
    </p>
  );
}

export function UkesdigestV2({ data }: { data: UkesdigestData }) {
  const delt = data.deltAt != null;

  return (
    <PaperPage odId="ukesdigest">
      <PaperTopp
        tittel={`Uka di · uke ${data.ukenummer}`}
        sub={
          delt && data.deltAt
            ? `${data.periode} · delt av ${data.deltAv ?? "coachen"} ${DATO_FMT.format(data.deltAt)}`
            : data.periode
        }
        tilbakeHref="/portal"
      />
      <PaperKropp>
        {!delt ? (
          <>
            <TomTilstand
              icon="mail"
              title="Ingen digest ennå"
              sub="Digesten kommer når coachen deler ukesrapporten — normalt søndag kveld. Den oppsummerer uka di med de samme tallene coachen ser."
            />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <a
                href="/portal/planlegge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 18px",
                  borderRadius: TL.radius.field,
                  border: `1px solid ${TL.hair}`,
                  background: TL.elev,
                  color: TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: TL.storrelse.kropp,
                  textDecoration: "none",
                }}
              >
                Se uka di i planen
              </a>
            </div>
          </>
        ) : (
          <>
            <Kort eyebrow="Gjennomført">
              {data.etterlevelseTekst ? (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Tall verdi={data.etterlevelseTekst} under={data.nevnerTekst} />
                  <Tall
                    verdi={tid(data.loggetMinutter)}
                    under={`logget tid · planlagt ${tid(data.planlagtMinutter)}`}
                  />
                </div>
              ) : (
                /* Ingen økter er forfalt ennå. En stor «—» over nevneren leser
                   som et dårlig resultat; en setning sier det som faktisk er. */
                <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: TL.storrelse.kropp, color: TL.text }}>
                  {data.planlagtMinutter > 0
                    ? "Ingen økter er forfalt ennå denne uka."
                    : "Ingen økter er planlagt denne uka."}
                </p>
              )}
              <Ukestripe uke={data.uke} />
              {data.etterlevelse.hoppet > 0 && (
                <Hjelp>
                  {data.etterlevelse.hoppet === 1
                    ? "Én økt markerte du som hoppet — den telles, den gjemmes ikke."
                    : `${data.etterlevelse.hoppet} økter markerte du som hoppet — de telles, de gjemmes ikke.`}
                </Hjelp>
              )}
              {data.etterlevelse.ulogget > 0 && (
                <Hjelp>
                  {data.etterlevelse.ulogget === 1
                    ? "Én økt er forfalt uten logging. Den teller i nevneren til du sier hva som skjedde."
                    : `${data.etterlevelse.ulogget} økter er forfalt uten logging. De teller i nevneren til du sier hva som skjedde.`}
                </Hjelp>
              )}
            </Kort>

            {data.sg.length > 0 && (
              <Kort eyebrow={`Slik slo du · siste ${data.sgRunder} runder`}>
                {data.sg.map((s) => (
                  <Linje
                    key={s.navn}
                    navn={s.navn}
                    note={s.note}
                    verdi={s.verdi.toLocaleString("nb-NO", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                      signDisplay: "always",
                    })}
                    retning={s.verdi > 0.05 ? "opp" : s.verdi < -0.05 ? "ned" : undefined}
                  />
                ))}
                <Hjelp>
                  Tallene er telt fra rundene dine — ingen vurdering.
                </Hjelp>
              </Kort>
            )}

            <Kort eyebrow="Neste uke">
              {data.nesteUkeOkter > 0 ? (
                <>
                  <Linje navn="Økter" verdi={String(data.nesteUkeOkter)} />
                  <Linje navn="Trening" verdi={tid(data.nesteUkeMinutter)} />
                </>
              ) : (
                <Hjelp>Neste uke er ikke publisert ennå.</Hjelp>
              )}
            </Kort>

            {(data.testforfall.length > 0 || data.turneringer.length > 0) && (
              <Kort eyebrow="Verdt å vite">
                {data.testforfall.map((t) => (
                  <Linje
                    key={`test-${t.navn}`}
                    navn="Test forfaller"
                    note={t.navn}
                    verdi={DATO_FMT.format(t.forfaller)}
                  />
                ))}
                {data.turneringer.map((t) => (
                  <Linje
                    key={`turn-${t.navn}`}
                    navn={t.navn}
                    verdi={
                      t.til && t.til.getTime() !== t.fra.getTime()
                        ? `${DATO_FMT.format(t.fra)}–${DATO_FMT.format(t.til)}`
                        : DATO_FMT.format(t.fra)
                    }
                  />
                ))}
              </Kort>
            )}

            <Hjelp>
              Digesten er de samme tallene coachen ser i sin ukesrapport — samme nevnere,
              ingen skjulte vurderinger. Rapportagenten leser planen og loggen din; den
              endrer aldri noe.
            </Hjelp>
          </>
        )}
      </PaperKropp>
    </PaperPage>
  );
}
