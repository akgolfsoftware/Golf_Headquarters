import type { Metadata } from "next";
import { Archive, Eye } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElever } from "@/app/team-wang/_data/wang-elever-data";
import { Laas, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangFeil, WangKnapp, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-14 Post til elev. Rute: /team-wang/meldinger/post. Tegning: «WANG Golf Batch 5.dc.html» #post.
 * Elevlista er ekte. Trådene har ingen WANG-modell ennå, så innboksen er tom og
 * sendeskjemaet er låst (se rapporten).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post fra elever — WANG Golf", robots: { index: false, follow: false } };

export default async function WangPostSide() {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const trenerNavn = bruker.name?.trim() || bruker.email;
  const hode = (
    <WangSidehode
      skjermId="WANG-14"
      undertittel={`${gruppe.name} · ${trenerNavn}`}
      tittel="Post fra elever"
      handling={<Laas ikon={Eye}>Foresatt ser samtaler med elever · kan ikke slås av</Laas>}
    />
  );

  let elever;
  try {
    elever = await hentGruppeElever(gruppe.id, new Date());
  } catch {
    return (
      <WangSide>
        {hode}
        <WangFeil tekst="Fikk ikke hentet elevene. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  return (
    <WangSide>
      {hode}
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.inbox}>
        <WangKort>
          <div style={{ padding: "16px 20px 12px", display: "grid", gap: 12 }}>
            <div className={s.segmenter} role="group" aria-label="Antall poster">
              <span className={`${s.seg} ${s.segAktiv}`}>Ubesvart <span className={s.tall} style={{ color: "inherit", opacity: 0.8 }}>0</span></span>
              <span className={s.seg}>Alle <span className={s.tall} style={{ color: "inherit", opacity: 0.8 }}>0</span></span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
              <label className={s.etikett} style={{ flex: 1, minWidth: 160, fontSize: 12.5 }}>
                Ny post til elev
                <select className={s.felt} disabled defaultValue="">
                  <option value="">{elever.length ? "Velg elev" : "Ingen elever i gruppa"}</option>
                  {elever.map((e) => <option key={e.id} value={e.id}>{e.navn}</option>)}
                </select>
              </label>
              <WangKnapp disabled>Åpne</WangKnapp>
            </div>
          </div>
          <p className={s.tomLinje} style={{ color: "var(--wtr-text-muted)" }}>Ingen ubesvarte poster.</p>
        </WangKort>
        <WangKort>
          <WangTom
            tittel="Post til elev er ikke tatt i bruk ennå."
            tekst="Tråder mellom trener og elev kan ikke lagres her ennå. Når de er på plass, ser foresatte samtalen, og meldinger kan ikke slettes."
          />
          <div style={{ borderTop: "1px solid var(--wtr-border-subtle)", padding: "12px 20px 16px", background: "var(--wtr-blue-tint)" }}>
            <p className={s.merknad}>
              <Archive size={14} strokeWidth={1.5} aria-hidden="true" />
              Meldinger lagres og kan ikke slettes.
            </p>
          </div>
        </WangKort>
      </div>
    </WangSide>
  );
}
