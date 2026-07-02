# DEL 2 — KODE-handover

> **Hvem dette er for:** Claude Code (og enhver som bygger appen i den ekte kodebasen).
> **Spørsmålet denne delen svarer på:** *Hvilke ruter finnes, hvilken knapp går hvor, hva er ødelagt, og hva må bygges for lansering?*
>
> Dette er det ene av to handover-spor. Det andre er `DEL-1-DESIGN.md` (utseende, UX, «slik skal det se ut»).

---

## Start her (i rekkefølge)

1. **`NAVIGASJON-knapp-til-rute.md`** — kode-verifisert fasit: hver knapp → destinasjon, **alle 406 ruter**,
   + fiks-liste **A1–A5** (ekte 404-bugs) + foreldreløse skjermer + dublett/stale-konsolidering. **Dette er
   navigasjonssannheten — implementér mot den, ikke mot minnet.**
2. **`TOKENS.css`** — speil designtokens inn i kodebasen (CSS-variabler). `--lime #D1F843` er låst.
3. **`COPY-ordbok.md`** — all tekst hardkodes/i18n-es herfra (begreper, knappetekst, forbudt-liste).
4. **`TESTBATTERI.md`** — 20 tester, PEI-formel, benchmark-nivåer, scoring (for test-/analyse-backend).
5. For utseendet du bygger mot: kryss-referer **`DEL-1-DESIGN.md`** (skjermbilder + kildefiler).

## Nav-bugs som må fikses (ekte 404 i dag — lav risiko, høy verdi)

| # | Hvor (kildekode) | Problem | Fiks |
|---|---|---|---|
| **A1** | `src/app/api/admin/search/route.ts:62` | Cmd+K «Innstillinger» → `/admin/innstillinger` (finnes ikke) | → `/admin/settings` |
| **A2** | `src/app/api/admin/search/route.ts:64` | Cmd+K «Meldinger» → `/admin/meldinger` (finnes ikke) | → `/admin/innboks` |
| **A3** | `src/app/admin/tester/page.tsx:199` | «Tildel» → `/admin/tester/tildel` (finnes kun `/[spillerId]`) | velg spiller først / spiller-velger |
| **A4** | `src/app/portal/booking/[bookingId]` (~248) | «Alt er klart» → `/bekreftet` uten `?bookingId=` → `notFound()` | send med `bookingId` |
| **A5** | `global-search` + `api/portal/search` | Lenker til gammel `/portal/analyse` (stale) | → `/portal/analysere` |

> A1–A2 + A5 er rene streng-bytter. Full kontekst + foreldreløse + dubletter står i `NAVIGASJON-knapp-til-rute.md` DEL 2.

## IA-beslutninger som blokkerer (avklar med Anders før bygg)

- **Foreldreløse skjermer** (bygget, ingen knapp peker dit): koble inn i nav eller pensjoner. Liste i
  `NAVIGASJON-knapp-til-rute.md` DEL 2-B.
- **Dubletter/stale flater** (f.eks. `/admin/calendar*`, 3× «kalender», 3× «mine bookinger», Stats-nav
  aldri montert): konsolider til kanonisk rute. Liste i DEL 2-C.
- **Workbench**: funksjon avklares med Anders — skinnes kun visuelt. Kanonisk fil:
  `../Workbench Komplett Hub.dc.html`.

## Lanserings-sjekkliste (backend/drift — krever beslutninger, ikke design)

- [ ] **Betaling:** Full betaling flyttet til **1. august** (bekreftet). Stripe live-nøkler + webhooks før da.
- [ ] **Abonnement:** GRATIS / PRO **300 kr/mnd** (ingen årlig). «ELITE» vises aldri. (Anders 2026-06-24: 300/mnd er fasit — designets «299 / 2 690/år» er feil.)
- [ ] **GDPR:** mindreårige → forelder-samtykke påkrevd (`/auth/guardian-consent/[token]`), forelderportal aktiv.
- [ ] **Regresjon / mock-strategi / formler** (PEI, FYS): åpne — krever produkteier-avklaring.
- [ ] **DNS / SPF / domene** (akgolf.no): åpne — drift.
- [ ] Alle fire datatilstander per flate: innhold · tom · laster (skeleton) · feil. Ingen døde knapper.

## Filene i dette sporet

| Fil | Hva |
|---|---|
| `NAVIGASJON-knapp-til-rute.md` | Kode-verifisert knapp → skjerm, alle 406 ruter + bugs A1–A5 + foreldreløse + dubletter. |
| `TOKENS.css` | Designtokens speiles inn i kodebasen. `--lime #D1F843` låst. |
| `COPY-ordbok.md` | All tekst: begreper, knappetekst, forbudt-liste, persona-data. |
| `TESTBATTERI.md` | 20 tester, PEI-formel, benchmark-nivåer, scoring. |
| `NAV-DIAGRAM.html` | (delt med Del 1) visuelt nav-kart — nyttig for å se konsekvensen av en rute-endring. |

*Utseende på skjerm-nivå hører til `DEL-1-DESIGN.md`. Begge spor holdes i sync med appens nav-filer
(`bottom-nav.tsx`, `portal/sidebar.tsx`, `admin-nav.ts`, `agencyos/_tab-nav.tsx`).*
