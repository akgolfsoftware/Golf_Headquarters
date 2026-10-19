"use client";

/**
 * AG-16 Grupper › AK-stigen i nytt design — /admin/agencyos/ak-stigen.
 * Erstatter AkStigenV2 (Train-lock). Data fra lastAkStigenData(); ingen tall regnes her.
 * Fire trinn (Mini → Basis → Utvikling → Elite), gruppene ved siden av stigen
 * (WANG og Knøtt, beslutninger §AK-stigen 22.09) og grupper som bør ryddes.
 */
import { useState } from "react";
import { Knapp, KnappLenke, Pille, Seksjon, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import type { AkStigenData } from "@/lib/agencyos/ak-stigen-data";
import "@/styles/agencyos-ny-mer.css";

type Fane = "stigen" | "grupper" | "rydding";

export function AG16AkStigen({ data }: { data: AkStigenData }) {
  const { trinn, grupper, vedSidenAv, rester, ukartlagt } = data;
  const [fane, setFane] = useState<Fane>("stigen");

  const utenGruppe = trinn.filter((t) => !t.gruppeNavn);
  const tomme = trinn.filter((t) => t.gruppeNavn && grupper[t.gruppeNavn] && grupper[t.gruppeNavn]!.medlemmer === 0);
  const totalt = Object.values(grupper).reduce((n, g) => n + g.medlemmer, 0) + vedSidenAv.reduce((n, g) => n + g.medlemmer, 0);
  const medGruppe = trinn.filter((t) => t.gruppeNavn && grupper[t.gruppeNavn]);

  const faner: ReadonlyArray<[Fane, string]> = [["stigen", "Stigen"], ["grupper", "Grupper"], ["rydding", rester.length > 0 ? `Rydding · ${rester.length}` : "Rydding"]];

  return (
    <>
      <div className="teller-rad">
        <div className="teller"><span className="e">Trinn</span><b className="t">{trinn.length}</b></div>
        <div className="teller"><span className="e">Spillere i gruppene</span><b className="t">{totalt}</b></div>
        <div className={tomme.length > 0 ? "teller signal" : "teller"}><span className="e">Tomme grupper</span><b className="t">{tomme.length}</b></div>
      </div>

      <nav className="valg" aria-label="AK-stigen">
        {faner.map(([id, l]) => <button key={id} type="button" aria-pressed={fane === id} onClick={() => setFane(id)}>{l}</button>)}
      </nav>

      {fane === "stigen" && <>
        {tomme.length > 0 && (
          <Varsel tone="advarsel" tittel={`${tomme.length} ${tomme.length === 1 ? "juniorgruppe har" : "juniorgrupper har"} ingen medlemmer`}>
            Treningene står i kalenderen uten at noen er meldt på.
          </Varsel>
        )}
        {tomme.length > 0 && <div className="knapper"><Knapp variant="sek" onClick={() => setFane("grupper")}>Se gruppene</Knapp></div>}

        <Seksjon tittel="AK-stigen" kilde="Fire trinn, lagt over gruppene i basen">
          <div className="kort rader">
            {[...trinn].reverse().map((t) => {
              const g = t.gruppeNavn ? grupper[t.gruppeNavn] : undefined;
              const tom = !!g && g.medlemmer === 0;
              return (
                <div key={t.navn} className="mer-rad" style={{ opacity: tom ? 0.7 : 1 }}>
                  <span className="mono kilde">{t.kode}</span>
                  <span><b>{t.navn}</b><span className="kilde">{t.alder} · {t.gruppeNavn || "ingen gruppe i basen"}</span></span>
                  <span className="hoyre">
                    <b className="mono">{g ? g.medlemmer : "—"}</b>
                    {!g ? <Pille tone="vent">Mangler</Pille> : tom ? <Pille tone="vent">Tom</Pille> : <span className="kilde">spillere</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </Seksjon>

        {vedSidenAv.length > 0 && (
          <Seksjon tittel="Ved siden av stigen">
            <p className="forklar">Grupper uten eget trinn. WANG Toppidrett er neste steg etter Elite, og Knøtt er en aldersgruppe med egen gruppe, ikke et trinn.</p>
            <div className="kort rader">
              {vedSidenAv.map((g) => (
                <div key={g.id} className="mer-rad">
                  <span aria-hidden />
                  <span><b>{g.navn}</b><span className="kilde">{[g.level, g.coachNavn].filter(Boolean).join(" · ") || "—"}</span></span>
                  <span className="hoyre mono">{g.medlemmer} spillere</span>
                </div>
              ))}
            </div>
          </Seksjon>
        )}

        {utenGruppe.length > 0 && <Varsel tone="advarsel">{utenGruppe.map((t) => t.navn).join(", ")} finnes i AK-stigen, men har ingen gruppe i basen.</Varsel>}
        {ukartlagt.length > 0 && <Varsel tone="advarsel">{ukartlagt.map((g) => `«${g.navn}» (${g.medlemmer} spillere)`).join(", ")} er ikke koblet til noe trinn i stigen.</Varsel>}
        {tomme.length === 0 && utenGruppe.length === 0 && <div className="knapper"><KnappLenke href="/admin/spillere?filter=junior">Åpne juniorene i Stall</KnappLenke></div>}
      </>}

      {fane === "grupper" && (
        <Seksjon tittel="Juniorgrupper">
          {medGruppe.length === 0 ? <Tom tittel="Ingen juniorgrupper i basen" tekst="GFGK-juniorgruppene finnes ikke i basen ennå." /> : (
            <div className="kort rader">
              {medGruppe.map((t) => {
                const g = grupper[t.gruppeNavn]!;
                return (
                  <div key={t.navn} className="mer-rad">
                    <span className="mono kilde">{t.kode}</span>
                    <span><b>{t.gruppeNavn}</b><span className="kilde">{[g.coachNavn, ...g.tider].filter(Boolean).join(" · ") || "—"}</span></span>
                    <span className="hoyre">{g.medlemmer > 0 ? <span className="mono">{g.medlemmer} spillere</span> : <Pille tone="vent">Tom</Pille>}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Seksjon>
      )}

      {fane === "rydding" && (
        <Seksjon tittel="Grupper som bør ryddes">
          {rester.length === 0 ? <Tom tittel="Ingenting å rydde" tekst="Ingen grupper står uten medlemmer og uten timeplan." /> : (
            <div className="kort rader">
              {rester.map((r) => (
                <div key={r.id} className="mer-rad">
                  <span aria-hidden />
                  <span><b>{r.navn}</b><span className="kilde">0 medlemmer · ingen timeplan</span></span>
                  <span className="hoyre kilde">{r.level ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </Seksjon>
      )}
    </>
  );
}
