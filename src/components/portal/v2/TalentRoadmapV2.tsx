/**
 * PlayerHQ · Talent · Roadmap.
 * Faser, turneringer og milepæler fra sesongplanen. Tomt peker til Workbench.
 */

import { Calendar, Circle, CircleCheck, Map, Trophy } from "lucide-react";
import { Ikon, KnappLenke, StatusPille, TomTilstand } from "@/components/precision/pa";

export interface TalentRoadmapData {
  niva: string;
  ar: number;
  /** Faser fra sesongplanen (L-fase-navn + periode + fokus). */
  faser: { id: string; navn: string; periode: string; fokus: string | null }[];
  turneringer: { id: string; navn: string; datoTekst: string | null }[];
  milepaeler: { tittel: string; datoTekst: string | null; beskrivelse: string | null; oppnadd: boolean }[];
}

export function TalentRoadmapV2({ data }: { data: TalentRoadmapData }) {
  const altTomt =
    data.faser.length === 0 && data.turneringer.length === 0 && data.milepaeler.length === 0;

  return (
    <div className="ph-flate">
      <section className="pa-card ph-kort">
        <StatusPille tone="warn">Pre-beta</StatusPille>
        <small>Sesongplan-funksjonen er under utbygging.</small>
      </section>

      <header>
        <p>Talent</p>
        <h1>Roadmap</h1>
        <p>Sesong {data.ar}</p>
      </header>
      <StatusPille tone="ok">Nivå {data.niva}</StatusPille>

      <div className="ph-kpi">
        <p className="pa-card">
          <span>Faser i sesongplan</span>
          <strong>{data.faser.length}</strong>
        </p>
        <p className="pa-card">
          <span>Turneringer planlagt</span>
          <strong>{data.turneringer.length}</strong>
        </p>
        <p className="pa-card">
          <span>Milepæler registrert</span>
          <strong>{data.milepaeler.length}</strong>
        </p>
      </div>

      <section className="pa-card ph-kort">
        <p>Sesongplan · faser</p>
        {data.faser.length === 0 ? (
          <>
            <TomTilstand
              icon={Calendar}
              title={`Ingen sesongplan for ${data.ar} ennå`}
              text="Faser dukker opp her når planen er lagt i Workbench."
              actions={
                <KnappLenke href="/portal/planlegge/workbench?zoom=uke" fullWidth>
                  Åpne Workbench
                </KnappLenke>
              }
            />
          </>
        ) : (
          <ul>
            {data.faser.map((fase) => (
              <li key={fase.id}>
                <span>
                  <strong>{fase.navn}</strong>
                  {fase.fokus && <small>{fase.fokus}</small>}
                </span>
                <small>{fase.periode}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.turneringer.length > 0 && (
        <section className="pa-card ph-kort">
          <p>Planlagte turneringer</p>
          <ul>
            {data.turneringer.map((t) => (
              <li key={t.id}>
                <Ikon icon={Trophy} size={18} />
                <span>
                  <strong>{t.navn}</strong>
                </span>
                {t.datoTekst && <small>{t.datoTekst}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.milepaeler.length > 0 && (
        <section className="pa-card ph-kort">
          <p>Personlige milepæler</p>
          <ul>
            {data.milepaeler.map((m, i) => (
              <li key={`${m.tittel}-${i}`}>
                <Ikon icon={m.oppnadd ? CircleCheck : Circle} size={18} />
                <span>
                  <strong>{m.tittel}</strong>
                  {m.beskrivelse && <small>{m.beskrivelse}</small>}
                </span>
                {m.datoTekst && <small>{m.datoTekst}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {altTomt && (
        <section className="pa-card ph-kort">
          <TomTilstand
            icon={Map}
            title="Ingen roadmap-data registrert ennå"
            text="Faser, turneringer og milepæler dukker opp når planen legges."
            actions={
              <KnappLenke href="/portal/planlegge/workbench?zoom=uke" fullWidth>
                Åpne Workbench
              </KnappLenke>
            }
          />
        </section>
      )}
    </div>
  );
}
