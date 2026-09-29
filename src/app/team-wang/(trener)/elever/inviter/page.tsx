import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { KortHode, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangKnapp, WangKort, WangSide, WangSidehode } from "@/components/wang/trener/wang-ui";

/**
 * WANG-20 Inviter elev. Rute: /team-wang/elever/inviter. Tegning: «WANG Golf Batch 7.dc.html» #inviter.
 * Det finnes ingen invitasjonsmodell for elever (bare `ParentInvitation` for
 * foresatte). Skjemaet vises låst, og lista over sendte invitasjoner er tom
 * til modellen finnes (se rapporten). Ingen e-post sendes herfra.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inviter elev — WANG Golf", robots: { index: false, follow: false } };

export default async function WangInviterSide() {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const avsender = `${bruker.name?.trim() || bruker.email} · ${bruker.email}`;
  return (
    <WangSide>
      <WangSidehode skjermId="WANG-20" undertittel={gruppe.name} tittel="Inviter elev" />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.split}>
        <WangKort>
          <form className={s.skjemaKort} aria-describedby="wang20-ikke-koblet">
            <div>
              <h2 className={s.h2}>Send invitasjon</h2>
              <p className={s.fot} style={{ margin: "4px 0 0", fontSize: 15 }}>Eleven oppretter kontoen selv i PlayerHQ.</p>
            </div>
            <label className={s.etikett}>
              Gruppe
              <select className={s.felt} disabled defaultValue={gruppe.id}>
                <option value={gruppe.id}>{gruppe.name}</option>
              </select>
            </label>
            <label className={s.etikett}>
              Elevens navn
              <input className={s.felt} disabled autoComplete="off" />
            </label>
            <label className={s.etikett}>
              E-post eller mobil
              <input className={s.felt} disabled autoComplete="off" placeholder="navn@epost.no eller 912 34 567" />
            </label>
            <div style={{ display: "grid", gap: 4 }}>
              <span className={s.metaTekst} style={{ color: "var(--wtr-blue)" }}>Avsender</span>
              <span className={s.tall} style={{ fontSize: 14 }}>{avsender}</span>
            </div>
            <p id="wang20-ikke-koblet" className={s.fot} style={{ fontSize: 14 }}>
              Invitasjon til elev kan ikke sendes herfra ennå. Elever legges i gruppa fra AgencyOS til invitasjonen er på plass.
            </p>
            <div className={s.knapperHoyre}>
              <WangKnapp variant="primar" disabled>Send invitasjon</WangKnapp>
            </div>
          </form>
        </WangKort>
        <WangKort>
          <KortHode tittel="Sendte invitasjoner" />
          <p className={s.tomLinje} style={{ color: "var(--wtr-text-muted)" }}>Ingen invitasjoner sendt.</p>
        </WangKort>
      </div>
    </WangSide>
  );
}
