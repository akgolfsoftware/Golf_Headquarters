"use client";

/**
 * AG-20 Økonomi i nytt design (designbrevet 13.10.2026) — /admin/agencyos/okonomi.
 * Fasit: docs/design-system/utkast-agencyos/mer.html, skjerm «AG-20 Økonomi».
 * Bare for head coach (ADMIN): beslutninger.md §ØKONOMI BARE FOR HEAD COACH (28.09).
 * Assistant coach sendes til Cockpit av siden (AG-20-ASS), låst av okonomi-tilgang.test.ts.
 *
 * Data uendret fra src/lib/admin/okonomi-data.ts (hentOkonomiFlate). Kroner leses
 * fra Tripletex og Stripe, aldri anslått. Mangler tallet, står «—».
 *
 * Avvik:
 *   - Fordelingen på de fem tjenestene (beslutninger.md §SLETTEDIALOG … 28.09) har
 *     ingen kilde ennå (data.hull.budsjettkilde). Radene står, med «—».
 *   - Månedsvalget (September · Hittil i år) er ikke bygget: loaderen leser bare hittil i år.
 *   - Opplasting av Tripletex-eksport og endring av budsjett har ingen handling i appen.
 */
import { ExternalLink, FileSpreadsheet, CreditCard, LineChart } from "lucide-react";
import { Feil, Knapp, Laster, Pille, Seksjon, Tom, Topp, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import type { AdminOkonomiV2Data } from "@/lib/admin/okonomi-data";
import { erForfalt, fmtKrNb, klippPrikker, ytdAvvik, ytdAvvikTekst } from "@/lib/admin/okonomi-visning";
import "@/styles/agencyos-ny-mer.css";

export type AG20Tilstand = "data" | "tom" | "laster" | "feil";
export type AG20Props = { tilstand: AG20Tilstand; data: AdminOkonomiV2Data };

/** AK Golfs fem tjenester (Anders 28.09.2026). */
export const OKONOMI_TJENESTER = ["Coaching privat", "Grupper", "GFGK-avtalen", "Gruppetimer", "Andre tjenester fra AK Golf"] as const;

const kr = (v: number | null) => (v == null ? "—" : fmtKrNb(v).replace(/\s*kr$/i, ""));

export function AG20Okonomi({ tilstand, data }: AG20Props) {
  const topp = <Topp dato="Mer · bare head coach" tittel="Økonomi" ingress="Kroner leses fra Tripletex og Stripe. Ingenting anslås." />;
  if (tilstand === "laster") return <div className="agn-s">{topp}<Laster tekst="Leser Tripletex-eksporten …" /></div>;
  if (tilstand === "feil") return <div className="agn-s">{topp}<Feil tittel="Tripletex-eksporten kunne ikke leses" tekst="Ingen tall er endret. Prøv igjen." kode="TRIPLETEX" /></div>;
  if (tilstand === "tom") return <div className="agn-s">{topp}<Tom tittel="Ingen tall ennå" tekst="Økonomitallene hentes fra Tripletex og budsjettet. Tall anslås aldri." /></div>;

  const avvik = ytdAvvik(data.ytd.budsjettKr, data.ytd.resultatKr);
  return <div className="agn-s">
    {topp}
    {!data.tripletexKonfigurert && <Varsel tone="advarsel" tittel="Tripletex er ikke koblet">Regnskapstallet mangler til integrasjonen er satt opp.</Varsel>}
    <div className="to-del bred-v">
      <div>
        <section className="kort" aria-label={`Hittil i ${data.aar}`}>
          <div className="hoved"><strong>{kr(data.ytd.resultatKr)}</strong><span className="forklar">kr i regnskap hittil i {data.aar} · budsjett {kr(data.ytd.budsjettKr)} kr</span></div>
          <p className="kilde">Avvik mot budsjett: {ytdAvvikTekst(avvik)}</p>
          <div>
            <div className="oko-rad hode"><span>Tjeneste</span><span style={{ textAlign: "right" }}>Regnskap</span><span style={{ textAlign: "right" }}>Budsjett</span></div>
            {OKONOMI_TJENESTER.map((t) => <div key={t} className="oko-rad"><span>{t}</span><span className="v">—</span><span className="v">—</span></div>)}
          </div>
          <p className="kilde">Fordelingen per tjeneste vises når budsjettet og Tripletex-eksporten har den. Til da står «—».</p>
        </section>
        <Seksjon tittel="Betalinger fra Stripe">
          {data.fakturaer.length === 0 ? <p className="forklar">Ingen betalinger å vise.</p> : <div className="kort rader">
            {data.fakturaer.map((f) => {
              const tone: PilleTone = erForfalt(f.status) ? "feil" : f.status === "Betalt" ? "ok" : "noy";
              return <div key={f.id} className="mer-rad">
                <span className="mono kilde">{f.dato}</span>
                <span><b>{f.navn}</b><span className="kilde">{f.beskrivelse ?? "—"}</span></span>
                <span className="hoyre"><span className="mono">{fmtKrNb(f.belopKr)}</span><Pille tone={tone}>{f.status}</Pille></span>
              </div>;
            })}
          </div>}
        </Seksjon>
      </div>
      <div>
        <Seksjon tittel="Kilder">
          <div className="kilde-rad"><span className="ikonboks"><FileSpreadsheet className="ikon" aria-hidden /></span><span><b>Tripletex-eksport</b><span className="kilde">Regnskap hittil i år</span></span><Pille tone={data.tripletexKonfigurert ? "ok" : "noy"}>{data.tripletexKonfigurert ? "Koblet" : "Ikke koblet"}</Pille></div>
          <div className="kilde-rad"><span className="ikonboks"><CreditCard className="ikon" aria-hidden /></span><span><b>Stripe</b><span className="kilde">Betalinger og forfalte</span></span><Knapp variant="sek" onClick={() => window.open(data.stripeHref, "_blank", "noopener,noreferrer")}><ExternalLink className="ikon" aria-hidden />Åpne</Knapp></div>
          <div className="kilde-rad"><span className="ikonboks"><LineChart className="ikon" aria-hidden /></span><span><b>Budsjett {data.aar}</b><span className="kilde">{data.ytd.budsjettKr == null ? "Ikke lagt inn" : "Lagt inn"}</span></span><Pille tone={data.ytd.budsjettKr == null ? "noy" : "ok"}>{data.ytd.budsjettKr == null ? "Mangler" : "Finnes"}</Pille></div>
        </Seksjon>
        <Seksjon tittel="Timeklipp" kilde="Coaching-pakkene, ikke app-nivå">
          {data.timeklipp.length === 0 ? <p className="forklar">Ingen klipp registrert.</p> : <div className="kort rader">
            {data.timeklipp.map((k) => <div key={k.id} className="mer-rad">
              <span className="klipp" aria-hidden>{klippPrikker(k.brukt, k.totalt).map((f, i) => <i key={i} className={f ? "fylt" : undefined} />)}</span>
              <span><b>{k.navn}</b></span>
              <span className="mono kilde">{k.brukt} av {k.totalt}</span>
            </div>)}
          </div>}
        </Seksjon>
        <p className="kilde">Alle beløp eks. mva. Forfalt leses fra Stripe.</p>
      </div>
    </div>
  </div>;
}
