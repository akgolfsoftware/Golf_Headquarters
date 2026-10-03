/**
 * Ukesdigest — spillerens uke.
 *
 * Fire seksjoner: Gjennomført · Slik slo du · Neste uke · Verdt å vite.
 * Nevneren står i klartekst. Hoppede økter telles, de gjemmes ikke.
 * Flaten leser bare — den skriver ingenting.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import { StatusPille, TomTilstand } from "@/components/precision/pa";
import type { DigestDag, UkesdigestData } from "@/lib/portal/ukesdigest";

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

function Hjelp({ children }: { children: ReactNode }) {
  return <div><small>{children}</small></div>;
}

function Ukestripe({ uke }: { uke: DigestDag[] }) {
  const gjennomfort = uke.filter((d) => d.tilstand === "gjennomfort").length;
  const hoppet = uke.filter((d) => d.tilstand === "hoppet").length;
  return (
    <ul
      className="ph-rader"
      aria-label={`Uka: ${gjennomfort} økter fullført${hoppet > 0 ? `, ${hoppet} hoppet` : ""}`}
    >
      {uke.map((d, i) => (
        <li key={i}>
          <span>
            <strong>{d.kort}</strong>
            <small>
              {d.tilstand === "gjennomfort" ? "Fullført" : d.tilstand === "hoppet" ? "Hoppet" : "Ingen økt"}
            </small>
          </span>
          <StatusPille tone={d.tilstand === "gjennomfort" ? "ok" : d.tilstand === "hoppet" ? "warn" : "neutral"}>
            {d.tilstand === "gjennomfort" ? "Fullført" : d.tilstand === "hoppet" ? "Hoppet" : "Ingen"}
          </StatusPille>
        </li>
      ))}
    </ul>
  );
}

export function UkesdigestV2({ data }: { data: UkesdigestData }) {
  const delt = data.deltAt != null;

  return (
    <div className="ph-flate">
      <header>
        <p>Uke</p>
        <h1>Uka di · uke {data.ukenummer}</h1>
        <p>
          {delt && data.deltAt
            ? `${data.periode} · delt av ${data.deltAv ?? "coachen"} ${DATO_FMT.format(data.deltAt)}`
            : data.periode}
        </p>
      </header>

      {!delt ? (
        <section className="pa-card ph-kort">
          <TomTilstand
            icon={Mail}
            title="Ingen digest ennå"
            text="Digesten kommer når coachen deler ukesrapporten — normalt søndag kveld. Den oppsummerer uka di med de samme tallene coachen ser."
          />
          <Link href="/portal/planlegge" className="pa-btn pa-btn--secondary pa-btn--full">
            Se uka di i planen
          </Link>
        </section>
      ) : (
        <>
          <section className="pa-card ph-kort">
            <p>Gjennomført</p>
            {data.etterlevelseTekst ? (
              <>
                <div className="ph-kpi">
                  <p className="pa-card">
                    <span>Etterlevelse</span>
                    <strong>{data.etterlevelseTekst}</strong>
                  </p>
                  <p className="pa-card">
                    <span>Tid</span>
                    <strong>{tid(data.loggetMinutter)}</strong>
                  </p>
                </div>
                <Hjelp>{data.nevnerTekst}</Hjelp>
                <Hjelp>
                  gjennomført tid siste fire uker · planlagt {tid(data.planlagtMinutter)}
                </Hjelp>
              </>
            ) : (
              <div>
                {data.planlagtMinutter > 0
                  ? "Ingen økter er forfalt ennå denne uka."
                  : "Ingen økter er planlagt denne uka."}
              </div>
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
          </section>

          {data.sg.length > 0 && (
            <section className="pa-card ph-kort">
              <p>Slik slo du · siste {data.sgRunder} runder</p>
              <ul className="ph-rader">
                {data.sg.map((s) => (
                  <li key={s.navn}>
                    <span>
                      <strong>{s.navn}</strong>
                      {s.note ? <small>{s.note}</small> : null}
                    </span>
                    <b>
                      {s.verdi.toLocaleString("nb-NO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                        signDisplay: "always",
                      })}
                    </b>
                    <StatusPille tone={s.verdi > 0.05 ? "ok" : s.verdi < -0.05 ? "signal" : "neutral"}>
                      {s.verdi > 0.05 ? "Opp" : s.verdi < -0.05 ? "Ned" : "Uendret"}
                    </StatusPille>
                  </li>
                ))}
              </ul>
              <Hjelp>Tallene er telt fra rundene dine — ingen vurdering.</Hjelp>
            </section>
          )}

          <section className="pa-card ph-kort">
            <p>Neste uke</p>
            {data.nesteUkeOkter > 0 ? (
              <dl>
                <div><dt>Økter</dt><dd>{data.nesteUkeOkter}</dd></div>
                <div><dt>Trening</dt><dd>{tid(data.nesteUkeMinutter)}</dd></div>
              </dl>
            ) : (
              <Hjelp>Neste uke er ikke publisert ennå.</Hjelp>
            )}
          </section>

          {(data.testforfall.length > 0 || data.turneringer.length > 0) && (
            <section className="pa-card ph-kort">
              <p>Verdt å vite</p>
              <ul className="ph-rader">
                {data.testforfall.map((t) => (
                  <li key={`test-${t.navn}`}>
                    <span>
                      <strong>Test forfaller</strong>
                      <small>{t.navn}</small>
                    </span>
                    <b>{DATO_FMT.format(t.forfaller)}</b>
                  </li>
                ))}
                {data.turneringer.map((t) => (
                  <li key={`turn-${t.navn}`}>
                    <span>
                      <strong>{t.navn}</strong>
                    </span>
                    <b>
                      {t.til && t.til.getTime() !== t.fra.getTime()
                        ? `${DATO_FMT.format(t.fra)}–${DATO_FMT.format(t.til)}`
                        : DATO_FMT.format(t.fra)}
                    </b>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Hjelp>
            Digesten er de samme tallene coachen ser i sin ukesrapport — samme nevnere,
            ingen skjulte vurderinger. Rapportagenten leser planen og loggen din; den
            endrer aldri noe.
          </Hjelp>
        </>
      )}
    </div>
  );
}
