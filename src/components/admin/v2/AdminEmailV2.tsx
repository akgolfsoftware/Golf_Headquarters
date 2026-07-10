"use client";

/**
 * AgencyOS E-postmaler — v2 (retning C «Presis»). Coach/ADMIN forvalter
 * EmailTemplate-malene som agent-pipelinen sender automatiske e-poster fra.
 * Ingen mockup fantes — komponert utelukkende av v2-biblioteket
 * (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen (src/app/admin/email-templates):
 *   - 3 KPI-er: maler totalt · aktive · grupper.
 *   - Mal-liste (navn/emne/slug/status), gruppert på slug-prefiks, med
 *     fritekstsøk og gruppe-filter (FilterChips).
 *   - Mal-detalj: emne, sist endret, opprettet, utfoldbart innhold (body).
 *   - Rediger-snarvei → /admin/email-templates/{id}/rediger (uendret rute).
 *   - CRUD via server-actions createTemplate/updateTemplate/deleteTemplate
 *     i en v2-komponert editor-overflate (Inndata/TekstOmraade/Bryter/Knapp).
 *   - «Send test» beholdt som deaktivert (kommer når mail-logg finnes).
 *
 * Mobil: master-detalj kollapser til stabel (liste først, så valgt mal);
 * header-handling flyttes til fullbredde-knapp; editoren er fullskjerm-ark.
 *
 * Ærlige tomrom: ingen fabrikerte tall — tom liste ved 0 maler, tomt søk.
 * GAP: v2 mangler en WIRED modal/overlay-form (kjerne-`Modal` er demo-statisk),
 *      så editoren er komponert av Kort + skjema-primitiver i et backdrop-lag.
 */

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  Knapp,
  FilterChips,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";
import { Inndata, TekstOmraade, Bryter } from "@/components/v2";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/app/admin/(legacy)/email-templates/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export interface AdminEmailV2Template {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
  /** slug-prefiks (heuristikk) — gruppe-etikett. */
  gruppe: string;
  /** formatert sist-endret (nb-NO). */
  sistEndret: string;
  /** formatert opprettet (nb-NO). */
  opprettet: string;
}
export interface AdminEmailV2Data {
  total: number;
  aktive: number;
  /** tilgjengelige gruppe-filtre (kun de med maler). */
  grupper: string[];
  maler: AdminEmailV2Template[];
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

// ── Editor: v2-komponert CRUD-overflate (server-actions) ────────
type EditorState =
  | { modus: "ny" }
  | { modus: "endre"; mal: AdminEmailV2Template }
  | null;

function MalEditor({
  state,
  onLukk,
  onLagret,
}: {
  state: EditorState;
  onLukk: () => void;
  onLagret: () => void;
}) {
  const initial = state?.modus === "endre" ? state.mal : null;
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!state) return null;

  const erEndre = state.modus === "endre";

  const lagre = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setFeil("Navn, emne og innhold er påkrevd.");
      return;
    }
    if (!erEndre && !slug.trim()) {
      setFeil("Slug er påkrevd (f.eks. velkomst-pro).");
      return;
    }
    setFeil(null);
    start(async () => {
      try {
        if (erEndre && initial) {
          await updateTemplate(initial.id, { name, subject, body, active });
        } else {
          await createTemplate({ slug, name, subject, body, active });
        }
        onLagret();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  };

  const slett = () => {
    if (!erEndre || !initial) return;
    if (!confirm(`Slett malen «${initial.name}»?`)) return;
    setFeil(null);
    start(async () => {
      try {
        await deleteTemplate(initial.id);
        onLagret();
      } catch {
        setFeil("Kunne ikke slette.");
      }
    });
  };

  return (
    <div
      onClick={onLukk}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "6vh 16px 24px",
        overflowY: "auto",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560 }}>
        <Kort>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <div>
              <Caps size={9} color={T.lime}>{erEndre ? "Endre mal" : "Ny mal"}</Caps>
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: T.fg, margin: "8px 0 0" }}>
                {erEndre ? initial?.name : "E-postmal"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onLukk}
              aria-label="Lukk"
              className="v2-press v2-focus"
              style={{ width: 30, height: 30, borderRadius: 9, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}
            >
              <Icon name="x" size={15} style={{ color: T.fg2 }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
              <Inndata
                label={erEndre ? "Slug (kan ikke endres)" : "Slug"}
                value={slug}
                placeholder="velkomst-pro"
                mono
                onChange={erEndre ? undefined : setSlug}
              />
              <Inndata label="Navn" value={name} placeholder="Velkomst til Pro" onChange={setName} />
            </div>
            <Inndata label="Emne" value={subject} placeholder="Velkommen til AK Golf Pro!" onChange={setSubject} />
            <TekstOmraade
              label="Innhold (markdown)"
              value={body}
              rows={9}
              placeholder="Hei {{name}}, velkommen til Pro …"
              onChange={setBody}
            />
            <Bryter
              label="Aktiv"
              sub="Kan brukes av agent-pipelinen"
              checked={active}
              onChange={setActive}
            />
          </div>

          {feil && (
            <p role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down, margin: "14px 0 0" }}>
              {feil}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, opacity: pending ? 0.5 : 1 }}>
            {erEndre && (
              <Knapp ghost icon="trash" disabled={pending} onClick={slett}>
                Slett
              </Knapp>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Knapp ghost disabled={pending} onClick={onLukk}>
                Avbryt
              </Knapp>
              <Knapp icon="check" disabled={pending} onClick={lagre}>
                {pending ? "Lagrer…" : "Lagre"}
              </Knapp>
            </div>
          </div>
        </Kort>
      </div>
    </div>
  );
}

// ── Mal-detalj (valgt mal) ──────────────────────────────────────
function MalDetalj({
  mal,
  onEndre,
}: {
  mal: AdminEmailV2Template;
  onEndre: () => void;
}) {
  const [visInnhold, setVisInnhold] = useState(false);

  return (
    <Kort
      tint
      eyebrow="Mal-detalj"
      action={
        <StatusPill tone={mal.active ? "up" : "info"}>{mal.active ? "Aktiv" : "Inaktiv"}</StatusPill>
      }
    >
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: T.fg }}>
        {mal.name}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.04em", color: T.mut, marginTop: 4 }}>
        {mal.slug} · sist endret {mal.sistEndret}
      </div>

      <div style={{ marginTop: 16 }}>
        <Caps size={9}>Emne</Caps>
        <div style={{ marginTop: 7, borderRadius: 11, background: T.panel2, border: `1px solid ${T.borderS}`, padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg }}>
          {mal.subject}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={() => setVisInnhold((v) => !v)}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "none", padding: 0, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: T.fg2 }}
        >
          <Icon name={visInnhold ? "chevron-down" : "chevron-right"} size={13} style={{ color: T.mut }} />
          {visInnhold ? "Skjul innhold" : "Vis innhold"}
        </button>
        {visInnhold && (
          <pre style={{ marginTop: 10, borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, padding: 14, fontFamily: T.mono, fontSize: 12, lineHeight: 1.6, color: T.fg, whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {mal.body}
          </pre>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
        <span onClick={onEndre} style={{ display: "inline-flex" }}>
          <CTAPill icon="pencil">Rediger felt</CTAPill>
        </span>
        <Link href={`/admin/email-templates/${mal.id}/rediger`} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="external-link">Full editor</CTAPill>
        </Link>
        <Knapp ghost icon="send" disabled>
          Send test (kommer)
        </Knapp>
      </div>

      <div style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.04em", color: T.mut, marginTop: 16 }}>
        Opprettet {mal.opprettet}
      </div>
    </Kort>
  );
}

export function AdminEmailV2({ data }: { data: AdminEmailV2Data }) {
  const router = useRouter();
  const [sok, setSok] = useState("");
  const [grp, setGrp] = useState<string[]>([]);
  const [valgtId, setValgtId] = useState<string | null>(data.maler[0]?.id ?? null);
  const [editor, setEditor] = useState<EditorState>(null);

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return data.maler.filter((m) => {
      const gOk = grp.length === 0 || grp.indexOf(m.gruppe) !== -1;
      const sOk =
        q === "" ||
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q);
      return gOk && sOk;
    });
  }, [data.maler, sok, grp]);

  const valgt = filtrert.find((m) => m.id === valgtId) ?? filtrert[0] ?? null;

  const toggleGrp = (x: string) =>
    setGrp((prev) => (prev.indexOf(x) !== -1 ? prev.filter((y) => y !== x) : prev.concat(x)));

  const lukkOgOppdater = () => {
    setEditor(null);
    router.refresh();
  };

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Automatiske e-poster</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="maler.">E-post</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex">
        <span onClick={() => setEditor({ modus: "ny" })} style={{ display: "inline-flex" }}>
          <CTAPill icon="plus">Ny mal</CTAPill>
        </span>
      </div>
    </div>
  );

  // ── KPI-flis (3) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Maler totalt" value={data.total} />
      <KpiFlis label="Aktive" value={data.aktive} />
      <KpiFlis label="Grupper" value={data.grupper.length} />
    </div>
  );

  // ── Søk + gruppe-filter ───────────────────────────────────────
  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Inndata label={null} value={sok} placeholder="Søk maler — navn, emne eller slug…" onChange={setSok} />
      {data.grupper.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Caps size={9} style={{ width: 64, flex: "none" }}>Gruppe</Caps>
          <FilterChips items={data.grupper} active={grp} onToggle={toggleGrp} />
        </div>
      )}
    </div>
  );

  // ── Mal-liste ─────────────────────────────────────────────────
  const liste =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="mail"
          title="Ingen maler her"
          sub={
            data.maler.length === 0
              ? "Opprett en mal for å la agent-pipelinen sende automatiske e-poster."
              : "Ingen maler passer søket eller filteret akkurat nå."
          }
        />
      </Kort>
    ) : (
      <Kort
        eyebrow="Maler"
        action={<Caps size={9}>{pl(filtrert.length, "mal", "maler")}</Caps>}
        pad="4px 20px"
      >
        {filtrert.map((m, i) => (
          <Rad
            key={m.id}
            onClick={() => setValgtId(m.id)}
            leading={
              <span
                style={{ width: 4, height: 30, borderRadius: 9999, background: m.active ? T.lime : T.border, flex: "none" }}
                aria-hidden
              />
            }
            title={m.name}
            sub={m.subject}
            meta={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, whiteSpace: "nowrap" }}>{m.slug}</span>
                <StatusPill tone={m.active ? "up" : "info"}>{m.active ? "Aktiv" : "Av"}</StatusPill>
              </span>
            }
            trailing={valgt?.id === m.id ? <span style={{ width: 2, height: 20, borderRadius: 2, background: T.lime, flex: "none" }} /> : undefined}
            last={i === filtrert.length - 1}
          />
        ))}
      </Kort>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Mobil-handling (skjult på desktop der den ligger i hodet) */}
      <div className="flex md:hidden">
        <span onClick={() => setEditor({ modus: "ny" })} style={{ flex: 1, display: "inline-flex" }}>
          <Knapp icon="plus" full>Ny mal</Knapp>
        </span>
      </div>

      {kpi}
      {filtre}

      {data.maler.length === 0 ? (
        liste
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
          {liste}
          {valgt && <MalDetalj mal={valgt} onEndre={() => setEditor({ modus: "endre", mal: valgt })} />}
        </div>
      )}

      <MalEditor state={editor} onLukk={() => setEditor(null)} onLagret={lukkOgOppdater} />
    </div>
  );
}
