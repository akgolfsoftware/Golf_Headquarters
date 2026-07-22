"use client";

/**
 * AgencyOS — Ny plan-mal (`/admin/plan-templates/ny`) — v2.
 * v2-port 17. juli 2026 (Team F1): erstatter new-template-form (golfdata).
 * Samme felter, samme validering (navn påkrevd, fordeling må summere til
 * 100 %) og samme server action (createTemplate) med redirect til editoren —
 * kun presentasjonslaget er nytt. Kategori-bytte setter anbefalt fordeling
 * som utgangspunkt, som før.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LPhase, NgfKategori, PyramidArea } from "@/generated/prisma/enums";
import {
  createTemplate,
  type TemplateCreateInput,
} from "@/app/admin/(legacy)/plan-templates/actions";
import {
  ANBEFALT_FORDELING_PER_KATEGORI,
  FASE_ALLE,
  FASE_LABEL,
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  type DisciplinFordeling,
} from "@/components/admin/plan-templates/shared";
import { Kort, Caps, Tittel, Knapp, Icon, HjelpTips, StatusPill, T, AKSE_NAVN } from "@/components/v2";

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/* ── v2-feltstiler (samme idiom som AdminDrillRedigerV2) ── */

const FELT_STIL: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.panel2,
  padding: "10px 14px",
  fontFamily: T.ui,
  fontSize: 13,
  color: T.fg,
  outline: "none",
  boxSizing: "border-box",
};

function Etikett({
  children,
  hjelp,
  required,
}: {
  children: React.ReactNode;
  hjelp?: "lFase" | "pyramideAkse";
  required?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>
      {children}
      {required && <span style={{ color: T.down }}>*</span>}
      {hjelp && <HjelpTips k={hjelp} size={11} />}
    </span>
  );
}

function Felt({
  label,
  hjelp,
  required,
  children,
}: {
  label: React.ReactNode;
  hjelp?: "lFase" | "pyramideAkse";
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <Etikett hjelp={hjelp} required={required}>{label}</Etikett>
      {children}
    </label>
  );
}

export function AdminPlanMalNyV2() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kategori, setKategori] = useState<NgfKategori>("E");
  const [lPhase, setLPhase] = useState<LPhase>("GRUNN");
  const [varighetUker, setVarighetUker] = useState(4);
  const [ukentligOktAntall, setUkentligOktAntall] = useState(5);
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(
    ANBEFALT_FORDELING_PER_KATEGORI.E,
  );
  const [minAlder, setMinAlder] = useState("");
  const [maxAlder, setMaxAlder] = useState("");

  const sum = Math.round(
    (fordeling.FYS + fordeling.TEK + fordeling.SLAG + fordeling.SPILL + fordeling.TURN) * 100,
  );

  function setKategoriAndFordeling(k: NgfKategori) {
    setKategori(k);
    setFordeling(ANBEFALT_FORDELING_PER_KATEGORI[k]);
  }

  function submit() {
    if (!name.trim()) {
      alert("Navn er påkrevd.");
      return;
    }
    if (sum !== 100) {
      alert(`Fordelingen må summere til 100% (er nå ${sum}%).`);
      return;
    }
    const input: TemplateCreateInput = {
      name: name.trim(),
      description: description.trim() || null,
      kategori,
      lPhase,
      varighetUker,
      ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: minAlder ? parseInt(minAlder, 10) : null,
      maxAlder: maxAlder ? parseInt(maxAlder, 10) : null,
      approved: false,
    };
    startTransition(async () => {
      const res = await createTemplate(input);
      if (res.ok) {
        router.push(`/admin/plan-templates/${res.data.templateId}/rediger`);
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps>Ny mal · AgencyOS</Caps>
          <div style={{ marginTop: 6 }}>
            <Tittel em="mal">Opprett</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.55 }}>
            Fyll inn metadata og opprett. Du kan legge til økter etterpå.
          </p>
        </div>
        <StatusPill tone={sum === 100 && name.trim() ? "lime" : "info"}>
          {sum === 100 ? "Fordeling OK · 100 %" : `Fordeling ${sum} %`}
        </StatusPill>
      </div>

      <Kort>
        <Caps>Metadata</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <Felt label="Navn" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="F.eks. E Konkurranse Standard"
              style={FELT_STIL}
            />
          </Felt>
          <Felt label="Beskrivelse">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...FELT_STIL, resize: "vertical", lineHeight: 1.55 }}
            />
          </Felt>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Felt label="Kategori">
              <select
                value={kategori}
                onChange={(e) => setKategoriAndFordeling(e.target.value as NgfKategori)}
                style={FELT_STIL}
              >
                {KATEGORI_ALLE.map((k) => (
                  <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>
                ))}
              </select>
            </Felt>
            <Felt label="Fase" hjelp="lFase">
              <select
                value={lPhase}
                onChange={(e) => setLPhase(e.target.value as LPhase)}
                style={FELT_STIL}
              >
                {FASE_ALLE.map((f) => (
                  <option key={f} value={f}>{FASE_LABEL[f]}</option>
                ))}
              </select>
            </Felt>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <Felt label="Varighet (uker)">
              <input
                type="number"
                min={1}
                max={52}
                value={varighetUker}
                onChange={(e) => setVarighetUker(parseInt(e.target.value || "1", 10))}
                style={FELT_STIL}
              />
            </Felt>
            <Felt label="Økt per uke">
              <input
                type="number"
                min={1}
                max={14}
                value={ukentligOktAntall}
                onChange={(e) => setUkentligOktAntall(parseInt(e.target.value || "1", 10))}
                style={FELT_STIL}
              />
            </Felt>
            <Felt label="Min alder">
              <input
                type="number"
                value={minAlder}
                onChange={(e) => setMinAlder(e.target.value)}
                style={FELT_STIL}
              />
            </Felt>
            <Felt label="Maks alder">
              <input
                type="number"
                value={maxAlder}
                onChange={(e) => setMaxAlder(e.target.value)}
                style={FELT_STIL}
              />
            </Felt>
          </div>
        </div>
      </Kort>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Etikett hjelp="pyramideAkse">Disiplin-fordeling (start fra anbefalt)</Etikett>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: sum === 100 ? T.up : T.down, fontVariantNumeric: "tabular-nums" }}>
            {sum}%
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {PYR_ALLE.map((p) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: 3, background: T.ax[p], flex: "none" }} />
              <span style={{ width: 76, flex: "none", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2 }}>
                {AKSE_NAVN[p]}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(fordeling[p] * 100)}
                onChange={(e) =>
                  setFordeling({ ...fordeling, [p]: parseInt(e.target.value, 10) / 100 })
                }
                aria-label={`Andel ${AKSE_NAVN[p]}`}
                style={{ flex: 1, accentColor: T.ax[p] }}
              />
              <span style={{ width: 42, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(fordeling[p] * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Kort>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Knapp icon="check" disabled={isPending} onClick={submit}>
          {isPending ? "Oppretter…" : "Opprett og fortsett til editor"}
        </Knapp>
      </div>
      {/* Ikke-blokkerende hint når fordelingen ikke går opp — selve stoppet skjer i submit + server-zod */}
      {sum !== 100 && (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: 0, textAlign: "right" }}>
          <Icon name="alert-triangle" size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          Fordelingen summerer til {sum} % — må være 100 % før malen kan opprettes.
        </p>
      )}
    </div>
  );
}
