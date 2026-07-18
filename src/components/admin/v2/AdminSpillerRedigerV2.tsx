import Link from "next/link";
import { Caps, Kort, Knapp, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { AdminSlettSpillerKnappV2 } from "./AdminSlettSpillerKnappV2";
import { lagreSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

/**
 * AgencyOS — Rediger spiller (`/admin/spillere/[id]/rediger`), v2-port
 * 16. juli 2026. 2-kol form med sticky lagre-bar topp + bunn.
 * Endrings-historikk høyre. Samme server action (lagreSpiller) uendret.
 */

export interface RedigerForelder {
  id: string;
  navn: string;
  relasjon: string;
}
export interface RedigerHistorikk {
  id: string;
  datoLabel: string;
  handling: string;
  aktorNavn: string | null;
}
export interface AdminSpillerRedigerV2Data {
  spillerId: string;
  spillerNavn: string;
  fornavn: string;
  etternavn: string;
  fodselsdatoYmd: string;
  telefon: string;
  epost: string;
  hjemmeklubb: string;
  skole: string;
  klassetrinn: string;
  hcpInput: string;
  ambisjon: string;
  foreldre: RedigerForelder[];
  historikk: RedigerHistorikk[];
}

function Felt({ label, name, defaultValue, type = "text", required, hint }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>
        {label}
        {required && <span style={{ color: T.down }}> *</span>}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        style={{ display: "block", width: "100%", marginTop: 6, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" }}
      />
      {hint && <span style={{ display: "block", marginTop: 4, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{hint}</span>}
    </label>
  );
}

function SelectFelt({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        style={{ display: "block", width: "100%", marginTop: 6, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/** Lagre-knapp utenfor <form>-taggen (sticky bars) — bruker form-attributtet
 *  som Knapp ikke støtter, samme visuelle stil som Knapp. */
function LagreKnapp({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      form="rediger-form"
      className="v2-press v2-focus"
      style={{ appearance: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.onLime, background: T.lime, border: "1px solid transparent", borderRadius: 9999, padding: "10px 18px", cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

function FeltOmraade({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue: string; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        style={{ display: "block", width: "100%", marginTop: 6, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px", fontSize: 13, color: T.fg, outline: "none", resize: "vertical", boxSizing: "border-box" }}
      />
      {hint && <span style={{ display: "block", marginTop: 4, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{hint}</span>}
    </label>
  );
}

export function AdminSpillerRedigerV2({ data }: { data: AdminSpillerRedigerV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: `color-mix(in srgb, ${T.bg} 95%, transparent)`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${T.border}`, padding: "10px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Link href={`/admin/spillere/${data.spillerId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut, textDecoration: "none" }}>
              <Icon name="arrow-left" size={12} />
              {data.spillerNavn} · Rediger
            </Link>
            <h1 style={{ margin: "4px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 24, color: T.fg }}>
              Rediger <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>spiller</em>
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/admin/spillere/${data.spillerId}`}>
              <Knapp ghost>Avbryt</Knapp>
            </Link>
            <LagreKnapp>Lagre</LagreKnapp>
          </div>
        </div>
      </div>

      <form id="rediger-form" action={lagreSpiller} style={{ gap: T.gap, alignItems: "start" }} className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
        <input type="hidden" name="id" value={data.spillerId} />

        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort>
            <Caps>Personalia</Caps>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 14 }}>
              <Felt label="Fornavn" name="fornavn" defaultValue={data.fornavn} required />
              <Felt label="Etternavn" name="etternavn" defaultValue={data.etternavn} />
              <Felt label="Fødselsdato" name="fodselsdato" type="date" defaultValue={data.fodselsdatoYmd} />
              <Felt label="Telefon" name="telefon" defaultValue={data.telefon} />
              <Felt label="E-post" name="email" type="email" defaultValue={data.epost} required />
              <Felt label="Hjemmeklubb" name="hjemmeklubb" defaultValue={data.hjemmeklubb} />
              <Felt label="Skole / VGS" name="skole" defaultValue={data.skole} />
              <SelectFelt
                label="Klassetrinn"
                name="klassetrinn"
                defaultValue={data.klassetrinn}
                options={[
                  { value: "", label: "Ikke satt" },
                  { value: "VG1", label: "VG1" },
                  { value: "VG2", label: "VG2" },
                  { value: "VG3", label: "VG3" },
                ]}
              />
              <Felt label="HCP" name="hcp" defaultValue={data.hcpInput} hint="Bruk komma · f.eks 4,8 eller +0,5" />
            </div>
          </Kort>

          <Kort>
            <Caps>Coaching</Caps>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              <Felt label="Ambisjon" name="ambisjon" defaultValue={data.ambisjon} hint="Hva spilleren jobber mot — vises i hero" />
              <FeltOmraade label="Interne notater" name="notater" defaultValue="" hint="Kun coach ser dette" />
            </div>
          </Kort>

          <Kort>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <Caps>Foresatte</Caps>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{data.foreldre.length}</span>
            </div>
            {data.foreldre.length === 0 ? (
              <div style={{ borderRadius: 10, border: `1px dashed ${T.border}`, background: T.panel2, padding: 16, fontSize: 13, color: T.mut }}>Ingen foresatte registrert.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.foreldre.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.navn}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>{p.relasjon}</div>
                    </div>
                    <Link href={`/admin/spillere/${data.spillerId}/profil`} style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.lime, textDecoration: "none" }}>
                      Rediger →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: T.gap }} className="lg:sticky lg:top-32 lg:self-start">
          <Kort>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <Caps>Endrings-historikk</Caps>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{data.historikk.length}</span>
            </div>
            {data.historikk.length === 0 ? (
              <div style={{ borderRadius: 10, border: `1px dashed ${T.border}`, background: T.panel2, padding: 14, fontSize: 12, color: T.mut }}>Ingen endringer ennå.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.historikk.map((h) => (
                  <div key={h.id} style={{ borderLeft: `2px solid ${T.border}`, paddingLeft: 14 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>{h.datoLabel}</div>
                    <div style={{ marginTop: 2, fontSize: 13, color: T.fg }}>{h.handling}</div>
                    {h.aktorNavn && <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.mut }}>av {h.aktorNavn}</div>}
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </aside>
      </form>

      <div style={{ position: "sticky", bottom: 0, zIndex: 20, background: `color-mix(in srgb, ${T.bg} 95%, transparent)`, backdropFilter: "blur(6px)", borderTop: `1px solid ${T.border}`, padding: "10px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <AdminSlettSpillerKnappV2 spillerId={data.spillerId} spillerNavn={data.spillerNavn} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/admin/spillere/${data.spillerId}`}>
              <Knapp ghost>Avbryt</Knapp>
            </Link>
            <LagreKnapp>Lagre endringer</LagreKnapp>
          </div>
        </div>
      </div>
    </div>
  );
}
