# W2 — komponent-manifest: PlayerHQ Analysere

**Skrevet:** 2026-08-06 · **Status:** UTKAST — venter på Anders' godkjenning før noe tegnes.
**Formål:** pilot for det nye steget mellom «Konsolideringsgate» og «Tegn i batch»
(`docs/port/skjermplan-tegnet-og-wireframe.md` §Metode per bølge) — en skriftlig,
godkjennbar plan for *hvilke komponenter* en skjerm skal ha, *før* noen bruker tid på
å tegne piksler i Claude Design. Malkategoriene er §5–12 i `docs/port/monsterdokument-paper.md`.

---

## 0. Konsolideringsfunn FØR noe annet — tallet «40 uten fasit» er stale

`docs/port/fasit-liste-paper.md` (05.08) oppgir «PlayerHQ · Analysere: 41 ekte skjermer,
1 har fasit, 40 uten» — hentet fra den gamle skjermplanen som ble slettet 05.08.2026.

**Verifisert mot faktisk kode i dag:** kun **3 ruter** finnes i det hele tatt under
`/portal/analys*`:

| Rute | Linjer | Reelt |
|---|---:|---|
| `/portal/analyse` | 9 | **Stub** — ren `redirect("/portal/analysere")`, ikke en skjerm |
| `/portal/analysere` | 33 | Reell — 5-fane analyseflate, **har fasit** (`playerhq-analyse.html`) |
| `/portal/analysere/hull` | 156 | Reell — hull-for-hull-analyse, **uten fasit** |

Altså: **1 reell skjerm uten fasit**, ikke 40. Samme mønster som W1 (der «31/35
gjenstående» ble målt ned til 11 etter faktisk triage) — den gamle skjermplanens
tall telte trolig faner/tilstander i 5-fane-flaten som egne rader, ikke ekte URL-er.

**Konsekvens:** før W2 «tegnes» i noen skala, bør `scripts/paper-port-triage.mjs`
kjøres på nytt for hele Analysere-området (og resten av W2/W3/W4/W5 — samme
overtellingsfeil kan gjelde der også) — ellers planlegges det mot spøkelsestall.
Dette dokumentet dekker de 2 reelle rutene som faktisk finnes.

---

## 1. `/portal/analysere` — allerede fasit-dekket, port ikke ferdig verifisert

**Fasit:** `fase1/playerhq-analyse.html` · **Malkategori:** §11 dashbord-rutenett
(5 faner over et sett dashbord-paneler) · **Bredde:** 720px PlayerHQ-kolonne.

| Komponent | Bruk | Kilde |
|---|---|---|
| `Tabs` | 5 faner (avvik A3-notatet sier fasit har 3, koden bevisst beholder 5 — «behold funksjoner»-prinsippet, se `plan-designport-alle-skjermer.md` §Avviksliste A3) | §10-grensetest: «`Tabs` bytter *hva* du ser» |
| `CardGrid` | dashbord-paneler per fane (SG-nedbrytning, trend, kategori) | §11 |
| `KpiStripe` | toppstripe med sesong-KPI-er | §11 |
| «Én ting nå»-blokk (`.nowblock`) | «Legg inn [område]-økt denne uka» — finnes i koden (avvik A3), men uten det låste `.btn.now`-mønsteret ennå | §2 |
| `EmptyState` | manglende SG-data for en sone | §5 |

**Status:** PR #309 rettet «Én ting nå»-teksten, men fikset ikke selve `.btn.now`-mønsteret
eller bredden — samme mønster som Meg. **Denne skjermen trenger en ny, verifisert
PR mot dette manifestet**, ikke bare tekstrettelsen fra #309.

## 2. `/portal/analysere/hull` — uten fasit, bygges mot monsterdokumentet

**Malkategori:** §12 detaljside (todelt: sonekart + hull-for-hull-tabell) · **Bredde:** 720px.

| Komponent | Bruk | Begrunnelse (§-grensetest) |
|---|---|---|
| `PageHeader` | tittel «Hull-analyse» + tilbake-lenke i meta-linjen | §12 — eier sidens h1 |
| `Tabs` (2 faner) | «Sone-kart» / «Hull for hull» — bytter *hva* du ser, ikke et filter | §10-grense: `Tabs` vs `FilterPills` |
| Sone-kart-fanen: `Heatmap` (fra `components/datavis/`) | 4-sone SG-varmekart (TEE_TOTAL/TILNAERMING/AROUND_GREEN/PUTTING) | matcher `aggregerHullVarme`-dataformen i koden |
| Hull-for-hull-fanen: `DataTable` | 18 rader (hull), kolonner: hull/par/score/SG — **ikke** kort-per-hull (§9: «Det finnes intet ‘tabell blir kort’-mønster») | §9, bindende |
| `EmptyState` | ingen runde med hull-score ennå | §5 |

**Uavklart før bygging:** ingen — dette mønsteret er fullt dekket av monsterdokumentet.
Kan gå rett til tegning når Anders har godkjent manifestet.

---

## 2. Neste steg

1. **Anders godkjenner dette manifestet** (eller ber om endringer) — ingen tegning før det.
2. `scripts/paper-port-triage.mjs` kjøres på resten av W2 (Hjem-rest, 1 skjerm) + W3–W5
   FØR de planlegges i samme detalj, for å unngå å planlegge mot samme type stale tall.
3. Godkjent manifest → tegning i Claude Design (`fase2/playerhq/`) for hull-skjermen →
   batch-godkjenning → koding gjennom skjermbilde-gaten, samme prosess som W1.
4. `/portal/analysere` (allerede fasit) trenger ikke tegnes på nytt — men trenger en
   ny kode-PR som retter `.btn.now`-mønsteret og 720px-bredden, verifisert mot dette
   manifestet og fasiten, ikke bare et fargebytte slik #309 var.
