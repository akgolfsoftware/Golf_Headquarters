/**
 * PlayerHQ · Talent · Min plan.
 * Ekte TalentTracking. Tom milepæl peker til coach og Workbench.
 */

import { Calendar, Circle, CircleCheck, Flag, Target } from "lucide-react";
import { Ikon, KnappLenke, StatusPille, TomTilstand } from "@/components/precision/pa";

export interface TalentMinPlanData {
  niva: string;
  /** Nivå/klubb/region/i programmet — ferdig formatert i page. */
  status: { label: string; value: string }[];
  /** De fem aksene (1–10, null = ikke vurdert). */
  akser: { label: string; verdi: number | null }[];
  /** Første ufullførte milepæl, eller null. */
  nesteMal: { tittel: string; beskrivelse: string | null; fristTekst: string | null } | null;
  milepaeler: { tittel: string; datoTekst: string | null; beskrivelse: string | null; fullfort: boolean }[];
}

function visStatus(value: string): string {
  return value
    .split(" ")
    .map((ord) => (ord ? ord.charAt(0).toLocaleUpperCase("nb-NO") + ord.slice(1) : ord))
    .join(" ");
}

function akseTekst(verdi: number | null): string {
  if (verdi === null) return "—";
  return `${verdi.toFixed(1).replace(".", ",")} / 10`;
}

export function TalentMinPlanV2({ data }: { data: TalentMinPlanData }) {
  return (
    <div className="ph-flate">
      <header>
        <p>Talent</p>
        <h1>Min plan</h1>
        <p>Sporet på de fem aksene coachen din bruker for å plassere deg på nivå og bygge programmet ditt.</p>
      </header>
      <StatusPille tone="ok">Nivå {data.niva}</StatusPille>

      <div className="ph-kpi">
        {data.status.map((s) => (
          <p className="pa-card" key={s.label}>
            <span>{s.label}</span>
            <strong>{visStatus(s.value)}</strong>
          </p>
        ))}
      </div>

      <section className="pa-card ph-kort">
        <p>Mine fem akser</p>
        <dl>
          {data.akser.map((a) => (
            <div key={a.label}>
              <dt>{a.label}</dt>
              <dd>{akseTekst(a.verdi)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pa-card ph-kort">
        <p>Neste mål</p>
        {data.nesteMal ? (
          <>
            <strong>{data.nesteMal.tittel}</strong>
            {data.nesteMal.beskrivelse && <small>{data.nesteMal.beskrivelse}</small>}
            {data.nesteMal.fristTekst && <small>Frist {data.nesteMal.fristTekst}</small>}
          </>
        ) : (
          <>
            <strong>Ingen aktive milepæler</strong>
            <small>Coachen din legger inn neste milepæl etter neste evaluering. I mellomtiden: hold tråden i ukeplanen.</small>
          </>
        )}
      </section>

      {!data.nesteMal && (
        <KnappLenke href="/portal/coach/melding" fullWidth icon={Target}>
          Spør coach om neste mål
        </KnappLenke>
      )}

      <section className="pa-card ph-kort">
        <p>Milepæler</p>
        {data.milepaeler.length === 0 ? (
          <TomTilstand
            icon={Flag}
            title="Ingen milepæler registrert ennå"
            text="Coachen legger inn milepæler — hold tråden i ukeplanen i mellomtiden."
            actions={
              <KnappLenke href="/portal/planlegge/workbench?zoom=uke" variant="secondary" icon={Calendar}>
                Åpne Workbench
              </KnappLenke>
            }
          />
        ) : (
          <ul>
            {data.milepaeler.map((m, i) => (
              <li key={`${m.tittel}-${i}`}>
                <Ikon icon={m.fullfort ? CircleCheck : Circle} size={18} />
                <span>
                  <strong>{m.tittel}</strong>
                  {m.beskrivelse && <small>{m.beskrivelse}</small>}
                </span>
                {m.datoTekst && <small>{m.datoTekst}</small>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
