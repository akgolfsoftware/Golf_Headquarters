# Neste steg — fra ferdig design til fungerende app (fase 6)

Skrevet 10. juli 2026. Designfasen (fase 5) er komplett: alle skjermer + Workbench + ~132
komponenter i Claude Design-prosjektet, dommer-verifisert ≥9, 0 feil. Dette er planen for å
gjøre designet til en fungerende app i 10/10-kvalitet — uten å miste noe.

## A. Forberedelse (før første byggelinje)

1. **Anders godkjenner designet** (de 6 artifact-sidene + Workbench). Godkjenning = grønt lys.
2. **Golden masters:** frys de godkjente skjermbildene per skjerm (desktop + mobil) som fasit
   byggingen diffes mot. Avvik i appen blokkerer merge.
3. **Konsistens-vakt:** lite skript som nekter rå hex utenfor tokens, ulovlige størrelser/
   radier, og lime på opp/ned-data — kjøres før hver commit (utvider dagens hex-gate).
4. **Port fundamentet til repoet:**
   - `tokens/v2/tokens.css` → `src/styles/v2-tokens.css` (verbatim, verdi for verdi).
   - v2-komponentene → `src/components/athletic/golfdata-v2/` (én komponent per fil, samme
     API som mockupen; behold golfdata/ til overgangen er ferdig).
   - `docs/redesign-v2/hjelpetekster.md` — «?»-innhold ett sted (bygges her).
   - Verifiser: `npx prisma validate && tsc --noEmit && npm run build` grønt.

## B. Byggerekkefølge — bølge for bølge (hver: Vercel-preview + skjermbilde-diff → Anders)

1. **PlayerHQ kjerneløkka** — Hjem · Plan · Gjør/Live · Analysere (5 faner, TrackMan per kølle) · Meg. Mest daglig verdi.
2. **Workbench** (coach + spiller) — flaggskipet: tidslinje-kalender, palett, balanse, DnD, gjentakelse, fysisk-spor, mål-spor.
3. **AgencyOS** — Cockpit · Stall · Triage · Kalender (serier) · Grupper (egentrening).
4. **Øvelsesbank + booking + DataGolf + tester-scorekort.**
5. **Auth · onboarding (profilbilde+ambient) · profil · innstillinger · forelder.**
6. **Marketing** (akgolf.no).

## C. Per skjerm i byggingen (done-kriterier)

- Port 1:1 fra godkjent mockup med EKTE data (ingen datalag-/skjema-endring).
- Komponer KUN fra golfdata-v2; mangler noe → meld gap, aldri ad-hoc.
- «?»-hjelp + ordbok håndhevet (aldri egne ord).
- `npm run verify` + eslint + tester grønt.
- Skjermbilde-diff mot golden master (desktop + mobil) → diff ≈ 0.
- ak-designekspert-dom ≥9 (wireframe + 6 akser).
- Oppdater MASTER-SKJERMPLAN-raden (6 haker) i samme commit.
- Dataliv realiseres her (count-up/draw-in/motion — vises ikke i statiske mockups).

## D. Parallelle spor (egne jobber, ikke blokkerende for B)

- **AI-golf-coach:** bygg agent-ekspertene (SG · TrackMan · treningsdata-mot-tester/turnering)
  på appens agent-OS per `ai-coach-arkitektur.md`, fase F2 (tekstdata) → F3 (video-MVP).
  MORAD-kunnskap fra Toshiba indekseres når disken kobles til.
- **Additive datamodell-tillegg** (per gotcha-regelen, CREATE TABLE IF NOT EXISTS):
  utviklingsplan-merge (strukturerte milepæler), fysisk-logging (tonnasje/volum),
  gamification-tabeller om nødvendig. Aldri migrate dev/db push.
- **Fysisk treningsplan** (workbench-plan §11): SettRepsLogger/tonnasje/intervall-soner i
  Workbench-byggingen (bølge 2).

## E. Utrulling

Bølge for bølge merge til main + Vercel deploy (Anders' valg). Appen blir gradvis ny;
gammelt/nytt uttrykk sameksisterer i noen uker. Hver bølge Anders-godkjent før merge.

## Rekkefølge / anbefaling

A (forberedelse) → B1 (PlayerHQ) som første synlige verdi → B2 (Workbench) → resten.
AI-coach (D) startes parallelt med B1. Golden masters + konsistens-vakt (A2–A3) gjøres
straks etter godkjenning så byggingen har fasit fra første skjerm.
