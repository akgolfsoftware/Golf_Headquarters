"use client";

/**
 * PlayerHQ · AI mål-bygger (SMART-mål) — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  ValgKort,
  Inndata,
  InnsiktChip,
  StatusPill,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { lagreMalForslag, type MalForslagInput } from "@/app/portal/ai/mal-bygger/actions";

type Horizon = "SESONG" | "KVARTAL" | "MANED";
type Focus = "RESULTAT" | "PROSESS" | "BALANSERT";

const HORIZONS: { key: Horizon; label: string; sub: string }[] = [
  { key: "MANED", label: "Denne måneden", sub: "Kort, konkret fokus" },
  { key: "KVARTAL", label: "Dette kvartalet", sub: "3 måneders blokk" },
  { key: "SESONG", label: "Hele sesongen", sub: "Langsiktig retning" },
];

const FOCUS: { key: Focus; label: string; sub: string }[] = [
  { key: "RESULTAT", label: "Resultatmål", sub: "Hva du vil oppnå (HCP, plassering)" },
  { key: "PROSESS", label: "Prosessmål", sub: "Hva du gjør (trening, repetisjoner)" },
  { key: "BALANSERT", label: "Begge deler", sub: "En miks av resultat og prosess" },
];

type Template = {
  id: string;
  type: string;
  category: "OUTCOME" | "PROCESS";
  categoryLabel: string;
  /** Mal-tittel med {…}-plassholdere spilleren fyller. */
  title: string;
  fields: { key: string; label: string; placeholder: string }[];
  hint: string;
};

const TEMPLATES: Template[] = [
  {
    id: "hcp",
    type: "HCP_TARGET",
    category: "OUTCOME",
    categoryLabel: "Resultat",
    title: "Senke handicapet til {mål} innen sesongslutt",
    fields: [{ key: "mål", label: "Mål-HCP", placeholder: "f.eks. 4,5" }],
    hint: "Et tydelig resultatmål gir retning til all treningen.",
  },
  {
    id: "rounds",
    type: "ROUNDS_PER_MONTH",
    category: "PROCESS",
    categoryLabel: "Prosess",
    title: "Spille {antall} tellende runder hver måned",
    fields: [{ key: "antall", label: "Runder / mnd", placeholder: "f.eks. 6" }],
    hint: "Volum på banen er det som flytter handicapet over tid.",
  },
  {
    id: "putt",
    type: "FREE_TEXT",
    category: "PROCESS",
    categoryLabel: "Prosess",
    title: "Trene {antall} putter i uka på 1–3 meter",
    fields: [{ key: "antall", label: "Putter / uke", placeholder: "f.eks. 90" }],
    hint: "Korte putter er den raskeste veien til lavere score.",
  },
  {
    id: "test",
    type: "FREE_TEXT",
    category: "PROCESS",
    categoryLabel: "Prosess",
    title: "Ta {antall} ferdighetstester i {område} dette kvartalet",
    fields: [
      { key: "antall", label: "Antall tester", placeholder: "f.eks. 4" },
      { key: "område", label: "Område", placeholder: "f.eks. nærspill" },
    ],
    hint: "Tester gir deg en baseline og viser om treningen virker.",
  },
];

type SelectedGoal = {
  template: Template;
  values: Record<string, string>;
  targetDate: string;
};

function fillTitle(template: Template, values: Record<string, string>): string {
  return template.title.replace(/\{(\w+)\}/g, (_m, key: string) => {
    const v = values[key]?.trim();
    return v && v.length > 0 ? v : `[${key}]`;
  });
}

function isComplete(g: SelectedGoal): boolean {
  return g.template.fields.every((f) => (g.values[f.key]?.trim().length ?? 0) > 0);
}

/** Liten kategori-tag (Resultat/Prosess) i mal-kortene. */
function KategoriTag({ category, label }: { category: "OUTCOME" | "PROCESS"; label: string }) {
  const c = category === "OUTCOME" ? T.lime : T.fg2;
  return (
    <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c, background: `color-mix(in srgb, ${c} 12%, transparent)`, borderRadius: 9999, padding: "3px 8px" }}>
      {label}
    </span>
  );
}

/** Stegindikator (1 Ambisjon · 2 Velg mål · 3 Lagre) — visning uten egne CTA-er. */
function StegRad({ aktiv }: { aktiv: 1 | 2 | 3 }) {
  const steg = ["Ambisjon", "Velg mål", "Lagre"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {steg.map((s, i) => {
        const n = i + 1;
        const done = n < aktiv;
        const on = n === aktiv;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < steg.length - 1 ? 1 : "none" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flex: "none" }}>
              <span style={{ width: 24, height: 24, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, background: done ? T.lime : "transparent", border: `2px solid ${done || on ? T.lime : T.borderS}`, color: done ? T.onLime : on ? T.lime : T.mut }}>
                {done ? <Icon name="check" size={12} /> : n}
              </span>
              <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? T.fg : T.mut, whiteSpace: "nowrap" }}>{s}</span>
            </span>
            {i < steg.length - 1 && <span style={{ flex: 1, height: 2, borderRadius: 2, background: done ? `color-mix(in srgb, ${T.lime} 45%, transparent)` : T.track }} />}
          </div>
        );
      })}
    </div>
  );
}

export function AiMalByggerV2({
  playerFirstName,
  defaultYearEnd,
}: {
  playerFirstName: string;
  defaultYearEnd: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [horizon, setHorizon] = useState<Horizon | null>(null);
  const [selected, setSelected] = useState<Record<string, SelectedGoal>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const visibleTemplates = useMemo(() => {
    if (focus === "RESULTAT") return TEMPLATES.filter((t) => t.category === "OUTCOME");
    if (focus === "PROSESS") return TEMPLATES.filter((t) => t.category === "PROCESS");
    return TEMPLATES;
  }, [focus]);

  const chosen = Object.values(selected);
  const readyCount = chosen.filter(isComplete).length;

  function toggle(template: Template) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[template.id]) {
        delete next[template.id];
      } else {
        next[template.id] = {
          template,
          values: {},
          targetDate: defaultYearEnd,
        };
      }
      return next;
    });
  }

  function setValue(id: string, key: string, value: string) {
    setSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], values: { ...prev[id].values, [key]: value } },
    }));
  }

  function setDate(id: string, value: string) {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], targetDate: value } }));
  }

  function save() {
    setError(null);
    const payload: MalForslagInput[] = chosen.filter(isComplete).map((g) => {
      const numericField = g.template.fields.find((f) => /^\d/.test(g.values[f.key]?.trim() ?? ""));
      const rawNum = numericField
        ? Number(g.values[numericField.key].replace(",", "."))
        : NaN;
      return {
        type: g.template.type,
        category: g.template.category === "OUTCOME" ? "OUTCOME" : "PROCESS",
        title: fillTitle(g.template, g.values),
        targetValue: Number.isFinite(rawNum) ? rawNum : null,
        targetDate: g.targetDate || null,
      };
    });
    if (payload.length === 0) {
      setError("Fyll inn verdiene i minst ett mål før du lagrer.");
      return;
    }
    startTransition(async () => {
      try {
        await lagreMalForslag(payload);
        router.push("/portal/mal");
      } catch {
        setError("Kunne ikke lagre målene. Prøv igjen.");
      }
    });
  }

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AI · Mål-bygger</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em={playerFirstName}>La oss sette målene dine,</Tittel>
        </div>
      </div>

      <Kort pad="14px 18px">
        <StegRad aktiv={step} />
      </Kort>

      {/* STEG 1 — Ambisjon */}
      {step === 1 && (
        <>
          <Kort eyebrow="Hva vil du fokusere på?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FOCUS.map((f) => (
                <ValgKort
                  key={f.key}
                  tittel={f.label}
                  sub={f.sub}
                  valgt={focus === f.key}
                  onClick={() => setFocus(f.key)}
                />
              ))}
            </div>
          </Kort>
          <Kort eyebrow="Hvilken tidshorisont?">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HORIZONS.map((h) => (
                <ValgKort
                  key={h.key}
                  tittel={h.label}
                  sub={h.sub}
                  valgt={horizon === h.key}
                  onClick={() => setHorizon(h.key)}
                />
              ))}
            </div>
          </Kort>
          <Knapp icon="arrow-right" full disabled={!focus || !horizon} onClick={() => setStep(2)}>
            Foreslå SMART-mål
          </Knapp>
        </>
      )}

      {/* STEG 2 — Velg + tilpass mål */}
      {step === 2 && (
        <>
          <InnsiktChip>
            Velg de målene som passer, og fyll inn{" "}
            <span style={{ color: T.fg, fontWeight: 600 }}>dine egne tall</span>. Vi dikter ingenting opp for deg.
          </InnsiktChip>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleTemplates.map((t) => {
              const sel = selected[t.id];
              const open = !!sel;
              return (
                <Kort key={t.id} style={{ border: `1px solid ${open ? T.lime : T.border}` }}>
                  <div
                    role="checkbox"
                    aria-checked={open}
                    tabIndex={0}
                    className="v2-press v2-focus"
                    onClick={() => toggle(t)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
                  >
                    <span style={{ marginTop: 2, width: 18, height: 18, borderRadius: 6, border: `2px solid ${open ? T.lime : T.borderS}`, background: open ? T.lime : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      {open && <Icon name="check" size={12} style={{ color: T.onLime }} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <KategoriTag category={t.category} label={t.categoryLabel} />
                      <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg, marginTop: 6, lineHeight: 1.4 }}>
                        {open ? fillTitle(t, sel.values) : t.title.replace(/\{(\w+)\}/g, "…")}
                      </div>
                      <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4, lineHeight: 1.5 }}>{t.hint}</div>
                    </div>
                  </div>

                  {open && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                      {t.fields.map((f) => (
                        <Inndata
                          key={f.key}
                          label={f.label}
                          value={sel.values[f.key] ?? ""}
                          onChange={(v) => setValue(t.id, f.key, v)}
                          placeholder={f.placeholder}
                          mono
                        />
                      ))}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Inndata
                          label="Frist"
                          type="date"
                          value={sel.targetDate}
                          onChange={(v) => setDate(t.id, v)}
                          mono
                        />
                      </div>
                    </div>
                  )}
                </Kort>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Knapp ghost icon="arrow-left" onClick={() => setStep(1)}>
              Tilbake
            </Knapp>
            <Knapp icon="arrow-right" full disabled={readyCount === 0} onClick={() => setStep(3)}>
              Se gjennom ({readyCount})
            </Knapp>
          </div>
        </>
      )}

      {/* STEG 3 — Bekreft + lagre */}
      {step === 3 && (
        <>
          <Kort eyebrow="Klar til å lagre">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {chosen.filter(isComplete).map((g) => (
                <div key={g.template.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, padding: "12px 14px" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <Icon name="target" size={13} style={{ color: T.lime }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <KategoriTag category={g.template.category} label={g.template.categoryLabel} />
                    <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg, marginTop: 6, lineHeight: 1.4 }}>
                      {fillTitle(g.template, g.values)}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Frist{" "}
                      {g.targetDate
                        ? new Date(g.targetDate).toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "ingen"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Kort>

          {error && (
            <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusPill tone="down">Feil</StatusPill>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <Knapp ghost icon="arrow-left" disabled={pending} onClick={() => setStep(2)}>
              Tilbake
            </Knapp>
            <Knapp icon="check" full disabled={pending} onClick={save}>
              {pending ? "Lagrer …" : "Lagre målene"}
            </Knapp>
          </div>
        </>
      )}
    </div>
  );
}
