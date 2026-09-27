import { TL } from "@/lib/v2/train-lock";
import type { WorkbenchAnalyseData } from "@/lib/admin/analyse/lastere";

export function WorkbenchAnalyseV2({ data }: { data: WorkbenchAnalyseData }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: 18 }}>
        <span style={{ fontSize: 11, fontWeight: TL.vekt.caps, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
          Workbench · siste 90 dager
        </span>
        <h2 style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 700, color: TL.text }}>Treningsdata og turnering</h2>
        <p style={{ margin: "8px 0 0", maxWidth: "66ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          Viser fysisk belastning, faktisk logget styrkevolum og turneringsdata fra den nye Workbench-modellen. Tallene er stallnivå for spillere coachen har tilgang til.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <Metric label="Spillere" value={String(data.nSpillere)} />
        <Metric label="Fysiske økter" value={String(data.fysiskOkter)} />
        <Metric label="Fysisk tid" value={`${data.fysiskMinutter} min`} />
        <Metric label="Tonnasje" value={data.fysiskTonnasjeKg > 0 ? `${data.fysiskTonnasjeKg} kg` : "—"} />
        <Metric label="Turneringsplaner" value={String(data.turneringsplaner)} />
        <Metric label="Runder" value={String(data.turneringsrunder)} />
        <Metric label="Brutto snitt" value={data.bruttoSnitt == null ? "—" : String(data.bruttoSnitt)} />
        <Metric label="SG snitt" value={data.sgSnitt == null ? "—" : String(data.sgSnitt)} />
      </div>

      <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TL.text }}>
          {data.apneKonflikter === 0 ? "Ingen åpne plan-konflikter i Workbench." : `${data.apneKonflikter} åpne plan-konflikter må avklares.`}
        </span>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "13px 14px" }}>
      <div style={{ fontSize: 10, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute, fontWeight: TL.vekt.caps }}>{label}</div>
      <div style={{ marginTop: 6, fontFamily: TL.font.mono, fontSize: 24, color: TL.text }}>{value}</div>
    </div>
  );
}
