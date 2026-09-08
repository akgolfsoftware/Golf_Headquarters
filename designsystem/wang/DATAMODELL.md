# DATAMODELL — hullene, gruppert etter modell

Hver skjerm navngir sitt eget hull. Dette dokumentet samler dem **etter modell**, ikke etter
skjerm, og sier hvilken modell som låser opp flest skjermer.

## Om schema — les dette først

`prisma migrate dev`, `prisma db push` og `prisma migrate deploy` er **alle blokkert** i
`akgolfsoftware/Golf_Headquarters`. Additive endringer kjøres kirurgisk med `prisma db execute`.

**Modellene under er forslag, ikke migrasjoner.** De skal leses som «dette er feltene skjermene
faktisk bruker», og oversettes til additive `ALTER TABLE` / `CREATE TABLE` én modell om gangen.
Ingen skjerm i pakken forutsetter en destruktiv endring.

---

## Rekkefølge — hva som låser opp flest skjermer

| # | Modell | Låser opp | Skjermer |
|---|---|---|---|
| 1 | **Skoleregister** (`Skole`) | 12 | D1–D12 · og skolevelgeren i alle batch-skjermer |
| 2 | **Foresatt** | 5 | B5, D6, D7, D8, og lesetilgang i B3/C5 |
| 3 | **Timeplan per skole** (`Klasse`, `Fag`, `Timeplan`) | 4 | C9, D4, D5, D6 |
| 4 | **Protokoll og testresultat med kilde** | 5 | B1, B2, B3, B8, C5 |
| 5 | **Samling med uttak** | 3 | B9, C2, D2 |
| 6 | **Periode og plan** | 2 | D9, D10 |
| 7 | **Kandidat med vurderingspunkter** | 3 | D1, D2, D3 |
| 8 | **Gruppepost og melding** | 2 | D7, D8 |
| 9 | **Foreldremøte** | 1 | D6 |
| 10 | **Invitasjon** | 1 | D12 |
| 11 | **Plasser** | 2 | D2, D3 |
| 12 | **Oppmøte** | 1 | B8 |

Skoleregisteret er både størst og først: uten det er «skole» en tekststreng i tolv skjermer, og
tilgangsregelen «en trener ved én WANG-skole skal aldri se en annen skoles elever» kan ikke
håndheves i det hele tatt.

---

## 1 · Skoleregister — `Skole`

**Skjermer som venter:** D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12 — og skolevelgeren
(`.swb`) som står i toppen av alle batch-skjermene.

**Finnes fra før:** ingenting. Flaten antar i dag én WANG.

**Trengs:**

| Felt | Type | Merknad |
|---|---|---|
| `id` | id | |
| `navn` | string | «Toppidrett Fredrikstad», «WANG Ung Oslo» |
| `type` | enum | `TOPPIDRETT` \| `UNG` — styrer hvilket trinnsett velgeren viser |
| `trinnsett` | enum | `VG1_VG3` \| `TRINN_8_10` |
| `sted` | string | |
| `aktiv` | boolean | |

Kobling: `Gruppe.skoleId`, `Bruker`-rolle per skole (se §11), `Klasse.skoleId`,
`Timeplan.skoleId`, `Kandidat`s `SkoleInteresse.skoleId`.

**Åpent:** om skoleregisteret eies av WANG sentralt eller speiles fra et eksternt
administrasjonssystem. Det avgjør om D2/D11 er editorer eller visninger.

---

## 2 · Foresatt

**Skjermer som venter:** B5 (dokumenter delt med foresatte), D6 (påmelding og oppmøte per hjem),
D7 (lesekvittering per mottaker), D8 (lesetilgang og postsperren). Påvirker også B3 og C5, som
begge sier «foresatt ser samme tall».

**Finnes fra før:** ingenting. Dette er det samme hullet som blokkerte B5 i batch 1.

**Trengs:**

| Felt | Type | Merknad |
|---|---|---|
| `id` | id | |
| `brukerId` | ref | Egen innlogging, ikke elevens |
| `elevId` | ref | Flere foresatte per elev, flere elever per foresatt |
| `relasjon` | enum | `FORESATT_1` \| `FORESATT_2` \| `ANNEN` |
| `lesetilgang` | utledet | **Utledes av elevens fødselsdato, aldri lagret som bryter** |

**Krever:** `fødselsdato` på elev. Det er ikke sikret i dag, og uten det kan ikke lesetilgangen
falle bort automatisk ved 18. Det er ikke en innstilling noen skal kunne slå på igjen (D8).

**Åpent:** hva som skjer med historikk når lesetilgangen faller bort — blir gamle tråder
utilgjengelige, eller bare nye meldinger.

---

## 3 · Timeplan per skole — `Klasse`, `Fag`, `Timeplan`, `TimeplanUnntak`

**Skjermer som venter:** C9 (elevens visning), D4 (føring), D5 (prøveplan), D6 (trinnvalg).

**Finnes fra før — og kan utvides:** `SchoolScheduleEntry` har `dato`, `klassetrinn` og
kategoriene `TIME`, `PRØVE`, `HELDAGSPRØVE`, `EKSAMEN`, `FERIE`.
Den mangler **skole**, **klokkeslett** og **fag**.
`klassetrinn` finnes som `VG1`–`VG3` på brukeren, men **ikke 8., 9. og 10. trinn** — det må
utvides før noen WANG Ung-skjerm kan bygges.

**Trengs, additivt på `SchoolScheduleEntry`:**

| Felt | Type | Merknad |
|---|---|---|
| `skoleId` | ref | Blokkerer i dag |
| `fraTid` / `tilTid` | time | Klokkeslett mangler helt |
| `fagId` | ref | Se `Fag` |
| `rom` | string | |
| `laererId` | ref | Lærerregister mangler |

**Nye modeller:**

- `Klasse` — `skoleId`, `skolear`, `trinn`, `navn` («VG2A»), `kontaktlaererId`, elevforhold.
- `Fag` — **felles katalog for alle WANG-skoler**. `navn`, `kode`, `type`
  (`FELLESFAG` \| `TOPPIDRETT` \| `VALGFAG`).
- `Timeplan` (ukemal) — `klasseId`, `skolear`, `ukedag`, `fraTid`, `tilTid`, `fagId`, `rom`,
  `laererId`.
- `TimeplanUnntak` — `dato`, `malId`, `nyVerdi` eller `avlyst`, `begrunnelse`. Begrunnelsen følger
  med til elevens visning.

**Utvid `klassetrinn`-enumet** med `TRINN_8`, `TRINN_9`, `TRINN_10`.

**Åpent:** om timeplanen importeres fra skolens administrative system i stedet for å føres i D4.
Det avgjør om D4 er editor eller visning.

---

## 4 · Protokoll og testresultat med kilde

**Skjermer som venter:** B1 (føring), B2 (protokollbibliotek), B3 (resultatliste), B8 (elev-ark),
C5 (IUP med kildelinje).

**Finnes fra før:** `testResult` er kontrakten i `coach/iup/[elevId]/page.tsx`. Den har verdien.
Den mangler **hvor verdien kommer fra**.

**Trengs, additivt på `TestResult`:**

| Felt | Type | Merknad |
|---|---|---|
| `protokollVersjonId` | ref | Hvilken versjon tallet ble målt under |
| `maaltAv` | ref | Bruker |
| `maaltDato` | datetime | Ikke det samme som `createdAt` |
| `anledning` | string | «Testdag», «Hospitering», «Testrunde» |
| `erEstimat` | boolean | Estimat skal merkes som estimat, aldri blandes med målte tall |

**Nye modeller:**

- `Protokoll` — `navn`, `eierOrganisasjon` (AK Golf / WANG / Team Norway), `aktivVersjonId`.
- `ProtokollVersjon` — `protokollId`, `versjon`, `opprettet`, `laastVed` (tidspunkt for første
  førte tall). **Låst versjon kan ikke endres, bare avløses.** Gamle tall beholder sin versjon.
- `Ovelse` — `protokollVersjonId`, `navn`, `enhet`, `antallForsok`, `besteAv`
  (`HOYESTE` \| `LAVESTE` \| `INGEN`), `retning`.
- `Testdag` — `gruppeId`, `protokollVersjonId`, `dato`, `fortAv`, `laast`.

**Kritisk:** kildelinjen er én delt komponent, ikke fem (`PORTING.md` §3). Bygg den først.

---

## 5 · Samling med uttak — `Samling`, `Uttak`

**Skjermer som venter:** B9 (oversikt), C2 (detalj med uttak), D2 (samlinger på tvers av skoler).

**Finnes fra før:** samlingsukene i `_data/arsplan-fasit-2026-27.ts` — kun som uke-etiketter i
årshjulet, uten detalj og uten uttak.

**Trengs:**

- `Samling` — `navn`, `skoleId` eller `felles`, `skolear`, `fraDato`, `tilDato`, `sted`,
  `program` (dag → formiddag/ettermiddag), `publisert`, `publisertAv`, `publisertDato`.
- `Uttak` — `samlingId`, `elevId`, `tattUt` (boolean), `grunn` (fritekst — vises til eleven selv,
  aldri til de andre), `svar` (`JA` \| `KAN_IKKE` \| `IKKE_SVART`).
- `Samling.kriterium` — fritekst. **Uttaket kan ikke publiseres uten kriterium.** Det er ikke en
  validering av rettferdighet, men et krav om at grunnen står skrevet.

**Åpent:** hvem som eier en fellessamling mellom to skoler, og hvem som kan publisere den.

---

## 6 · Periode og plan — `Periode`, `Manedsplan`

**Skjermer som venter:** D9 (periodeplan), D10 (månedsplan).

**Finnes fra før:** ingenting. Årshjulets faser (`TURN`, `GRUNN`, `SPES`, `TEST`) er hardkodet
fasittekst i `_data/arsplan-fasit-2026-27.ts`, ikke en modell.

**Trengs:**

- `Periode` — `gruppeId`, `skoleId`, `skolear`, `type` (**åpen liste, ikke enum med atferd** —
  GRUNN, SPES, TURN er navn, ikke regler), `fraDato`, `tilDato`, `mal[]`, `plantVolum` per
  kategori. Overlapp mellom perioder er tillatt og skal ikke valideres.
- `Manedsplan` — `gruppeId`, `aarMaaned`, `fokus` (fritekst), `plantVolum` per kategori,
  `begrunnelse` (valgfri, med forfatter og dato). **Månedsnivået er valgfritt** — tom måned er en
  gyldig tilstand.
- `Mal` — fritekst med **valgfri** referanse til protokoll eller testresultat.

**Krever:** «ført volum» forutsetter `varighet` per gjennomført økt. Øktmodellen har det ikke i
dag, så avviksberegningen i D10 kan ikke bygges før den finnes.

**Ikke definert noe sted:** kategorisettet **teknikk / spill / fysisk**. Det er antatt i D9 og
D10 og må bestemmes før begge kan bygges.

---

## 7 · Kandidat med vurderingspunkter

**Skjermer som venter:** D1 (rekruttering), D2 (plasser), D3 (koordinering).

**Finnes fra før:** spilleren finnes i turneringsbasen. Ingen `Kandidat`-modell.

**Trengs:**

- `Kandidat` — `spillerId` (turneringsbasen), `skolear`, `onsketTrinn`, `notat`.
  **Kandidaten er felles på tvers av skoler.**
- `SkoleInteresse` — én rad per skole: `kandidatId`, `skoleId`, `status`
  (`FLAGGET` \| `KONTAKTET` \| `TILBUD` \| `TAKKET_JA` \| `TAKKET_NEI` \| `TRUKKET`),
  `ansvarligTrenerId`, og **tidsstempel per statusendring** med hvem som endret.
  **Vurderingen er skolebundet.** Én skole ser aldri en annens vurderingstall eller notater.
- `Vurderingspunkt` — `navn`, `vekt`, `skala`, `eier` (felles eller skole), `aktiv`.
- `Vurdering` — `kandidatId`, `skoleId`, `punktId`, `verdi`, `sattAv`, `sattDato`, `anledning`.

**Vurderingspunkt og Vurdering må være separate tabeller** slik at punktsettet kan endres uten å
ødelegge gamle tall. Et tall beholder konfigurasjonen det ble satt under.

**Skolekarakterer** er eget punkt med skolen som kilde, og krever et dokumentfelt (vitnemål) med
opplaster og dato. Dette er det ene stedet i flaten der ordet «karakterer» er riktig.

**Blokkert av beslutning:** antall punkter, navn, vekt, skala, og om skolekarakterer inngår i
summen. Se `APNE-BESLUTNINGER.md`.

**`KoordineringsTråd`** (D3) — `kandidatId`, meldinger med `avsenderSkoleId`, `tekst`,
`tidsstempel`, lesetilstand per skole. Tråden hører til kandidaten, ikke til en gruppe eller et
skoleår. Blir kandidaten elev, lukkes tråden og blir liggende som historikk.
**Personvern må avklares:** hvor mye én skole får se om en annen skoles kontakt med en
mindreårig kandidat.

---

## 8 · Gruppepost og melding

**Skjermer som venter:** D7 (oppslagstavle), D8 (post til én elev).

**Finnes fra før:** `Gruppe` finnes som treningsgruppe. Ingen postmodell.

**Trengs:**

- `GruppePost` — `forfatterId`, `gruppeId`, `tekst`, `publisert`, `redigeringshistorikk`.
  **Ingen svarfelt** — oppslagstavla er enveis.
- `Vedlegg` — `type`, `fil` eller `url`, `storrelse`, `postId`.
- `Lesekvittering` — per mottaker (elev **og** foresatt). Krever `Foresatt` (§2).
- `PostTråd` — `elevId`, `motpartId`, `skoleId`. **Post krysser ikke skoler.**
- `Melding` — `avsenderId`, `tekst`, `tidsstempel`, **uslettbar**, lesetilstand per part.

**Krever:** rolle- og tilgangsmodellen må være skolebundet (rolle per bruker × skole), noe den
ikke er når flaten antar én WANG.

**Åpent:** arkiveringsregler, lagringstid for video (D7 har 18 MB-vedlegg) og sletteregler for
filer generelt — samme åpne spørsmål som for B5.

---

## 9 · Foreldremøte

**Skjermer som venter:** D6.

**Finnes fra før:** foreldremøtedatoene i årshjulet er hardkodede `hendelse`-events. Ingen modell.

**Trengs:**

- `Foreldremote` — `skoleId`, `dato`, `fraTid`, `tilTid`, `sted`, `digitalLenke`,
  `trinn[]` (flere), `referat` (tekst, forfatter, publisertDato).
- `Agendapunkt` — `moteId`, `rekkefolge`, `tittel`, `ansvarlig`, `varighet`.
- `Pamelding` — `moteId`, `foresattId`, `svar`
  (`KOMMER` \| `DIGITALT` \| `KAN_IKKE` \| `IKKE_SVART`), `lest`, `mottDato`.

**Krever:** `Foresatt` (§2) med kobling til elev. Oppmøte registreres per hjem, ikke per person.
**Referatet publiseres manuelt** — det oppstår ikke av seg selv når møtet er over.

---

## 10 · Invitasjon

**Skjermer som venter:** D12.

**Trengs:**

- `Invitasjon` — `kanal` (`EPOST` \| `SMS`), `mottaker`, `gruppeId`, `skoleId`, `avsenderId`,
  `sendt`, `utloper`, `status` (`SENDT` \| `AAPNET` \| `KONTO_OPPRETTET` \| `UTLOPT`) med
  tidsstempel per statusendring, og en **engangsnøkkel som forbrukes**.

**Krever:** `GruppeRolle` (§11) for å avgjøre hvem som får invitere hvor.

**Må defineres:** grensen mot PlayerHQ. Hvem eier kontoen, hva WANG får tilbake ved fullført
registrering, og hva som skjer om eleven avbryter halvveis.

---

## 11 · Rolle per skole — `GruppeRolle`

**Skjermer som venter:** D11 (visningen), D12 (hvem kan invitere), og **tilgangssjekken i alle 35**.

**Finnes fra før:** `GroupMember.role`. Det er riktig sted, og det skal ikke flyttes.

**Regelen som må håndheves i kode:**

- Rollen bor på gruppen (`GroupMember.role`), **aldri** som `UserRole.COACH` på brukeren.
- Rollen er derfor implisitt skolebundet gjennom `Gruppe.skoleId` (§1).
- En bruker kan ha ulik rolle ved ulike skoler, og ingen rolle ved de andre.

D11 tegner dette eksplisitt: hver rolle ved hver skole, inkludert hva personen **ikke** når.

---

## 12 · Plasser — `Plass`

**Skjermer som venter:** D2, D3 (ledig kapasitet påvirker koordineringen).

**Trengs:**

- `Plass` — `skoleId`, `skolear`, `trinn`, `antallTotalt`, `antallFylt`, `venteliste`.

**Åpent:** om plasstallene er WANG-eide eller kommer fra skolens eget opptakssystem.

---

## 13 · Oppmøte — `Oppmote`

**Skjermer som venter:** B8.

**Trengs:**

- `Oppmote` — `elevId`, `oktId`, `status` (`MOTT` \| `AVTALT_FRAVAER` \| `IKKE_MOTT`),
  `begrunnelse`, `fortAv`.

**Oppmøte er et faktum, ikke en vurdering.** Flaten fargelegger det ikke som godt eller dårlig.
