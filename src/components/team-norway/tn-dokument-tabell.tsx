"use client";

import { TN } from "@/lib/v2/team-norway";
import { TnSeHvem } from "./tn-post-tidslinje";

export type TnDokumentRadVisning = {
  attachmentId: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  opplasterNavn: string;
  oppdatertIso: string;
  kilde: "FRA_POST" | "LASTET_OPP";
  postId: string;
  totalt: number;
  apnet: number;
};

function fileTypeLabel(fileType: string | null): string {
  if (!fileType) return "FIL";
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("image")) return "BILDE";
  if (fileType.includes("sheet")) return "XLSX";
  return "FIL";
}

function fileSizeLabel(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatterDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** TN-11 dokumentbibliotek — fil, opplaster, sist oppdatert, lesekvittering. */
export function TnDokumentTabell({ rader }: { rader: TnDokumentRadVisning[] }) {
  if (rader.length === 0) {
    return (
      <div style={{ background: TN.surfaceCard, borderRadius: TN.radius.lg, boxShadow: TN.shadow.sm, padding: 24, fontFamily: TN.font.body, fontSize: TN.text.sm, color: TN.textSecondary }}>
        Ingen filer delt ennå.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, padding: "0 16px 2px" }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textTertiary }}>Fil</span>
        <span style={{ width: 150, flexShrink: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textTertiary }}>Lastet opp av</span>
        <span style={{ width: 120, flexShrink: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textTertiary }}>Sist oppdatert</span>
        <span style={{ width: 190, flexShrink: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textTertiary }}>Lesekvittering</span>
      </div>

      {rader.map((r) => {
        const pct = r.totalt === 0 ? 0 : Math.round((r.apnet / r.totalt) * 100);
        return (
          <div
            key={r.attachmentId}
            style={{
              background: TN.surfaceCard,
              borderRadius: TN.radius.md,
              boxShadow: TN.shadow.sm,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              minHeight: 44,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: TN.radius.xs,
                  background: TN.ink100,
                  color: TN.ink700,
                  fontFamily: TN.font.mono,
                  fontSize: TN.text.micro,
                  fontWeight: TN.weight.bold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {fileTypeLabel(r.fileType)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.fileName}
                </div>
                <div
                  style={{
                    fontFamily: TN.font.mono,
                    fontSize: TN.text.micro,
                    letterSpacing: TN.tracking.eyebrow,
                    textTransform: "uppercase",
                    color: TN.textTertiary,
                    marginTop: 2,
                  }}
                >
                  {fileSizeLabel(r.fileSize)} · {r.kilde === "LASTET_OPP" ? "LASTET OPP" : "FRA POST"}
                </div>
              </div>
            </div>
            <span style={{ width: 150, flexShrink: 0, fontFamily: TN.font.body, fontSize: TN.text.sm, color: TN.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.opplasterNavn}
            </span>
            <span style={{ width: 120, flexShrink: 0, fontFamily: TN.font.mono, fontSize: TN.text.sm, color: TN.textSecondary }}>{formatterDato(r.oppdatertIso)}</span>
            <div style={{ width: 190, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0, height: 8, borderRadius: TN.radius.full, background: TN.ink100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: TN.radius.full, background: pct >= 85 ? TN.status.green : pct >= 50 ? TN.navy400 : TN.status.amber }} />
                </div>
                <span style={{ width: 60, flexShrink: 0, fontFamily: TN.font.mono, fontSize: TN.text.xs, color: TN.textSecondary }}>
                  {r.apnet} av {r.totalt}
                </span>
              </div>
              <TnSeHvem postId={r.postId} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
