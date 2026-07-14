"use client";

/**
 * AgencyOS v2 — Rediger spiller (`/admin/spillere/[id]/rediger`, AgencyOS
 * Bølge 1.4, 2026-07-14). Port fra `(legacy)/spillere/[id]/rediger/page.tsx` +
 * `slett-spiller-knapp.tsx` — samme `lagreSpiller`/`slettSpiller`-kontrakt.
 *
 * `lagreSpiller` er en ekte HTML-form-action (FormData → void, kaster +
 * redirect() ved suksess) — feltene her er derfor UKONTROLLERTE native
 * `<input name=… defaultValue=…>` v2-skinnet med samme stil som
 * `DrillSkjemaFelter`/`NyOvelseArk`, ikke de kontrollerte `skjema.tsx`-
 * primitivene (som mangler `name` og ville krevd en omskriving av actionen).
 */

import type { CSSProperties, ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tittel, Kort, Knapp, BunnArk, T } from "@/components/v2";
import { lagreSpiller, slettSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

const feltStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

function Etikett({ children }: { children: ReactNode }) {
  return <span style={{ display: "block", marginBottom: 7, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2 }}>{children}</span>;
}

function Felt({ label, name, defaultValue, type = "text", required, hint }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <Etikett>{label}{required && <span style={{ color: T.down }}> *</span>}</Etikett>
      <input type={type} name={name} defaultValue={defaultValue} required={required} style={feltStil} />
      {hint && <span style={{ display: "block", marginTop: 6, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{hint}</span>}
    </label>
  );
}

function SelectFelt({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <label style={{ display: "block" }}>
      <Etikett>{label}</Etikett>
      <select name={name} defaultValue={defaultValue} style={{ ...feltStil, cursor: "pointer" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function FeltOmraade({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue: string; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <Etikett>{label}</Etikett>
      <textarea name={name} defaultValue={defaultValue} rows={4} style={{ ...feltStil, resize: "vertical" }} />
      {hint && <span style={{ display: "block", marginTop: 6, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{hint}</span>}
    </label>
  );
}

function SlettSpillerKnappV2({ spillerId, spillerNavn }: { spillerId: string; spillerNavn: string }) {
  const router = useRouter();
  const [apen, setApen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const bekreft = () => {
    setFeil(null);
    startTransition(async () => {
      const res = await slettSpiller(spillerId);
      if (res.ok) router.push("/admin/spillere");
      else setFeil(res.error ?? "Sletting feilet. Prøv igjen.");
    });
  };

  return (
    <>
      <Knapp ghost icon="trash" onClick={() => setApen(true)}>Slett spiller</Knapp>
      {apen && (
        <BunnArk tittel="Slett spiller" under={spillerNavn} onLukk={() => setApen(false)} laast={pending}>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.6, margin: "12px 0 0" }}>
            Spilleren fjernes fra stallen og mister tilgang. Dataene beholdes og kan gjenopprettes via support. Vil du fortsette?
          </p>
          {feil && <p style={{ marginTop: 10, fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Knapp ghost onClick={() => setApen(false)} disabled={pending}>Avbryt</Knapp>
            <Knapp icon="trash" onClick={bekreft} disabled={pending}>{pending ? "Sletter…" : "Slett spiller"}</Knapp>
          </div>
        </BunnArk>
      )}
    </>
  );
}

export interface AdminSpillerRedigerV2Data {
  id: string;
  navn: string;
  fornavn: string;
  etternavn: string;
  fodselsdatoYmd: string;
  telefon: string;
  email: string;
  hjemmeklubb: string;
  skole: string;
  klassetrinn: string;
  hcpTekst: string;
  ambisjon: string;
  historikk: { id: string; tidspunkt: string; action: string; aktorNavn: string | null }[];
  foresatte: { id: string; navn: string; relasjon: string }[];
}

export function AdminSpillerRedigerV2({ id, navn, fornavn, etternavn, fodselsdatoYmd, telefon, email, hjemmeklubb, skole, klassetrinn, hcpTekst, ambisjon, historikk, foresatte }: AdminSpillerRedigerV2Data) {
  return (
    <form action={lagreSpiller} style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 900 }}>
      <input type="hidden" name="id" value={id} />

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Link href={`/admin/spillere/${id}`} style={{ textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {navn} · Rediger
          </Link>
          <div style={{ marginTop: 6 }}><Tittel em="spiller">Rediger</Tittel></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/spillere/${id}`} style={{ textDecoration: "none" }}><Knapp ghost>Avbryt</Knapp></Link>
          <Knapp icon="check" type="submit">Lagre</Knapp>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: T.gap }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Kort eyebrow="Personalia">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <Felt label="Fornavn" name="fornavn" defaultValue={fornavn} required />
              <Felt label="Etternavn" name="etternavn" defaultValue={etternavn} />
              <Felt label="Fødselsdato" name="fodselsdato" type="date" defaultValue={fodselsdatoYmd} />
              <Felt label="Telefon" name="telefon" defaultValue={telefon} />
              <Felt label="E-post" name="email" type="email" defaultValue={email} required />
              <Felt label="Hjemmeklubb" name="hjemmeklubb" defaultValue={hjemmeklubb} />
              <Felt label="Skole / VGS" name="skole" defaultValue={skole} />
              <SelectFelt label="Klassetrinn" name="klassetrinn" defaultValue={klassetrinn} options={[{ value: "", label: "Ikke satt" }, { value: "VG1", label: "VG1" }, { value: "VG2", label: "VG2" }, { value: "VG3", label: "VG3" }]} />
              <Felt label="HCP" name="hcp" defaultValue={hcpTekst} hint="Bruk komma · f.eks 4,8 eller +0,5" />
            </div>
          </Kort>

          <Kort eyebrow="Coaching">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Felt label="Ambisjon" name="ambisjon" defaultValue={ambisjon} hint="Hva spilleren jobber mot — vises i hero" />
              <FeltOmraade label="Interne notater" name="notater" defaultValue="" hint="Kun coach ser dette" />
            </div>
          </Kort>

          <Kort eyebrow="Foresatte">
            {foresatte.length === 0 ? (
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>Ingen foresatte registrert.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {foresatte.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px" }}>
                    <div>
                      <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{p.navn}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{p.relasjon}</div>
                    </div>
                    <Link href={`/admin/spillere/${id}/profil`} style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.lime, textDecoration: "none" }}>Rediger →</Link>
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </div>

        <div style={{ minWidth: 0 }}>
          <Kort eyebrow="Endrings-historikk">
            {historikk.length === 0 ? (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0 }}>Ingen endringer ennå.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {historikk.map((h) => (
                  <div key={h.id} style={{ borderLeft: `2px solid ${T.border}`, paddingLeft: 12 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{h.tidspunkt}</div>
                    <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 13, color: T.fg }}>{h.action}</div>
                    {h.aktorNavn && <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.mut }}>av {h.aktorNavn}</div>}
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, position: "sticky", bottom: 0, paddingTop: 14, paddingBottom: "max(14px, env(safe-area-inset-bottom))", background: `linear-gradient(0deg, ${T.bg} 60%, transparent)` }}>
        <SlettSpillerKnappV2 spillerId={id} spillerNavn={navn} />
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/spillere/${id}`} style={{ textDecoration: "none" }}><Knapp ghost>Avbryt</Knapp></Link>
          <Knapp icon="check" type="submit">Lagre endringer</Knapp>
        </div>
      </div>
    </form>
  );
}
