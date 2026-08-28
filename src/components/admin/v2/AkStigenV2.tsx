"use client";

/**
 * AgencyOS · AK-stigen — T8 Train-lock.
 * Data fra lastAkStigenData() — ingen tall regnes her.
 */

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlBadge, TlKort, TlKnapp, TlRad, TlTittel, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import type { AkStigenData } from "@/lib/agencyos/ak-stigen-data";

function Merknad({ children, dempet }: { children: React.ReactNode; dempet?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 14px",
        background: TL.dock,
        boxShadow: `inset 0 0 0 1px ${dempet ? TL.hair : TL.danger}`,
        borderRadius: 12,
      }}
    >
      <Icon name="triangle-alert" size={14} style={{ color: dempet ? TL.mute : TL.danger, flex: "none", marginTop: 2 }} />
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

export function AkStigenV2({ data }: { data: AkStigenData }) {
  const { trinn, grupper, overStigen, rester, ukartlagt } = data;
  const [fane, setFane] = useState<"stigen" | "grupper" | "rydding">("stigen");

  const utenGruppe = trinn.filter((t) => !t.gruppeNavn);
  const tommeGrupper = trinn.filter(
    (t) => t.gruppeNavn && (grupper[t.gruppeNavn]?.medlemmer ?? 0) === 0 && grupper[t.gruppeNavn],
  );
  const totaltISpillere =
    Object.values(grupper).reduce((n, g) => n + g.medlemmer, 0) + (overStigen?.medlemmer ?? 0);

  const faner: { id: typeof fane; l: string }[] = [
    { id: "stigen", l: "Stigen" },
    { id: "grupper", l: "Grupper" },
    { id: "rydding", l: rester.length > 0 ? `Rydding (${rester.length})` : "Rydding" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 1080 }}>
      <TlTittel sub={`${trinn.length} trinn · ${totaltISpillere} spillere i gruppene`}>AK-stigen</TlTittel>

      <div role="tablist" aria-label="AK-stigen" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const on = fane === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={on}
              className="v2-press v2-focus"
              onClick={() => setFane(f.id)}
              style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: on ? TL.onFill : TL.mute,
                background: on ? TL.fill : "transparent",
                boxShadow: on ? "none" : `inset 0 0 0 1px ${TL.hair}`,
              }}
            >
              {f.l}
            </button>
          );
        })}
      </div>

      {fane === "stigen" && (
        <>
          {tommeGrupper.length > 0 && (
            <TlKort eyebrow="Én ting nå">
              <div style={{ fontSize: 18, fontWeight: 600, color: TL.text }}>
                {tommeGrupper.length} juniorgrupper har null medlemmer
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
                Treningene står i kalenderen uten at noen er meldt på.
              </p>
              <div style={{ marginTop: 14 }}>
                <TlKnapp variant="primaer" onClick={() => setFane("grupper")}>
                  Se gruppene
                </TlKnapp>
              </div>
            </TlKort>
          )}

          <TlKort eyebrow="AK-stigen">
            <p style={{ margin: "0 0 12px", fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
              Fem trinn fra CANON, lagt over gruppene i basen.
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
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 16px",
                      background: TL.elev,
                      boxShadow: `inset 0 0 0 1px ${mangler ? TL.danger : TL.hair}`,
                      borderRadius: 12,
                      opacity: tom ? 0.7 : 1,
                    }}
                  >
                    <span style={{ fontSize: 11, color: TL.mute, flex: "none", minWidth: 22, paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>
                      {t.kode}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: TL.text }}>{t.navn}</span>
                      <span style={{ display: "block", fontSize: 13, color: TL.mute, marginTop: 2 }}>
                        {t.alder} · {t.gruppeNavn || "ingen gruppe i basen"}
                      </span>
                    </div>
                    <div style={{ flex: "none", textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: g ? TL.text : TL.mute }}>
                        {g ? g.medlemmer : "—"}
                      </div>
                      <TlBadge tone={mangler || tom ? "varsel" : "nøytral"}>{g ? "spillere" : "mangler"}</TlBadge>
                    </div>
                  </div>
                );
              })}
            </div>
          </TlKort>

          {overStigen && (
            <TlKort eyebrow="Over stigen">
              <p style={{ margin: "0 0 10px", fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
                WANG Toppidrett er ikke et trinn i AK-stigen. Det er neste steg etter Elite.
              </p>
              <TlRad
                title={overStigen.navn}
                sub={[overStigen.level, overStigen.coachNavn].filter(Boolean).join(" · ")}
                meta={`${overStigen.medlemmer} spillere`}
                chevron={false}
                last
              />
            </TlKort>
          )}

          {utenGruppe.length > 0 && (
            <Merknad>
              {utenGruppe.map((t) => t.navn).join(", ")} finnes i AK-stigen, men har ingen gruppe i basen.
            </Merknad>
          )}
          {ukartlagt.length > 0 && (
            <Merknad>
              {ukartlagt.map((g) => `«${g.navn}» (${g.medlemmer} spillere)`).join(", ")} er ikke koblet til noe trinn i stigen.
            </Merknad>
          )}
        </>
      )}

      {fane === "grupper" && (
        <TlKort eyebrow="Juniorgrupper">
          {trinn.filter((t) => t.gruppeNavn && grupper[t.gruppeNavn]).length === 0 ? (
            <TlTomTilstand icon="users" title="Ingen juniorgrupper i basen" sub="De kanoniske GFGK-juniorgruppene finnes ikke i basen ennå." />
          ) : (
            trinn
              .filter((t) => t.gruppeNavn && grupper[t.gruppeNavn])
              .map((t, i, arr) => {
                const g = grupper[t.gruppeNavn];
                if (!g) return null;
                return (
                  <TlRad
                    key={t.navn}
                    title={t.gruppeNavn}
                    sub={[g.coachNavn, ...g.tider].filter(Boolean).join(" · ")}
                    meta={g.medlemmer > 0 ? `${g.medlemmer} spillere` : "tom"}
                    chevron={false}
                    last={i === arr.length - 1}
                  />
                );
              })
          )}
        </TlKort>
      )}

      {fane === "rydding" && (
        <TlKort eyebrow="Grupper som bør ryddes">
          {rester.length === 0 ? (
            <TlTomTilstand icon="users" title="Ingen rester" sub="Ingen grupper uten medlemmer og uten timeplan akkurat nå." />
          ) : (
            rester.map((r, i) => (
              <TlRad
                key={r.id}
                title={r.navn}
                sub="0 medlemmer · 0 timeplanoppføringer"
                meta={r.level ?? "—"}
                chevron={false}
                last={i === rester.length - 1}
              />
            ))
          )}
        </TlKort>
      )}

      {fane === "stigen" && tommeGrupper.length === 0 && utenGruppe.length === 0 && (
        <TlKnapp variant="primaer" href="/admin/spillere?filter=junior">
          Åpne i Spillere
        </TlKnapp>
      )}
    </div>
  );
}
