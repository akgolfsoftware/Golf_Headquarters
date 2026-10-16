import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnArbeidskontekst, hentTnProtokollbibliotek, hentTnProtokolldetalj } from "@/lib/domain/tn-arbeidsflate";
import type { TnField, TnKind } from "@/lib/portal-tester/tn-catalog";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnEtikett, TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnKorttittel, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-15 Testprotokoller, liste og detalj på samme skjerm.
 * Fasit: docs/design-system/utkast-tn/plan-fag.html, skjermene Testprotokoller og Én protokoll (pakke 5).
 *
 * Avvik:
 *   - Katalogen har én versjon for hele batteriet, ikke én per protokoll.
 *     Versjonen står øverst, og versjonsloggen per protokoll er tatt bort.
 *   - Formål, utstyr, gjennomføringssteg og ansvarlig trener finnes ikke i
 *     protokollkilden. Detaljen viser det kilden har: forsøk, målavstander,
 *     registreringsfelt og kildeområdet i scorekortet.
 *   - «Landslagsstandard» er målavstandene i protokollen, ikke nivåkrav.
 *     Nivåkrav står på Referansenivåer.
 *   - «Bruk i fellestesting» åpner testføringen i PlayerHQ, der målingen faktisk
 *     lagres.
 */

const TYPENAVN: Record<TnKind, string> = {
  near: "Nærspill",
  carry: "Carry",
  putts: "Putting",
  course: "Bane",
  "free-course": "Bane",
  "length-putt": "Lengdeputt",
  points: "Poeng",
  gate: "Port",
  speed: "Hastighet",
  technique: "Teknikk",
};

function format(felt: TnField) {
  if (felt.choices) return felt.choices.join(" / ");
  if (felt.unit) return felt.integer ? `Heltall, ${felt.unit}` : `Tall, ${felt.unit}`;
  return felt.integer ? "Heltall" : "Tall";
}

export async function TnTestprotokollerSkjerm({ sokeparametre, valgtId }: { sokeparametre: Record<string, string | string[] | undefined>; valgtId?: string }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();

  const bibliotek = hentTnProtokollbibliotek();
  const status = sokeparametre.status === "klar" ? "KLAR" : sokeparametre.status === "utkast" ? "UTKAST" : null;
  const liste = bibliotek.rader.filter((p) => !status || p.status === status);
  const valgtParam = valgtId ?? (Array.isArray(sokeparametre.valgt) ? sokeparametre.valgt[0] : sokeparametre.valgt);
  const detalj = valgtParam ? hentTnProtokolldetalj(valgtParam) : liste[0] ? hentTnProtokolldetalj(liste[0].id) : null;
  if (valgtId && !detalj) notFound();

  const statusParam = status?.toLowerCase();
  const adresse = (endring: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ status: statusParam, valgt: detalj?.id, ...endring }).filter((e): e is [string, string] => Boolean(e[1])));
    return `/team-norway/protokoller${p.size ? `?${p.toString()}` : ""}`;
  };
  const feltene = detalj ? [...new Map(detalj.rows.flatMap((r) => r.fields).map((f) => [f.key, f])).values()] : [];
  const maal = detalj ? detalj.rows.filter((r) => r.target !== undefined) : [];

  return (
    <SkjermRamme aktiv="protokoller" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode overlinje={`Versjon ${bibliotek.versjon}`} tittel="Testprotokoller" ingress="De nasjonale testene slik de skal gjennomføres. Bare protokoller med status Klar kan brukes i fellestesting." />

      <TnFilterknapper
        etikett="Filtrer på status"
        valg={[
          { href: adresse({ status: undefined, valgt: undefined }), label: "Alle", aktiv: status === null, antall: bibliotek.rader.length },
          { href: adresse({ status: "klar", valgt: undefined }), label: "Klar", aktiv: status === "KLAR", antall: bibliotek.rader.filter((p) => p.status === "KLAR").length },
          { href: adresse({ status: "utkast", valgt: undefined }), label: "Utkast", aktiv: status === "UTKAST", antall: bibliotek.rader.filter((p) => p.status === "UTKAST").length },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 20, alignItems: "start" }}>
        <section aria-label="Protokoller" style={{ background: TN.white, border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.sm, minWidth: 0 }}>
          {liste.map((p) => {
            const aktiv = p.id === detalj?.id;
            return (
              <Link
                key={p.id}
                href={adresse({ valgt: p.id })}
                scroll={false}
                aria-current={aktiv ? "true" : undefined}
                style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", minHeight: 56, padding: "10px 16px", borderBottom: `1px solid ${TN.ink200}`, borderLeft: `3px solid ${aktiv ? TN.red600 : "transparent"}`, background: aktiv ? TN.navy50 : TN.white, textDecoration: "none", color: TN.textPrimary }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{p.navn}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: TN.ink500, marginTop: 2 }}>{p.forsok} forsøk · {TYPENAVN[p.omrade]}</span>
                </span>
                <TnPille tone={p.status === "KLAR" ? "green" : "amber"}>{p.status === "KLAR" ? "Klar" : "Utkast"}</TnPille>
              </Link>
            );
          })}
          {liste.length === 0 ? <div style={{ padding: 16 }}><TnMangler>Ingen protokoller med denne statusen.</TnMangler></div> : null}
        </section>

        <TnFlate>
          {detalj ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <TnKorttittel overlinje={`${TYPENAVN[detalj.kind]} · ${bibliotek.versjon}`} tittel={detalj.name} />
                <TnPille tone={detalj.blocked ? "amber" : "green"}>{detalj.blocked ? "Utkast" : "Klar"}</TnPille>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 1, background: TN.ink200, border: `1px solid ${TN.ink200}`, marginTop: 18 }}>
                {[
                  ["Forsøk", String(detalj.rows.length)],
                  ["Type", TYPENAVN[detalj.kind]],
                  ["Målavstander", maal.length ? String(maal.length) : "—"],
                ].map(([etikett, verdi]) => (
                  <div key={etikett} style={{ background: TN.white, padding: "12px 14px", minWidth: 0 }}>
                    <div style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 22, color: TN.navy900, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{verdi}</div>
                    <TnEtikett style={{ marginTop: 4 }}>{etikett}</TnEtikett>
                  </div>
                ))}
              </div>

              <TnEtikett style={{ marginTop: 24, paddingBottom: 6, borderBottom: `1px solid ${TN.ink200}` }}>Dette registreres</TnEtikett>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: "0 16px" }}>
                {["Felt", "Format"].map((k) => <TnEtikett key={k} style={{ padding: "10px 0 6px", fontSize: 10.5 }}>{k}</TnEtikett>)}
                {feltene.map((f) => (
                  <div key={f.key} style={{ display: "contents" }}>
                    <span style={{ fontSize: 14, padding: "8px 0", borderTop: `1px solid ${TN.ink200}`, overflowWrap: "anywhere" }}>{f.label}{f.optional ? " (valgfritt)" : ""}</span>
                    <span style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: TN.ink500, padding: "8px 0", borderTop: `1px solid ${TN.ink200}`, overflowWrap: "anywhere" }}>{format(f)}</span>
                  </div>
                ))}
              </div>

              {maal.length > 0 ? (
                <>
                  <TnEtikett style={{ marginTop: 24, paddingBottom: 6, borderBottom: `1px solid ${TN.ink200}` }}>Forsøk og mål</TnEtikett>
                  {maal.slice(0, 12).map((r, i) => (
                    <div key={`${i}-${r.label}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${TN.ink200}`, fontSize: 14 }}>
                      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{r.label.split(" · ")[0]}</span>
                      <span style={{ fontFamily: TN.font.mono, whiteSpace: "nowrap" }}>{String(r.target).replace(".", ",")} m</span>
                    </div>
                  ))}
                  {maal.length > 12 ? <TnFotnote>Og {maal.length - 12} forsøk til. Hele lista står i testføringen.</TnFotnote> : null}
                </>
              ) : null}

              <TnFotnote>Kilde: {detalj.source}.</TnFotnote>

              {detalj.blocked ? (
                <p style={{ margin: "18px 0 0", padding: "12px 14px", border: `1px solid ${TN.ink200}`, borderLeft: `3px solid ${TN.navy900}`, fontSize: 14, lineHeight: 1.6 }}>
                  Utkast kan ikke brukes i fellestesting ennå. {detalj.blocked}
                </p>
              ) : (
                <Link href={`/portal/tren/tester/team-norway?test=${encodeURIComponent(detalj.id)}`} style={{ marginTop: 18, minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 18px", background: TN.navy900, color: TN.white, borderRadius: TN.radius.sm, fontFamily: TN.font.body, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  Bruk i fellestesting
                </Link>
              )}
            </>
          ) : (
            <>
              <TnFlatehode tittel="Protokoll" />
              <TnMangler>Ingen testprotokoller er publisert. <Link href="/team-norway/fellestesting" style={{ color: TN.navy600, fontWeight: 700 }}>Se fellestesting</Link></TnMangler>
            </>
          )}
        </TnFlate>
      </div>
    </SkjermRamme>
  );
}
