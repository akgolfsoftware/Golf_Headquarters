"use client";

/**
 * Foreldreportal · Barn — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-02 Barn.dc.html
 * (+ FO-02L Barn lys.dc.html — lys/mørk gjøres av tokens).
 * Kort per koblet barn: avatar 44 + fornavn 20/700, pyramide-snapshot
 * (fasitens faste trappeform — dataene bæres av Økter-tallet), øktantall
 * 34/700, «Neste økt» og «Utestående» som 74px-etikettlinjer. Skoletid-
 * bekreftelsen (D6, ekte action) beholdes som egen seksjon i kortet —
 * tillegg utover fasiten, notert i PR-en.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bekreftSkoletidAction } from "@/app/forelder/barn/skoletid-actions";
import type { PyramidArea } from "@/generated/prisma/client";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoKort,
  FoAvatar,
  FoChevron,
  FoCtaSekundar,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-presisjon";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export type SkoletidVisning = {
  semesterVisning: string;
  /** «20.12» — til «gjelder til …» etter bekreftelse. */
  semesterSlutt: string;
  status: { bekreftet: boolean; tekst: string; bekreftetAt?: Date };
  blokker: { dager: string; fra: string; til: string }[];
};

export type ForelderBarnRad = {
  id: string;
  navn: string;
  avatarUrl: string | null;
  relationship: string;
  hcp: number | null;
  /** Fra dateOfBirth — kun vist når fødselsdato er kjent. */
  alder: number | null;
  /** Ekte GuardianConsent-felt (User.guardianConsentGivenAt != null). */
  samtykkeGitt: boolean;
  /** «Koblet 12.03.2026» — ParentRelation.createdAt, server-formatert. */
  koblet: string | null;
  /** Barnets hjemmeklubb (User.homeClub) — null når ukjent. */
  klubb: string | null;
  /** Fullførte økter siste 30 dager. */
  okter30d: number;
  /** Pyramide-fordeling (apex→base), verdi = antall økter. */
  pyramide: { akse: PyramidArea; value: number }[];
  /** Neste planlagte/aktive økt («Lør 29.08 · 09.00»), server-formatert. */
  nesteOkt: string | null;
  /** Utestående beløp («1 450,00 kr»), server-formatert. */
  utestaaende: string;
  /** D6 · skoletid for inneværende semester. Null = flaten er ikke koblet. */
  skoletid?: SkoletidVisning | null;
};

export type ForelderBarnData = {
  barn: ForelderBarnRad[];
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
  /** «26.08.2026» — dagens dato, server-formatert til undertittelen. */
  dagensDato?: string;
};

/* ── Pyramide-snapshot — fasitens faste trappeform (FO-02) ─────────── */

const PYRAMIDE_TRINN: { bredde: string; opacity: number }[] = [
  { bredde: "36%", opacity: 1 },
  { bredde: "52%", opacity: 0.8 },
  { bredde: "68%", opacity: 0.62 },
  { bredde: "84%", opacity: 0.44 },
  { bredde: "100%", opacity: 0.28 },
];

function PyramideSnapshot() {
  return (
    <div className="fo-pyramide" aria-hidden>
      {PYRAMIDE_TRINN.map((t) => <i key={t.bredde} style={{ width: t.bredde, opacity: t.opacity }} />)}
    </div>
  );
}

function EtikettLinje({ label, verdi }: { label: string; verdi: string }) {
  return (
    <p className="fo-etikett"><span>{label}</span><span>{verdi}</span></p>
  );
}

/* ── D6 · skoletidsbekreftelse (ekte action — beholdt fra før porten) ── */

function SkoletidSeksjon({ barnId, skoletid }: { barnId: string; skoletid: SkoletidVisning }) {
  const [sender, setSender] = useState(false);
  const [status, setStatus] = useState(skoletid.status);

  return (
    <div className="fo-skille">
      <FoCaps>Skoletid · {skoletid.semesterVisning}</FoCaps>
      <p className="fo-meta">
        {status.bekreftet ? `Bekreftet · gjelder til ${skoletid.semesterSlutt}` : status.tekst}
      </p>
      {!status.bekreftet && (
        <div style={{ marginTop: 10 }}>
          <FoCtaSekundar
            disabled={sender}
            onClick={async () => {
              setSender(true);
              const res = await bekreftSkoletidAction(barnId);
              setSender(false);
              if (res.ok) {
                setStatus({ bekreftet: true, tekst: "Bekreftet", bekreftetAt: new Date() });
                toast.success(res.melding || "Skoletid bekreftet for semesteret");
              } else {
                toast.error(res.melding || "Noe gikk galt. Prøv igjen.");
              }
            }}
          >
            {sender ? "Bekrefter …" : "Bekreft skoletid"}
          </FoCtaSekundar>
        </div>
      )}
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBarnV2({ data }: { data: ForelderBarnData }) {
  const router = useRouter();
  const { barn, parentName, dagensDato } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  const antallTekst =
    barn.length === 1
      ? "Ett koblet barn"
      : barn.length === 2
        ? "To koblede barn"
        : `${barn.length} koblede barn`;

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Barn"
        under={dagensDato ? `${antallTekst} · ${dagensDato}` : antallTekst}
      />

      {barn.length === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : (
        barn.map((b) => {
          const barnFornavn = b.navn.split(" ")[0] ?? b.navn;
          return (
            <FoKort key={b.id} pad="18px" style={{ marginTop: 14 }}>
              <button type="button" className="fo-person" onClick={() => router.push(`/forelder/barn/${b.id}`)}>
                <FoAvatar navn={barnFornavn} />
                <div>
                  <p className="fo-navn">{barnFornavn}</p>
                  <p className="fo-meta">
                    {[b.koblet ? `Koblet ${b.koblet}` : null, b.klubb].filter(Boolean).join(" · ") || b.relationship}
                  </p>
                </div>
                <FoChevron />
              </button>
              {!b.samtykkeGitt ? (
                <p className="fo-meta">Vi mangler samtykket ditt — kontoen åpnes ikke før det er bekreftet. Se Samtykke-siden.</p>
              ) : (
                <>
                  <div className="fo-person">
                    <div>
                      <FoCaps>Pyramide · 30 dager</FoCaps>
                      <PyramideSnapshot />
                    </div>
                    <div>
                      <FoCaps>Økter</FoCaps>
                      <p className="fo-metric">{b.okter30d}</p>
                      <p className="fo-meta">30 dager</p>
                    </div>
                  </div>
                  <div className="fo-skille">
                    <EtikettLinje label="Neste økt" verdi={b.nesteOkt ?? "Ingen planlagt"} />
                    <EtikettLinje label="Utestående" verdi={b.utestaaende} />
                  </div>
                  {b.skoletid && <SkoletidSeksjon barnId={b.id} skoletid={b.skoletid} />}
                </>
              )}
            </FoKort>
          );
        })
      )}

      <FoFotnote>
        Du ser plan, oppmøte og betaling. Trening, samtaler og analyse er
        mellom barnet og coachen.
      </FoFotnote>
    </FoSkjerm>
  );
}
