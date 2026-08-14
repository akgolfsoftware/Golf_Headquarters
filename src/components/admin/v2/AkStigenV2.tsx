"use client";

/**
 * AgencyOS · AK-stigen — junior-stigen Mini → Elite, lagt over de faktiske
 * gruppene i basen. Paper-fasit: fase1/agencyos-ak-stigen.html.
 *
 * Tre faner (Stigen/Grupper/Rydding), som fasiten. Data kommer ferdig
 * strukturert fra lastAkStigenData() (src/lib/agencyos/ak-stigen-data.ts) —
 * ingen tall regnes ut eller antas her.
 */

import { useState } from "react";
import Link from "next/link";
import { T, Caps, Kort, Rad, StatusPill, Icon, PillVelger, TomTilstand } from "@/components/v2";
import type { AkStigenData } from "@/lib/agencyos/ak-stigen-data";

function Merknad({ children, dempet }: { children: React.ReactNode; dempet?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: T.panel2, border: `1px solid ${dempet ? T.border : T.down}`, borderRadius: 12 }}>
      <Icon name="alert-triangle" size={14} style={{ color: dempet ? T.mut : T.down, flex: "none", marginTop: 2 }} />
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

export function AkStigenV2({ data }: { data: AkStigenData }) {
  const { trinn, grupper, overStigen, rester, ukartlagt } = data;
  const [fane, setFane] = useState<"stigen" | "grupper" | "rydding">("stigen");

  const utenGruppe = trinn.filter((t) => !t.gruppeNavn);
  const tommeGrupper = trinn.filter((t) => t.gruppeNavn && (grupper[t.gruppeNavn]?.medlemmer ?? 0) === 0 && grupper[t.gruppeNavn]);
  const totaltISpillere =
    Object.values(grupper).reduce((n, g) => n + g.medlemmer, 0) + (overStigen?.medlemmer ?? 0);

  return (
    <div
      data-paper-agencyos-ak-stigen
      data-paper-wave-f="ak-stigen"
      data-od-id="agencyos-ak-stigen" data-paper-slug="agencyos-ak-stigen"
      style={{ display: "flex", flexDirection: "column", gap: T.gap, width: "100%", maxWidth: 1080 }}
    >
      <div>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>AK-stigen</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {trinn.length} trinn · {totaltISpillere} spillere i gruppene
        </span>
      </div>

      <PillVelger
        options={[
          { v: "stigen", l: "Stigen" },
          { v: "grupper", l: "Grupper" },
          { v: "rydding", l: rester.length > 0 ? `Rydding (${rester.length})` : "Rydding" },
        ]}
        value={fane}
        onChange={(v) => setFane(v as typeof fane)}
      />

      {fane === "stigen" && (
        <>
          {tommeGrupper.length > 0 && (
            <Kort
              pad="16px 18px"
              style={{
                border: `1px solid color-mix(in srgb, ${T.handling} 35%, ${T.border})`,
                borderLeft: `3px solid ${T.handling}`,
                background: `color-mix(in srgb, ${T.handling} 6%, ${T.panel})`,
              }}
            >
              <Caps size={9} color={T.handling}>Én ting nå</Caps>
              <div style={{ marginTop: 8, fontFamily: T.disp, fontSize: 18, fontWeight: 600, color: T.fg }}>
                {tommeGrupper.length} juniorgrupper har null medlemmer
              </div>
              <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                Alle har fast timeplan i basen. Treningene står altså i kalenderen uten at noen er meldt på. Enten
                mangler påmeldingene, eller så er de registrert et annet sted enn i gruppene.
              </p>
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setFane("grupper")}
                  className="v2-press v2-focus"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8, minHeight: 56, padding: "10px 16px",
                    borderRadius: 12, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 14,
                    fontWeight: 600, border: 0, cursor: "pointer",
                  }}
                >
                  Se gruppene
                </button>
              </div>
            </Kort>
          )}

          <Kort eyebrow="AK-stigen">
            <p style={{ margin: "0 0 12px", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
              Fem trinn fra CANON, lagt over gruppene i basen. Stiplet kant betyr gruppe uten medlemmer. Rød kant
              betyr trinn uten gruppe i det hele tatt.
            </p>
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: 8 }}>
              {trinn.map((t) => {
                const g = t.gruppeNavn ? grupper[t.gruppeNavn] : undefined;
                const mangler = !t.gruppeNavn;
                const tom = g && g.medlemmer === 0;
                return (
                  <div
                    key={t.navn}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
                      background: T.panel, border: `1px solid ${mangler ? T.down : T.border}`,
                      borderStyle: tom ? "dashed" : "solid", borderRadius: 12,
                    }}
                  >
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, flex: "none", minWidth: 22, paddingTop: 2 }}>{t.kode}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.fg }}>{t.navn}</span>
                      <span style={{ display: "block", fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 2 }}>
                        {t.alder} · {t.gruppeNavn || "ingen gruppe i basen"}
                      </span>
                      {g && g.tider.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {g.tider.map((tid) => (
                            <span key={tid} style={{ fontFamily: T.mono, fontSize: 10.5, padding: "3px 8px", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, color: T.mut }}>
                              {tid}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 600, color: g ? T.fg : T.mut }}>{g ? g.medlemmer : "—"}</span>
                      <StatusPill tone={mangler ? "warn" : tom ? "warn" : "up"}>{g ? "spillere" : "mangler"}</StatusPill>
                    </div>
                  </div>
                );
              })}
            </div>
          </Kort>

          {overStigen && (
            <Kort eyebrow="Over stigen">
              <p style={{ margin: "0 0 10px", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
                WANG Toppidrett er ikke et trinn i AK-stigen. Det er neste steg etter Elite, på en annen kontrakt.
              </p>
              <Rad
                title={overStigen.navn}
                sub={[overStigen.level, overStigen.coachNavn, `${overStigen.tider.length ? "fast timeplan" : "ingen fast timeplan registrert"}`].filter(Boolean).join(" · ")}
                meta={<span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: T.fg }}>{overStigen.medlemmer} spillere</span>}
                last
              />
            </Kort>
          )}

          {utenGruppe.length > 0 && (
            <Merknad>
              {utenGruppe.map((t) => t.navn).join(", ")} finnes i AK-stigen, men har ingen gruppe i basen. Enten skal
              trinnet ha en gruppe, eller så skal det ut av stigen — det er en beslutning, ikke et hull som fyller
              seg selv.
            </Merknad>
          )}

          {ukartlagt.length > 0 && (
            <Merknad>
              {ukartlagt.map((g) => `«${g.navn}» (${g.medlemmer} spillere)`).join(", ")}{" "}
              {ukartlagt.length === 1 ? "er en gruppe" : "er grupper"} med reelle medlemmer som ikke er koblet til
              noe trinn i stigen. Sjekk om dette er de samme spillerne som en av juniorgruppene over, eller en helt
              annen gruppe.
            </Merknad>
          )}
        </>
      )}

      {fane === "grupper" && (
        <>
          <Kort eyebrow="Juniorgrupper">
            {trinn.filter((t) => t.gruppeNavn && grupper[t.gruppeNavn]).length === 0 ? (
              <TomTilstand icon="users" title="Ingen juniorgrupper i basen" sub="De fire kanoniske GFGK-juniorgruppene finnes ikke i basen ennå." />
            ) : (
              trinn
                .filter((t) => t.gruppeNavn && grupper[t.gruppeNavn])
                .map((t, i, arr) => {
                  const g = grupper[t.gruppeNavn];
                  return (
                    <Rad
                      key={t.navn}
                      leading={<span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.mut, minWidth: 26, flex: "none" }}>{g.level ?? "—"}</span>}
                      title={t.gruppeNavn}
                      sub={[g.coachNavn, ...g.tider].filter(Boolean).join(" · ")}
                      meta={
                        <StatusPill tone={g.medlemmer > 0 ? "up" : "down"}>
                          {g.medlemmer > 0 ? `${g.medlemmer} spillere` : "tom"}
                        </StatusPill>
                      }
                      last={i === arr.length - 1}
                    />
                  );
                })
            )}
          </Kort>
          <Merknad dempet>
            Timeplanene er hentet direkte fra gruppenes ukentlige oppføringer i basen — ingen tall er antatt.
          </Merknad>
        </>
      )}

      {fane === "rydding" && (
        <>
          <Kort eyebrow="Grupper som bør ryddes">
            <p style={{ margin: "0 0 10px", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
              {rester.length === 0
                ? "Ingen grupper uten medlemmer og uten timeplan akkurat nå."
                : `${rester.length} ${rester.length === 1 ? "gruppe" : "grupper"} i basen har verken medlemmer eller timeplan. De kan velges ved en feil i nedtrekkslister.`}
            </p>
            {rester.length > 0 &&
              rester.map((r, i) => (
                <Rad
                  key={r.id}
                  leading={<span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.mut, minWidth: 26, flex: "none" }}>{r.level ?? "—"}</span>}
                  title={r.navn}
                  sub={`0 medlemmer · 0 timeplanoppføringer${r.maks ? ` · maks ${r.maks}` : ""}`}
                  meta={<StatusPill tone="down">rest</StatusPill>}
                  last={i === rester.length - 1}
                />
              ))}
          </Kort>
          {rester.length > 0 && (
            <Merknad dempet>
              Slettes ikke herfra. En gruppe kan ha historikk som ikke vises i medlemstallet — økter, notater,
              planer. Sjekk det i Spillere/Grupper først, så tas slettingen som egen operasjon.
            </Merknad>
          )}
        </>
      )}

      {fane === "stigen" && tommeGrupper.length === 0 && utenGruppe.length === 0 && (
        <Link
          href="/admin/spillere?filter=junior"
          className="v2-press v2-focus"
          style={{
            textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: 56, borderRadius: 12, background: T.handling, color: T.onHandling,
            fontFamily: T.ui, fontSize: 14, fontWeight: 600,
          }}
          data-paper-en-ting="true"
        >
          Åpne i Spillere
        </Link>
      )}
    </div>
  );
}
