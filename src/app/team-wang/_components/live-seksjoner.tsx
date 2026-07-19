"use client";

// Ekte-data-seksjoner: elevliste (roster) og kommende hendelser fra AgencyOS-
// gruppa. Rendres oppå demo-skjermene når live-data finnes (auth-gatet). Bruker
// KUN `import type` fra det server-only datamodulen — typene er slettet ved
// kompilering, så ingenting server-only havner i klientbundelen.

import type { WangLiveData } from "../_data/hent-wang-gruppe";
import { IconChip } from "./primitiver";

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function fmtDato(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}. ${MND_KORT[(m ?? 1) - 1]}`;
}

function kindLabel(kind: string | null): string {
  if (kind === "SAMLING") return "Samling";
  if (kind === "HELDAGSSAMLING") return "Heldagssamling";
  return "Økt / test";
}
function kindFarge(kind: string | null): "orange" | "purple" | "navy" {
  if (kind === "HELDAGSSAMLING") return "orange";
  if (kind === "SAMLING") return "purple";
  return "navy";
}

function SyncStempel({ oppdatertIso }: { oppdatertIso: string }) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 11px", borderRadius: 999, background: "var(--tint-teal)", color: "var(--wang-teal-text)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--wang-mint)" }} />
      Synket fra AgencyOS · {fmtDato(oppdatertIso)}
    </span>
  );
}

// ---- Kommende hendelser fra AgencyOS (ekte GroupSchedule) ----------------
export function AgencyOsHendelser({ live, naaIso }: { live: WangLiveData | null; naaIso: string }) {
  if (!live) return null;
  const kommende = live.hendelser
    .filter((h) => h.sluttIso >= naaIso)
    .sort((a, b) => a.startIso.localeCompare(b.startIso))
    .slice(0, 6);

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", margin: "2px 2px 12px" }}>
        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Kommende samlinger og tester</div>
        <SyncStempel oppdatertIso={live.oppdatertIso} />
      </div>
      {kommende.length === 0 ? (
        <div className="wang-card" style={{ padding: "18px 20px", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>
          Ingen kommende samlinger eller tester registrert i AgencyOS akkurat nå.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {kommende.map((h, i) => (
            <div key={h.startIso + h.tittel + i} className="wang-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <IconChip icon={h.kind === "HELDAGSSAMLING" || h.kind === "SAMLING" ? "users" : "clipboard-check"} color={kindFarge(h.kind)} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{h.tittel}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>
                  {kindLabel(h.kind)}
                  {h.sted ? ` · ${h.sted}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                <span className="wang-num" style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {fmtDato(h.startIso)}
                  {h.sluttIso !== h.startIso ? `–${fmtDato(h.sluttIso)}` : ""}
                </span>
                <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5, color: "var(--text-secondary)" }}>{h.startTid}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---- Elevliste (ekte roster fra GroupMember) -----------------------------
function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "?";
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

export function GruppeRoster({ live }: { live: WangLiveData | null }) {
  if (!live) return null;
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", margin: "2px 2px 12px" }}>
        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
          Gruppa · {live.antallElever} {live.antallElever === 1 ? "elev" : "elever"}
        </div>
        <SyncStempel oppdatertIso={live.oppdatertIso} />
      </div>
      {live.elever.length === 0 ? (
        <div className="wang-card" style={{ padding: "18px 20px", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>
          Ingen elever registrert i gruppa i AgencyOS ennå.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
          {live.elever.map((e, i) => (
            <div key={e.navn + i} className="wang-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 999, background: "var(--tint-navy)", color: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 13 }}>{initialer(e.navn)}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.navn}</div>
                <div className="t-label" style={{ color: "var(--text-secondary)", marginTop: 1 }}>{e.rolle === "ASSISTANT" ? "Assistent" : "Spiller"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{ margin: "10px 2px 0", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
        Elevlisten hentes fra AgencyOS-gruppa «{live.gruppeNavn}». VG-trinn og individuelle planer vises i AgencyOS.
      </p>
    </section>
  );
}
