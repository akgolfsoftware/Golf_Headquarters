/**
 * AgencyOS · Drill-detalj — v2 (retning C «Presis»). Erstatter hand-Tailwind
 * (lokale Card/Stat/Row/NgfRangePlot-hjelpere) med v2-primitivene. Full
 * feltdekning fra ExerciseDefinition beholdt uendret — kun visuell restyling.
 */

import Link from "next/link";
import { Caps, Tittel, Kort } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 6,
        fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
        background: accent ? `color-mix(in srgb, ${T.lime} 16%, transparent)` : T.panel2,
        border: `1px solid ${accent ? "transparent" : T.border}`,
        color: accent ? T.lime : T.fg2,
      }}
    >
      {children}
    </span>
  );
}

export type AdminDrillDetaljCsTarget = { kategori: string; verdi: number };
export type AdminDrillDetaljPrereq = { id: string; navn: string };

export type AdminDrillDetaljV2Data = {
  id: string;
  navn: string;
  disiplinLabel: string;
  skillLabel: string | null;
  morad: boolean;
  kilde: string | null;
  brukAntall: number;
  beskrivelse: string | null;
  coachNotater: string | null;
  ngfOrder: string[];
  minKategori: string | null;
  maxKategori: string | null;
  minHcp: number | null;
  maxHcp: number | null;
  csTarget: AdminDrillDetaljCsTarget[];
  varighetMin: number | null;
  intensitet: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
  lPhasePrimary: string | null;
  environment: string[];
  utstyr: string[];
  lPhases: string[];
  prerequisites: AdminDrillDetaljPrereq[];
  tags: string[];
  videoUrl: string | null;
};

function NgfRangePlot({ ngfOrder, min, max }: { ngfOrder: string[]; min: string | null; max: string | null }) {
  const minIdx = min ? ngfOrder.indexOf(min) : 0;
  const maxIdx = max ? ngfOrder.indexOf(max) : ngfOrder.length - 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", height: 8, borderRadius: 9999, overflow: "hidden", background: T.panel2 }}>
        {ngfOrder.map((_, i) => {
          const inRange = i >= minIdx && i <= maxIdx;
          return (
            <span
              key={i}
              style={{
                flex: 1,
                background: inRange ? `linear-gradient(90deg, ${T.forest}, ${T.lime})` : "transparent",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 10, color: T.mut }}>
        {ngfOrder.map((k, i) => (
          <span key={k} style={{ fontWeight: i >= minIdx && i <= maxIdx ? 700 : 400, color: i >= minIdx && i <= maxIdx ? T.fg : T.mut }}>
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

function Rad({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>{label}</span>
      <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>{label}</span>
      <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

export function AdminDrillDetaljV2({ data, actions }: { data: AdminDrillDetaljV2Data; actions: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Link href="/admin/drills" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>
        <Icon name="arrow-left" size={12} />
        Tilbake til biblioteket
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>
            {data.disiplinLabel}
            {data.skillLabel ? ` · ${data.skillLabel}` : ""}
          </Caps>
          <div style={{ marginTop: 8 }}>
            <Tittel>{data.navn}</Tittel>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.morad && (
              <Chip accent>
                <Icon name="star" size={11} style={{ marginRight: 4 }} />
                MORAD
              </Chip>
            )}
            {data.kilde && <Chip>{data.kilde}</Chip>}
            <Chip>Brukt i {data.brukAntall} økt(er)</Chip>
          </div>
        </div>
        {actions}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: T.gap, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Beskrivelse">
            {data.beskrivelse ? (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg, whiteSpace: "pre-wrap" }}>{data.beskrivelse}</p>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen beskrivelse lagret.</p>
            )}
          </Kort>

          {data.coachNotater && (
            <Kort eyebrow="Coach-notater">
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg2, fontStyle: "italic", whiteSpace: "pre-wrap" }}>{data.coachNotater}</p>
            </Kort>
          )}

          <Kort eyebrow="Nivå-range">
            <NgfRangePlot ngfOrder={data.ngfOrder} min={data.minKategori} max={data.maxKategori} />
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <Stat label="Min kategori" value={data.minKategori ?? "–"} />
              <Stat label="Max kategori" value={data.maxKategori ?? "–"} />
              <Stat label="HCP min" value={data.minHcp !== null ? String(data.minHcp) : "–"} />
              <Stat label="HCP max" value={data.maxHcp !== null ? String(data.maxHcp) : "–"} />
            </div>
          </Kort>

          {data.csTarget.length > 0 && (
            <Kort eyebrow="csTarget per NGF-kategori">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {data.csTarget.map((c) => (
                  <Rad key={c.kategori} label={c.kategori} value={String(c.verdi)} />
                ))}
              </div>
            </Kort>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Default oppsett">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Rad label="Varighet" value={data.varighetMin ? `${data.varighetMin} min` : "–"} />
              <Rad label="Intensitet" value={data.intensitet !== null ? `${data.intensitet}/10` : "–"} />
              <Rad label="Sets" value={data.defaultSets ? String(data.defaultSets) : "–"} />
              <Rad label="Reps" value={data.defaultReps ? String(data.defaultReps) : "–"} />
              <Rad label="repsSets-tekst" value={data.defaultRepsSets ?? "–"} />
              <Rad label="csMin/Max" value={data.csMin !== null || data.csMax !== null ? `${data.csMin ?? "–"} / ${data.csMax ?? "–"}` : "–"} />
              <Rad label="lPhase (primary)" value={data.lPhasePrimary ?? "–"} />
            </div>
          </Kort>

          <Kort eyebrow="Environment">
            {data.environment.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.environment.map((e) => (
                  <Chip key={e}>{e}</Chip>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen.</p>
            )}
          </Kort>

          <Kort eyebrow="Utstyr">
            {data.utstyr.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {data.utstyr.map((u) => (
                  <li key={u} style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>
                    · {u}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Intet utstyr.</p>
            )}
          </Kort>

          <Kort eyebrow="L-faser">
            {data.lPhases.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.lPhases.map((p) => (
                  <Chip key={p} accent>{p}</Chip>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen.</p>
            )}
          </Kort>

          {data.prerequisites.length > 0 && (
            <Kort eyebrow="Prerequisites">
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {data.prerequisites.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/drills/${p.id}`} style={{ fontFamily: T.ui, fontSize: 13, color: T.lime }}>
                      {p.navn}
                    </Link>
                  </li>
                ))}
              </ul>
            </Kort>
          )}

          {data.tags.length > 0 && (
            <Kort eyebrow="Tags">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>
            </Kort>
          )}

          {data.videoUrl && (
            <Kort eyebrow="Video">
              <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.ui, fontSize: 13, color: T.lime, wordBreak: "break-all" }}>
                {data.videoUrl}
              </a>
            </Kort>
          )}
        </div>
      </div>
    </div>
  );
}
