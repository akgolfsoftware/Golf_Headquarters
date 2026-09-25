"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  WifiOff,
} from "lucide-react";


// Importer alle faktiske Precision Athletics-skjermer
import { LivePrecisionView } from "@/components/portal/live/LivePrecisionView";
import { StyrkeProgramView } from "@/components/portal/toppidrett/StyrkeProgramView";
import { SpillerProfilPrecisionView } from "@/components/portal/profil/SpillerProfilPrecisionView";
import { StallPrecisionView } from "@/components/admin/stall/StallPrecisionView";
import { ForelderPrecisionView } from "@/components/forelder/ForelderPrecisionView";
import { BookingPrecisionFlow } from "@/components/marketing/booking/BookingPrecisionFlow";
import { BookingKvitteringPrecision } from "@/components/marketing/booking/BookingKvitteringPrecision";
import { WangToppidrettPrecisionView } from "@/app/team-wang/WangToppidrettPrecisionView";
import { LoginPrecisionView } from "@/components/auth/LoginPrecisionView";
import { PersonvernPrecisionView } from "@/components/portal/profil/PersonvernPrecisionView";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

interface SkjermDefinisjon {
  id: string;
  tittel: string;
  kategori: "PLAYERHQ" | "AGENCYOS" | "FORELDER" | "BOOKING" | "WANG" | "KONTO" | "SYSTEM";
  rute: string;
  beskrivelse: string;
  testpunkter: string[];
  komponent: React.ReactNode;
}

const ALLE_SKJERMER: SkjermDefinisjon[] = [
  {
    id: "live-okt",
    tittel: "Live økt (Aktiv trening)",
    kategori: "PLAYERHQ",
    rute: "/portal/live",
    beskrivelse:
      "Aktiv treningsmodus med stoppeklokke i sanntid, oppgavesjekkliste (Wedge-treff, Pitch-spinn, Putte-stige), notater og fullføringsflyt.",
    testpunkter: [
      "Start og stopp tidsmåleren (levende sekunder)",
      "Kryss av oppgaver for å se fremdriftsindikatoren øke",
      "Skriv inn øktnotater og klikk 'Fullfør økt'",
    ],
    komponent: <LivePrecisionView />,
  },
  {
    id: "fysisk-program",
    tittel: "FYS Baseløft & Bølgeperiodisering",
    kategori: "PLAYERHQ",
    rute: "/portal/fysisk",
    beskrivelse:
      "Styrkeprogram med 6-ukers bølgeperiodisering for golf (Trapbar markløft, knebøy, benkpress, frivending), vektskive-kalkulator og 1RM-estimat.",
    testpunkter: [
      "Bytt mellom Trapbar, Knebøy, Benkpress og Frivending",
      "Endre 1RM og kroppsvekt for å se nøyaktige vekter per uke",
      "Åpne vektskive-kalkulatoren og test ulike vekter",
    ],
    komponent: <StyrkeProgramView />,
  },
  {
    id: "spillerprofil-bag",
    tittel: "Spillerprofil & 14-køllers bag",
    kategori: "PLAYERHQ",
    rute: "/portal/meg",
    beskrivelse:
      "Fullstendig oppsett for alle 14 køller i bagen med loft, skaft og kalibrert TrackMan carry-lengde i meter, samt brutto snittscore og hcp.",
    testpunkter: [
      "Se full 14-køllers oversikt fra Driver til Putter",
      "Inspiser kalibrerte TrackMan-carry-tall i meter",
      "Sjekk abonnementsstatus og brutto snittscore",
    ],
    komponent: <SpillerProfilPrecisionView navn="Magnus Kristiansen" />,
  },
  {
    id: "agencyos-stall",
    tittel: "Spillerstall & Toppidrett-OS",
    kategori: "AGENCYOS",
    rute: "/admin/spillere",
    beskrivelse:
      "Full treneroversikt over 33 spillere med Kategori A–K-filtrering, ACWR-skadeforebyggende belastningsvarsler og brutto snittscorer.",
    testpunkter: [
      "Filtrer spillere etter kategori (A, B, C...)",
      "Observer ACWR-statusflagg (grønn sone 0.8–1.3, rød fare >1.5)",
      "Klikk på en spiller for å se direkte kobling til Toppidrett-OS",
    ],
    komponent: <StallPrecisionView />,
  },
  {
    id: "forelder-portal",
    tittel: "Foreldredashboard & ACWR",
    kategori: "FORELDER",
    rute: "/forelder",
    beskrivelse:
      "Foresattvisning med ukens treninger, ACWR-belastningsskala, samtykkestyring for spillere under 16 år, klippekort, fakturaliste og 3-veis dialog.",
    testpunkter: [
      "Se ACWR-belastningsskalaen og ukens økter",
      "Test samtykkebryterne for foto og reise (lagres i sanntid)",
      "Inspiser klippekort og treveis dialog med trener",
    ],
    komponent: <ForelderPrecisionView spillerNavn="Magnus Kristiansen" />,
  },
  {
    id: "booking-flyt",
    tittel: "Booking 3-trinns veiviser",
    kategori: "BOOKING",
    rute: "/booking",
    beskrivelse:
      "Fokusert bookingflyt: Velg tjeneste (Privattime, TrackMan-analyse, Spilltime), velg tidspunkt, utøveropplysninger og bekreftelse.",
    testpunkter: [
      "Velg tjeneste og se priser/varigheter oppdatere seg",
      "Velg tilgjengelig dag og klokkeslett i kalenderen",
      "Fyll ut navn/e-post og bekreft timen",
    ],
    komponent: (
      <BookingPrecisionFlow
        lokasjon="AK Golf Performance Lab, Innesenteret"
        tjenester={[
          {
            slug: "coaching-50",
            navn: "Personlig Coaching 50 min",
            coachNavn: "Anders Kristiansen",
            pris: 1350,
            enhet: "kr",
            varighetMin: 50,
            beskrivelse: "En-til-en instruksjon med videoanalyse og TrackMan.",
          },
          {
            slug: "trackman-sving",
            navn: "TrackMan Sving- & Ballfluktanalyse",
            coachNavn: "Anders Kristiansen",
            pris: 1450,
            enhet: "kr",
            varighetMin: 50,
            beskrivelse: "Radaranalyse av svingretning, kølleblad og balltreff.",
          },
        ]}
      />
    ),
  },
  {
    id: "booking-kvittering",
    tittel: "Bookingkvittering & Kalendereksport",
    kategori: "BOOKING",
    rute: "/booking/kvittering/demo-123",
    beskrivelse:
      "Fullført booking med ett-klikks nedlasting av ekte Apple Kalender .ics-fil og forhåndsutfylt Google Kalender-lenke.",
    testpunkter: [
      "Klikk 'Legg til i Apple Kalender' for å laste ned ekte .ics-fil",
      "Klikk 'Legg til i Google Kalender' for forhåndsutfylt kalenderhendelse",
      "Se oppmøteadresse og forberedelsesinstruksjoner",
    ],
    komponent: (
      <BookingKvitteringPrecision
        bekreftet={true}
        guestEmail="spiller@akgolf.no"
        innlogget={false}
        signupHref="/auth/login"
        detaljer={{
          bestillingRef: "AK-2026-9812",
          tjeneste: "TrackMan Sving- & Ballfluktanalyse",
          dato: "Tirsdag 29. september 2026",
          klokkeslett: "14:00 – 14:50",
          sted: "AK Golf Performance Lab, Innesenteret",
          prisTekst: "1 450 kr",
          startDatoIso: "2026-09-29T14:00:00Z",
          varighetMin: 50,
        }}
      />
    ),
  },
  {
    id: "wang-toppidrett",
    tittel: "WANG Toppidrett (Plan & Fysiske tester)",
    kategori: "WANG",
    rute: "/team-wang/toppidrett",
    beskrivelse:
      "Ukeplan for morgentreninger på WANG, fraværsregistrering og 5 nasjonale benchmark-tester sammenlignet med landssnittet.",
    testpunkter: [
      "Se ukeplan for morgentreninger med fraværsmelding",
      "Registrer nye testresultater (f.eks. Trapbar 1RM eller Chins)",
      "Inspiser søylediagrammene som sammenligner mot landssnittet",
    ],
    komponent: <WangToppidrettPrecisionView />,
  },
  {
    id: "innlogging-sikkerhet",
    tittel: "Konto & Innlogging (2FA & Magisk lenke)",
    kategori: "KONTO",
    rute: "/auth/login",
    beskrivelse:
      "Sikker innlogging med magisk lenke, 6-sifret engangskode i reserve, SMS-tofaktorautentisering og Google OAuth.",
    testpunkter: [
      "Skriv e-post og se magisk lenke-bekreftelse",
      "Bytt til 6-sifret kode eller SMS-tofaktor",
      "Se feilhåndtering ved ugyldig format",
    ],
    komponent: <LoginPrecisionView />,
  },
  {
    id: "personvern-gdpr",
    tittel: "Personvern & GDPR-eksport",
    kategori: "KONTO",
    rute: "/personvern",
    beskrivelse:
      "Komplett GDPR-oversikt med ett-klikks nedlasting av ekte maskinlesbar JSON-fil og bekreftet sletteforespørsel (retten til å bli glemt).",
    testpunkter: [
      "Klikk 'Last ned mine data' for å laste ned en ekte JSON-fil",
      "Åpne sletteforespørsel-dialogen (GDPR artikkel 17)",
      "Les gjennom personvernerklæringen og lagringsperiodene",
    ],
    komponent: <PersonvernPrecisionView />,
  },
  {
    id: "system-offline-feil",
    tittel: "Systemtilstander (Offline & 404)",
    kategori: "SYSTEM",
    rute: "/offline",
    beskrivelse:
      "Sanntids nettverksovervåking (OfflineBanner) og dedikerte feilsider med Precision Athletics-typografi.",
    testpunkter: [
      "OfflineBanneret reagerer i sanntid dersom forbindelsen brytes",
      "Se 404 Ikke funnet-siden med hjelpetekst og returlenker",
    ],
    komponent: (
      <div className="space-y-8 p-6 bg-[#FAF8F3] rounded-lg border border-[#E4DFD5]">
        <div className="p-4 bg-[#F1EEE8] rounded-md border border-[#E4DFD5]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#736E65] block mb-2">
            Nettverksvarsling (simulert offline-banner)
          </span>
          <div className="bg-[#9B2415] text-[#FAF8F3] px-4 py-3 rounded text-sm font-sans flex items-center justify-between">
            <span className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" /> Du er frakoblet internett. Endringer lagres lokalt og synkroniseres når du er tilbake på nett.
            </span>
            <span className="font-mono text-xs bg-black/20 px-2 py-0.5 rounded">Offline</span>
          </div>
        </div>
        <div className="p-4 bg-[#FAF8F3] rounded-md border border-[#E4DFD5]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#736E65] block mb-2">
            404 Ikke funnet-skjerm
          </span>
          <IkkeFunnet />
        </div>
      </div>
    ),
  },
];

export default function SkjermKatalogPage() {
  const [valgtSkjermId, setValgtSkjermId] = useState<string>("live-okt");
  const [visningsModus, setVisningsModus] = useState<"mobil" | "desktop">("desktop");
  const [valgtKategori, setValgtKategori] = useState<string>("ALLE");

  const gjeldendeSkjerm =
    ALLE_SKJERMER.find((s) => s.id === valgtSkjermId) ?? ALLE_SKJERMER[0];

  const filtrerteSkjermer =
    valgtKategori === "ALLE"
      ? ALLE_SKJERMER
      : ALLE_SKJERMER.filter((s) => s.kategori === valgtKategori);

  const gjeldendeIndeks = ALLE_SKJERMER.findIndex((s) => s.id === valgtSkjermId);

  function gaaTilNeste() {
    const nesteIndeks = (gjeldendeIndeks + 1) % ALLE_SKJERMER.length;
    setValgtSkjermId(ALLE_SKJERMER[nesteIndeks].id);
  }

  function gaaTilForrige() {
    const forrigeIndeks =
      (gjeldendeIndeks - 1 + ALLE_SKJERMER.length) % ALLE_SKJERMER.length;
    setValgtSkjermId(ALLE_SKJERMER[forrigeIndeks].id);
  }

  return (
    <div className="min-h-screen bg-[#F1EEE8] text-[#141413] font-sans antialiased flex flex-col">
      {/* Sanntids offline-indikator */}
      <OfflineBanner />

      {/* Topplinje / Kontrollsenter */}
      <header className="sticky top-0 z-50 bg-[#FAF8F3] border-b border-[#E4DFD5] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Tittel */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#9B2415] text-[#FAF8F3] flex items-center justify-center font-bold font-mono text-sm shadow-xs">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-[#141413]">
                  AK Golf HQ · Skjermkatalog
                </h1>
                <span className="bg-[#FAF8F3] text-[#736E65] text-[11px] font-mono border border-[#E4DFD5] px-2 py-0.5 rounded-full">
                  Precision Athletics
                </span>
              </div>
              <p className="text-xs text-[#736E65]">
                Fasit: Claude Design <span className="font-mono text-[#141413]">7d7c2994</span> · 12 ferdigbygde moduler
              </p>
            </div>
          </div>

          {/* Kontroller: Visningsmodus (Mobil 390px / Desktop) og Blaing */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Forrige / Neste */}
            <div className="flex items-center border border-[#E4DFD5] rounded-md bg-[#FAF8F3] p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={gaaTilForrige}
                title="Forrige skjerm"
                className="p-1.5 hover:bg-[#F1EEE8] rounded text-[#736E65] hover:text-[#141413] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono text-[#736E65]">
                {gjeldendeIndeks + 1} / {ALLE_SKJERMER.length}
              </span>
              <button
                type="button"
                onClick={gaaTilNeste}
                title="Neste skjerm"
                className="p-1.5 hover:bg-[#F1EEE8] rounded text-[#736E65] hover:text-[#141413] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Enhetsvelger: Mobil 390px vs Desktop */}
            <div className="flex items-center border border-[#E4DFD5] rounded-md bg-[#FAF8F3] p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setVisningsModus("mobil")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  visningsModus === "mobil"
                    ? "bg-[#141413] text-[#FAF8F3] shadow-xs"
                    : "text-[#736E65] hover:text-[#141413]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobil (390 px)</span>
              </button>
              <button
                type="button"
                onClick={() => setVisningsModus("desktop")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  visningsModus === "desktop"
                    ? "bg-[#141413] text-[#FAF8F3] shadow-xs"
                    : "text-[#736E65] hover:text-[#141413]"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (Full)</span>
              </button>
            </div>

            {/* Direktelenke til ruten i appen */}
            <a
              href={gjeldendeSkjerm.rute}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAF8F3] bg-[#9B2415] hover:bg-[#831F12] rounded-md shadow-2xs transition-colors"
            >
              <span>Åpne {gjeldendeSkjerm.rute}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Hurtigvalg av kategori */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#E4DFD5] flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
          {[
            { id: "ALLE", label: "Alle skjermer (12)" },
            { id: "PLAYERHQ", label: "PlayerHQ (Spiller)" },
            { id: "AGENCYOS", label: "AgencyOS (Trener)" },
            { id: "FORELDER", label: "Foreldreportal" },
            { id: "BOOKING", label: "Booking & Kasse" },
            { id: "WANG", label: "WANG Toppidrett" },
            { id: "KONTO", label: "Konto & Personvern" },
            { id: "SYSTEM", label: "System & Feil" },
          ].map((kat) => (
            <button
              key={kat.id}
              type="button"
              onClick={() => setValgtKategori(kat.id)}
              className={`px-2.5 py-1 rounded whitespace-nowrap font-medium transition-colors ${
                valgtKategori === kat.id
                  ? "bg-[#E4DFD5] text-[#141413] font-semibold"
                  : "text-[#736E65] hover:bg-[#FAF8F3] hover:text-[#141413]"
              }`}
            >
              {kat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hovedvisning med sidemeny og skjermscene */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6">
        {/* Venstre meny: Liste over skjermer */}
        <aside className="w-full md:w-72 shrink-0 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#736E65] px-2 mb-2 font-semibold">
            Skjermer ({filtrerteSkjermer.length})
          </div>

          <div className="space-y-1">
            {filtrerteSkjermer.map((skjerm) => {
              const erValgt = skjerm.id === valgtSkjermId;
              return (
                <button
                  key={skjerm.id}
                  type="button"
                  onClick={() => setValgtSkjermId(skjerm.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                    erValgt
                      ? "bg-[#FAF8F3] border-[#9B2415] shadow-xs"
                      : "bg-[#FAF8F3]/60 hover:bg-[#FAF8F3] border-[#E4DFD5] text-[#736E65] hover:text-[#141413]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold ${
                        erValgt ? "text-[#141413]" : "text-[#736E65]"
                      }`}
                    >
                      {skjerm.tittel}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        erValgt
                          ? "bg-[#9B2415]/10 text-[#9B2415] font-bold"
                          : "bg-[#E4DFD5]/50 text-[#736E65]"
                      }`}
                    >
                      {skjerm.kategori}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#736E65] mt-1 truncate">
                    {skjerm.rute}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Infokort om designautoritet */}
          <div className="mt-6 p-3.5 bg-[#FAF8F3] rounded-lg border border-[#E4DFD5] text-xs text-[#736E65] space-y-2">
            <div className="flex items-center gap-1.5 text-[#141413] font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#9B2415]" />
              <span>Designautoritet 2026</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Alle skjermene følger <strong>Precision Athletics</strong> med IBM Plex Sans og Mono, 8 px radius, sand-palett og rustrøde aksenter.
            </p>
            <div className="pt-1 border-t border-[#E4DFD5] text-[10px] font-mono flex items-center justify-between">
              <span>Tokenkontroll:</span>
              <span className="text-[#0D6338] font-bold">100 % grønn</span>
            </div>
          </div>
        </aside>

        {/* Hovedscene: Den valgte skjermen */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Informasjonsbanner om den aktive skjermen */}
          <div className="mb-4 bg-[#FAF8F3] border border-[#E4DFD5] rounded-lg p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#141413]">
                    {gjeldendeSkjerm.tittel}
                  </h2>
                  <span className="text-xs font-mono bg-[#E4DFD5] text-[#141413] px-2 py-0.5 rounded">
                    {gjeldendeSkjerm.rute}
                  </span>
                </div>
                <p className="text-xs text-[#736E65] mt-1">
                  {gjeldendeSkjerm.beskrivelse}
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href={gjeldendeSkjerm.rute}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#9B2415] hover:underline font-mono"
                >
                  <span>Direkterute</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Testpunkter */}
            <div className="mt-3 pt-3 border-t border-[#E4DFD5]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#736E65] font-semibold block mb-1.5">
                Hva du kan teste her:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {gjeldendeSkjerm.testpunkter.map((punkt, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-1.5 text-xs text-[#141413]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6338] shrink-0 mt-0.5" />
                    <span>{punkt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ramme rundt skjermen: Mobilramme (390px) eller Desktop (Full bredde) */}
          <div className="flex-1 flex justify-center items-start">
            {visningsModus === "mobil" ? (
              <div className="w-[390px] min-h-[780px] bg-[#FAF8F3] border-[6px] border-[#141413] rounded-[36px] shadow-2xl overflow-hidden flex flex-col my-2 ring-1 ring-black/10">
                {/* iPhone Dynamic Island / Høyttaler */}
                <div className="h-6 bg-[#141413] flex items-center justify-center shrink-0">
                  <div className="w-20 h-3 bg-black rounded-full" />
                </div>
                {/* Skjerminnhold på mobil */}
                <div className="flex-1 overflow-y-auto">
                  {gjeldendeSkjerm.komponent}
                </div>
                {/* Hjem-indikatorlinje */}
                <div className="h-4 bg-[#FAF8F3] flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-[#141413]/30 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#FAF8F3] border border-[#E4DFD5] rounded-xl shadow-xs overflow-hidden">
                {gjeldendeSkjerm.komponent}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
