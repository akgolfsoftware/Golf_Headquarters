import Link from "next/link";
import { Lock } from "lucide-react";

import { WangChips, WangTag, WangTom } from "@/components/wang/trener/wang-ui";
import { tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";
import { enhetFraRegel, tallTekst } from "@/lib/wang/tester-konkurranse/format";
import { protokollHref } from "@/lib/wang/tester-konkurranse/lenker";
import type { ProtokollRad, TestDefinisjonInfo } from "@/lib/wang/tester-konkurranse/tester";

import { TkStatus } from "./tk-ui";
import s from "./tk.module.css";

export type ProtokollFilter = "alle" | "NGF" | "Fysisk";

export function lesProtokollFilter(v: string | undefined): ProtokollFilter {
  return v === "NGF" || v === "Fysisk" ? v : "alle";
}

/**
 * WANG-22 Testprotokoller: liste til venstre, valgt protokoll til høyre.
 * Tegning: «WANG Golf Batch 8.dc.html» #protokoll. NGF-protokollene er låst
 * versjon v3 fra Team Norway-arket; fysiske tester er WANGs egne.
 * Å lage ny protokoll eller ny versjon har ingen datamodell ennå.
 */
export function ProtokollVisning({ rader, filter, filterHref, valgt, fysDef, bruk }: {
  rader: ProtokollRad[];
  filter: ProtokollFilter;
  filterHref: (f: ProtokollFilter) => string;
  valgt: ProtokollRad | null;
  fysDef: TestDefinisjonInfo | null;
  bruk: Map<string, number>;
}) {
  const synlige = filter === "alle" ? rader : rader.filter((r) => r.kategori === filter);
  return (
    <div className={s.splitProt}>
      <section className={s.kort}>
        <div style={{ padding: "14px 20px" }}>
          <WangChips
            etikett="Filter"
            valg={(["alle", "NGF", "Fysisk"] as const).map((f) => ({ href: filterHref(f), etikett: f === "alle" ? "Alle" : f === "NGF" ? "NGF / Team Norway" : "Fysiske", aktiv: filter === f, antall: f === "alle" ? rader.length : rader.filter((r) => r.kategori === f).length }))}
          />
        </div>
        {synlige.map((p) => (
          <Link key={p.id} href={protokollHref(p.id)} className={s.prow} aria-current={valgt?.id === p.id ? "page" : undefined}>
            <span className={s.prowTopp}>
              <span style={{ minWidth: 0, fontFamily: "var(--wtr-font-display)", fontSize: 15, fontWeight: 500, color: "var(--wtr-blue)" }}>{p.navn}</span>
              <TkStatus status={p.status} />
            </span>
            <span className={s.meta}>{p.forsok !== null ? `${p.forsok} forsøk · ` : ""}{p.kilde}</span>
            <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 12.5, fontWeight: 500, color: "var(--wtr-blue)" }}>
              {p.eier}{bruk.get(p.id) ? ` · ${bruk.get(p.id)} resultater i gruppa` : ""}
            </span>
          </Link>
        ))}
        {synlige.length === 0 ? <p className={s.tomLinje}>Ingen protokoller i dette filteret.</p> : null}
      </section>

      {valgt ? <ProtokollDetalj p={valgt} fysDef={fysDef} bruk={bruk.get(valgt.id) ?? 0} /> : (
        <section className={s.kort}>
          <WangTom tittel="Velg en protokoll" tekst="Protokollen er kontrakten bak hvert testtall. Velg en i lista for å se øvelsene, enhetene og hva som teller." />
        </section>
      )}
    </div>
  );
}

function ProtokollDetalj({ p, fysDef, bruk }: { p: ProtokollRad; fysDef: TestDefinisjonInfo | null; bruk: number }) {
  const tn = p.kategori === "NGF" ? tnFromDefinitionId(p.id) : null;
  const felter = tn ? [...new Set(tn.rows.flatMap((r) => r.fields.map((f) => (f.unit ? `${f.label} (${f.unit})` : f.label))))] : [];
  const maal = tn ? tn.rows.map((r) => r.target).filter((t): t is number => typeof t === "number") : [];
  const maalTekst = maal.length ? `Mål: ${[...new Set(maal)].length === 1 ? `${tallTekst(maal[0])} m × ${maal.length}` : `${maal.map((m) => tallTekst(m)).join(", ")} m`}` : null;
  const enhet = tn ? (tn.points8Ball ? "poeng" : tn.kind === "putts" ? "slag" : tn.kind === "carry" || tn.kind === "course" || tn.kind === "near" || tn.kind === "free-course" ? "PEI" : "—") : (fysDef ? enhetFraRegel(fysDef.scoringRule) ?? "—" : "—");

  return (
    <section className={s.kort} id="wg-detalj">
      <div style={{ padding: 20, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <WangTag>{p.eier}</WangTag>
          <WangTag>{p.kategori === "NGF" ? "NGF-test" : "Fysisk test"}</WangTag>
          <TkStatus status={p.status}>{p.kategori === "NGF" ? `v3 · ${p.status}` : p.status}</TkStatus>
        </div>
        <h2 style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 300, fontSize: 28, letterSpacing: "var(--wtr-tracking-display)", color: "var(--wtr-blue)", lineHeight: 1.2 }}>{p.navn}</h2>
        <p className={s.meta} style={{ margin: 0 }}>{p.kategori === "NGF" ? `${p.versjon} · ${p.kilde}` : p.kilde}{bruk ? ` · ${bruk} resultater ført i gruppa` : " · ikke brukt i gruppa ennå"}</p>
        <p className={s.laastLinje}><Lock size={18} strokeWidth={1.5} aria-hidden="true" style={{ marginTop: 2, flex: "none" }} /><span>Låst · kan ikke endres. Tall som allerede er ført, beholder versjonen de ble ført under.</span></p>
      </div>
      <div role="table" aria-label={`Øvelser i ${p.navn}`}>
        <div role="row" className={`${s.orow} ${s.thead}`}>
          <span role="columnheader">Øvelse</span><span role="columnheader" className={s.helMobil}>Enhet</span><span role="columnheader" className={s.helMobil}>Forsøk</span><span role="columnheader" className={s.helMobil}>Teller</span>
        </div>
        <div role="row" className={s.orow}>
          <span role="cell" style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{p.navn}</span>
          <span role="cell" className={s.tall} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>{enhet}</span>
          <span role="cell" className={`${s.tall} ${s.helMobil}`} style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{p.forsok ?? (tn?.variableCount ? "Varierer" : "—")}</span>
          <span role="cell" className={s.helMobil} style={{ fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}>{p.uavklart ? "Utkast" : "Ja"}</span>
          {felter.length || maalTekst ? (
            <span role="cell" className={s.helRad}>{[felter.length ? `Registreres: ${felter.join("; ")}` : null, maalTekst].filter(Boolean).join(" · ")}</span>
          ) : null}
          {fysDef ? <span role="cell" className={s.helRad}>{fysDef.scoringRule}</span> : null}
          {p.uavklart ? (
            <span role="cell" className={s.helRad} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", color: "var(--wtr-blue)" }}>
              <span className={s.hvitTag} style={{ display: "inline-flex", alignItems: "center", minHeight: 22, padding: "0 8px", borderRadius: "var(--wtr-radius-pill)", fontFamily: "var(--wtr-font-display)", fontSize: 11.5, fontWeight: 500 }}>Uavklart i NGF-arket</span>
              <span style={{ minWidth: 0 }}>{p.uavklart} Resultatet vises som «—» til skalaen er avklart.</span>
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--wtr-border-subtle)" }}>
        <p style={{ margin: 0, padding: "14px 20px 6px", fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 500, color: "var(--wtr-blue)" }}>Versjoner</p>
        <div style={{ padding: "0 20px 16px", display: "grid", gridTemplateColumns: "48px minmax(0, 1fr)", gap: 10, alignItems: "center" }}>
          <span className={s.tall} style={{ fontSize: 14, fontWeight: 700, color: "var(--wtr-blue)" }}>{p.kategori === "NGF" ? "v3" : "—"}</span>
          <span className={s.meta} style={{ fontWeight: 400 }}>{p.kategori === "NGF" ? `${p.versjon} · gjeldende` : "Ingen versjonshistorikk lagret"}</span>
        </div>
      </div>
    </section>
  );
}
