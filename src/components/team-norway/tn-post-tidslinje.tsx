"use client";

import { useEffect, useState, useTransition } from "react";
import { TN } from "@/lib/v2/team-norway";
import { TnAvatarInitialer, TnPille, type TnPilleTone } from "./core";
import { merkPostLestAction, hentLesekvitteringNavnAction } from "@/app/team-norway/tn-post-actions";

export type TnTidslinjePost = {
  id: string;
  authorNavn: string;
  createdAtIso: string;
  kind: string;
  tekst: string;
  vedlegg: { id: string; fileName: string; fileType: string | null }[];
  /** null = ingen kvittering-brøk (individuelle poster viser i stedet et boolsk sett/ikke-sett). */
  kvittering: { totalt: number; apnet: number } | null;
};

const KIND_MERKE: Record<string, { label: string; tone: TnPilleTone }> = {
  TEKST: { label: "TEKST", tone: "nøytral" },
  REISE: { label: "REISE", tone: "navy" },
  MOTE: { label: "MØTE", tone: "info" },
  OKT: { label: "ØKT", tone: "nøytral" },
  DOKUMENT: { label: "DOKUMENT", tone: "nøytral" },
};

function formatterTid(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

export function TnSeHvem({ postId }: { postId: string }) {
  const [apent, setApent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<Awaited<ReturnType<typeof hentLesekvitteringNavnAction>>>(null);

  function apne() {
    if (apent) {
      setApent(false);
      return;
    }
    setApent(true);
    if (data) return;
    startTransition(async () => {
      const svar = await hentLesekvitteringNavnAction(postId);
      setData(svar);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={apne}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontFamily: TN.font.body,
          fontSize: TN.text.xs,
          fontWeight: TN.weight.semibold,
          color: TN.navy700,
          cursor: "pointer",
        }}
      >
        Se hvem
      </button>
      {apent && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: TN.radius.md,
            background: TN.surfaceSunken,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {pending && <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.textSecondary }}>Henter …</span>}
          {data?.mangler.map((m) => (
            <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: TN.radius.full, background: TN.ink300, flexShrink: 0 }} />
              <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.textSecondary }}>{m.navn} — ikke åpnet</span>
            </div>
          ))}
          {data?.apnet.map((a) => (
            <div key={a.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: TN.radius.full, background: TN.status.green, flexShrink: 0 }} />
              <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.textPrimary }}>{a.navn}</span>
            </div>
          ))}
          {data && data.apnet.length === 0 && data.mangler.length === 0 && (
            <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.textTertiary }}>Ingen mottakere ennå</span>
          )}
        </div>
      )}
    </div>
  );
}

function VedleggChip({ fileName, fileType }: { fileName: string; fileType: string | null }) {
  const type = fileType?.includes("pdf") ? "PDF" : fileType?.includes("image") ? "BILDE" : fileType?.includes("sheet") ? "XLSX" : "FIL";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${TN.borderSubtle}`,
        borderRadius: TN.radius.md,
        padding: "8px 14px 8px 8px",
        background: TN.surfacePage,
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
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
        {type}
      </span>
      <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, color: TN.navy900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {fileName}
      </span>
    </div>
  );
}

/** Kvitterer posten som lest når den vises — best-effort, kun for spiller/foresatt-visning. */
function MarkerLestVedVisning({ postId }: { postId: string }) {
  useEffect(() => {
    void merkPostLestAction(postId);
  }, [postId]);
  return null;
}

export function TnPostTidslinje({
  poster,
  kvitterVedVisning = false,
}: {
  poster: TnTidslinjePost[];
  /** true for spiller/foresatt-visning — false for trenerens egen visning (skal ikke kvittere egne poster). */
  kvitterVedVisning?: boolean;
}) {
  if (poster.length === 0) {
    return (
      <div
        style={{
          background: TN.surfaceCard,
          borderRadius: TN.radius.lg,
          boxShadow: TN.shadow.sm,
          padding: 24,
          fontFamily: TN.font.body,
          fontSize: TN.text.sm,
          color: TN.textSecondary,
        }}
      >
        Ingen poster ennå.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {poster.map((p) => {
        const merke = KIND_MERKE[p.kind] ?? KIND_MERKE.TEKST;
        return (
          <div
            key={p.id}
            style={{
              background: TN.surfaceCard,
              borderRadius: TN.radius.lg,
              boxShadow: TN.shadow.sm,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {kvitterVedVisning && <MarkerLestVedVisning postId={p.id} />}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <TnAvatarInitialer navn={p.authorNavn} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>
                  {p.authorNavn}
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
                  {formatterTid(p.createdAtIso)}
                </div>
              </div>
              <TnPille tone={merke.tone}>{merke.label}</TnPille>
            </div>

            {p.tekst.length > 0 && (
              <div style={{ fontFamily: TN.font.body, fontSize: TN.text.base, color: TN.textPrimary, lineHeight: TN.leading.normal }}>
                {p.tekst}
              </div>
            )}

            {p.vedlegg.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {p.vedlegg.map((v) => (
                  <VedleggChip key={v.id} fileName={v.fileName} fileType={v.fileType} />
                ))}
              </div>
            )}

            {p.kvittering && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: `1px solid ${TN.borderSubtle}`, paddingTop: 10 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: TN.radius.full,
                    background:
                      p.kvittering.totalt === 0
                        ? TN.ink300
                        : p.kvittering.apnet === p.kvittering.totalt
                          ? TN.status.green
                          : p.kvittering.apnet === 0
                            ? TN.ink300
                            : TN.status.amber,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.textSecondary }}>
                  {p.kvittering.apnet} av {p.kvittering.totalt} har åpnet
                </span>
                <TnSeHvem postId={p.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
