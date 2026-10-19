/**
 * Notion (/admin/workspace/notion) — Precision Athletics, i AgencyOSSkall.
 * Fasit: docs/design-system/utkast-agencyos/resten.html, mal «notion».
 *
 * Samme datakontrakt som før (ensureNotionConnection og getNotionConnectionForUser i siden).
 * «Synk nå» poster til /api/notion/sync som før.
 *
 * Avvik:
 *   - Eksempelinnholdet i den gamle skjermen (feltkartlegging, synkhistorikk, forslag om ny
 *     property og knappene for standard synlighet uten lagring) er tatt ut. Utkastet viser bare
 *     ekte databaser og siste synk.
 *   - «Koble fra» i utkastet er ikke lagt til; det finnes ingen handling for det.
 */
import { Pille, Seksjon, Tom, Varsel } from "./ny";

type DbLink = { id: string; navn: string; type: string; syncMode: string; pagesCount: number; lastSyncAt: Date | null };

export interface NotionTilkoblingData {
  tilstand: "empty" | "connected";
  isAdmin: boolean;
  harInternalToken: boolean;
  feilmelding: string | null;
  workspaceName: string;
  tilkobletSiden: Date | null;
  sistSynket: Date | null;
  databaser: DbLink[];
}

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });

function siden(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "nå";
  if (mins < 60) return `${mins} min siden`;
  const t = Math.round(mins / 60);
  if (t < 24) return `${t} t siden`;
  return `${Math.round(t / 24)} d siden`;
}

function NotionMerke() {
  return (
    <span className="ikonboks" aria-hidden style={{ background: "var(--graphite-900)", color: "var(--white)", font: "700 18px/1 serif" }}>N</span>
  );
}

const STEG = [
  { tittel: "Opprett Internal Integration", tekst: "Gå til notion.so/my-integrations og lag en ny Internal Integration med lese- og skrivetilgang til innhold." },
  { tittel: "Sett tokenet i Vercel", tekst: "Lim inn tokenet som NOTION_INTERNAL_TOKEN under Environment Variables i Vercel, og deploy på nytt." },
  { tittel: "Del Tasks med integrasjonen", tekst: "Åpne Tasks i Notion, velg Connections og legg til integrasjonen. Last siden på nytt." },
];

export function NotionTilkobling({ data }: { data: NotionTilkoblingData }) {
  const totalSider = data.databaser.reduce((sum, d) => sum + d.pagesCount, 0);

  return (
    <>
      {data.feilmelding && <Varsel tone="advarsel" tittel="Feil ved tilkobling">{data.feilmelding}</Varsel>}

      {data.tilstand === "connected" ? (
        <>
          <section className="kort" aria-label="Tilkoblingen">
            <div className="liste" style={{ border: 0 }}>
              <div style={{ padding: 0 }}>
                <NotionMerke />
                <span>
                  <b>{data.workspaceName}</b>
                  <span className="kilde">
                    {data.tilkobletSiden ? `Koblet ${DATO.format(data.tilkobletSiden)}` : "Koblet"} ·{" "}
                    {data.sistSynket ? `sist synket ${siden(data.sistSynket)}` : "ikke synket ennå"} · {totalSider} sider
                  </span>
                </span>
                <Pille tone="ok">Koblet</Pille>
              </div>
            </div>
          </section>

          <Seksjon tittel="Databaser" kilde={String(data.databaser.length)}>
            {data.databaser.length === 0 ? (
              <Tom tittel="Ingen databaser koblet ennå" tekst="Databasene legges inn manuelt til koblingen kan velges her." />
            ) : (
              <div className="liste">
                {data.databaser.map((db) => (
                  <div key={db.id}>
                    <NotionMerke />
                    <span>
                      <b>{db.navn}</b>
                      <span className="kilde">
                        {db.pagesCount} sider · {db.type} · {db.lastSyncAt ? `synket ${siden(db.lastSyncAt)}` : "aldri synket"}
                      </span>
                    </span>
                    <Pille tone={db.syncMode === "AUTO" ? "ok" : "vent"}>{db.syncMode === "AUTO" ? "I bruk" : db.syncMode}</Pille>
                  </div>
                ))}
              </div>
            )}
            <p className="kilde">Synkes hvert 15. minutt.</p>
          </Seksjon>

          <form action="/api/notion/sync" method="post" className="knapper">
            <button type="submit" className="knapp sek">Synk nå</button>
          </form>
        </>
      ) : !data.isAdmin ? (
        <Tom tittel="Bare head coach kan koble til Notion" tekst="Snakk med Anders hvis en database skal synkes til AgencyOS." />
      ) : data.harInternalToken ? (
        <Tom tittel="Kobler til Notion" tekst="Tilkoblingen opprettes nå. Last siden på nytt om noen sekunder." />
      ) : (
        <>
          <Tom
            tittel="Notion er ikke koblet"
            tekst="AgencyOS bruker en Notion Internal Integration. Tokenet ligger i Vercel, så det trengs ingen innlogging her."
            handling={<a className="knapp pri" href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer">Åpne Notion-integrasjoner</a>}
          />
          <Seksjon tittel="Slik setter du opp">
            <ol className="liste" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {STEG.map((s, i) => (
                <li key={s.tittel}>
                  <span className="ikonboks mono" aria-hidden>{i + 1}</span>
                  <span><b>{s.tittel}</b><span className="kilde">{s.tekst}</span></span>
                  <span />
                </li>
              ))}
            </ol>
            <p className="kilde">Tokenet krypteres i databasen og når bare sidene du deler med integrasjonen.</p>
          </Seksjon>
        </>
      )}
    </>
  );
}
