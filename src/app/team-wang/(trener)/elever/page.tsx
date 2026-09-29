import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import {
  hentForrigeUkeEtterlevelse,
  hentGruppeElever,
  hentSnittForElever,
} from "@/app/team-wang/_data/wang-elever-data";
import { norskTall } from "@/app/team-wang/_data/wang-elever-regler";
import { meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import {
  WangChips,
  WangDemoMerknad,
  WangFeil,
  WangKort,
  WangLenke,
  WangSide,
  WangSidehode,
  WangTabell,
  WangTom,
} from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

/** WANG-07 Elever. Rute: /team-wang/elever. Tegning: «WANG Golf Elevprofil.dc.html» #elever. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Elever — WANG Golf", robots: { index: false, follow: false } };

export default async function WangEleverSide({ searchParams }: { searchParams: Promise<{ klasse?: string | string[] }> }) {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const sp = await searchParams;
  const valgtKlasse = (Array.isArray(sp.klasse) ? sp.klasse[0] : sp.klasse) ?? "Alle";
  const na = new Date();
  const trenerNavn = bruker.name?.trim() || bruker.email;

  const hode = (
    <WangSidehode skjermId="WANG-07" undertittel={trenerNavn} tittel="Elever" ingress="Alt hentes fra elevens PlayerHQ. Ingenting føres to ganger." />
  );

  let data;
  try {
    const elever = await hentGruppeElever(gruppe.id, na);
    const ider = elever.map((e) => e.id);
    const [snitt, uke] = await Promise.all([hentSnittForElever(ider, na), hentForrigeUkeEtterlevelse(ider, na)]);
    data = { elever, snitt, uke };
  } catch {
    return (
      <WangSide>
        {hode}
        <WangFeil tekst="Ingenting er borte. Det eleven har ført ligger i PlayerHQ. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  const { elever, snitt, uke } = data;
  const klasser = [...new Set(elever.map((e) => e.klasse).filter((k): k is string => !!k))].sort((a, b) => a.localeCompare(b, "nb"));
  const liste = valgtKlasse === "Alle" ? elever : elever.filter((e) => e.klasse === valgtKlasse);
  const base = wangHref("WANG-07");

  return (
    <WangSide>
      {hode}
      {erDemo ? <WangDemoMerknad /> : null}

      {elever.length === 0 ? (
        <WangKort>
          <WangTom
            tittel="Ingen elever i gruppa ennå."
            tekst={`Elevene vises her når de står som aktive spillere i ${gruppe.name}.`}
            handling={<WangLenke href={wangHref("WANG-20")}>Inviter elev</WangLenke>}
          />
        </WangKort>
      ) : (
        <>
          {klasser.length > 0 ? (
            <WangChips
              etikett="Klasse"
              valg={["Alle", ...klasser].map((k) => ({
                etikett: k,
                href: k === "Alle" ? base : `${base}?klasse=${encodeURIComponent(k)}`,
                aktiv: k === valgtKlasse,
              }))}
            />
          ) : null}
          <WangKort tittel={`${liste.length} ${liste.length === 1 ? "elev" : "elever"} i ${valgtKlasse === "Alle" ? gruppe.name : valgtKlasse}`} meta="Aktive spillere i gruppa">
            {liste.length === 0 ? (
              <p className={s.tomLinje}>Ingen elever i {valgtKlasse}.</p>
            ) : (
              <WangTabell
                beskrivelse="Elever"
                kolonner={[
                  { key: "elev", etikett: "Elev", bredde: "minmax(0,1.5fr)", helBredde: true },
                  { key: "kat", etikett: "Kategori og snitt", tall: true },
                  { key: "uke", etikett: `Uke ${uke.uke.uke}`, bredde: "minmax(0,1.3fr)", tall: true },
                  { key: "apne", etikett: "", bredde: "auto" },
                ]}
                rader={liste.map((e) => {
                  const sn = snitt.get(e.id);
                  const et = uke.perElev.get(e.id);
                  const meta = [e.klasse, e.alder !== null ? `${e.alder} år` : null, e.klubb].filter(Boolean).join(" · ");
                  return {
                    id: e.id,
                    celler: {
                      elev: (
                        <span className={s.kolonne}>
                          <span className={s.radTittel}>{e.navn}</span>
                          <span className={s.radMetaLiten}>{meta || "—"}</span>
                        </span>
                      ),
                      kat: sn?.snitt != null ? `Kategori ${sn.kategori} · snitt ${norskTall(sn.snitt, 1)}` : "—",
                      uke: et?.prosent != null ? `${et.prosent} % av planlagt tid` : "—",
                      apne: <WangLenke href={elevprofilHref(e.id)} ariaLabel={`Åpne profilen til ${e.navn}`}>Åpne</WangLenke>,
                    },
                  };
                })}
              />
            )}
          </WangKort>
        </>
      )}

      <p className={s.fot}>
        Listen viser aktive spillere i {gruppe.name}. Kategori regnes fra snittscore på 18-hullsrunder de siste tolv månedene. Planlagt tid kommer fra elevens plan i PlayerHQ, og bare økter som er over teller.
      </p>
    </WangSide>
  );
}
