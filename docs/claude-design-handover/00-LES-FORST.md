# LES FØRST — Claude Design handover, AK Golf HQ (nytt design)

> Dette er inngangen. Les denne, så dokumentene i rekkefølge under. Du skal designe et **helt nytt visuelt uttrykk** for hele AK Golf HQ — en elite golf-coaching-plattform.

---

## 0. De fem absolutte reglene (gjelder ALT)

1. **STILL MEG SÅ MANGE SPØRSMÅL SOM MULIG.** Ikke anta. Ved flere tolkninger, eller når et visuelt valg kan påvirke en funksjon — spør Anders før du designer.
2. **IKKE OVERSTYR WORKBENCH.** Anders designer Workbench-flyten selv (funksjon, hva-er-hva, hva-gjør-hva). Du skinner det visuelt rundt — der noe kan kollidere med Workbench: spør først.
3. **INGEN DØDE KNAPPER.** Hver knapp har en destinasjon/handling. Hver kjernehandling ≤ 2 trykk, med tydelig «neste steg». (Liste over dagens døde knapper: `50-FLYT-DODE-KNAPPER.md`.)
4. **RIKE, DATA-DREVNE, GAMIFISERTE KOMPONENTER.** Vis data/kunnskap/fremgang på en kul, interaktiv og givende måte (elite-gamification, aldri barnslig). Full liste: `20-KOMPONENT-SPEC.md`.
5. **ALLE TILSTANDER** på hver dataflate: innhold · tomt · laster (skeleton) · feil.

---

## 1. Det eneste som er LÅST: lime

**Lime #D1F843** er signaturfargen og skal være den distinkte accenten (primær-CTA, aktiv tilstand, KPI-puls, fokus) — krydder, aldri store flate felt, aldri lime tekst på lime. **ALT ANNET er fritt** (tema, bakgrunn, typografi, komponentstil).

---

## 2. Valgt visuell retning: HYBRID

Anders har valgt hybrid-retningen. Se den live: **https://akgolf-redesign.vercel.app** (kort «D · Hybrid»).

- **PlayerHQ (spiller, mobil-først):** lys, varm editorial-grunn (cream), lesbar i sol — men ladet med «terminal-energi» i data-øyeblikkene (mono-tall, hairline-linjer, tette KPI-celler, elektrisk lime). **Med lys/mørk-bryter** (lys er standard).
- **AgencyOS (coach, desktop + mobil):** mørk «terminal»-cockpit (nær-svart forest), tett data, lime som eneste signal på aktive rader/positive deltaer. **Bakgrunns-rutenett skal være KNAPT synlig** (et hint, ikke et tydelig nett) — rad-/celle-hairlines organiserer dataene.
- **Lime binder de to uttrykkene sammen** til ett merke.
- **Forelder + Marketing:** lys, samme DNA som PlayerHQ.

Komponent-laben (interaktive eksempler) ligger som kort «E · Komponent-lab» på samme lenke.

---

## 3. Slik leser du pakka

| Fil | Hva |
|---|---|
| `00-LES-FORST.md` | Denne — reglene + valgt retning |
| `10-MASTER-BRIEF.md` | Full design-spec: produkter, filosofi, tema, flyter, låste beslutninger |
| `20-KOMPONENT-SPEC.md` | Komplett komponent-bibliotek (eksisterende + nye data-visninger + gamification) |
| `30-PROMPT-PAKKE.md` | Ferdige prompts per spor (PlayerHQ/AgencyOS/Forelder/Auth/Marketing) |
| `40-SKJERM-INVENTAR.md` | Det rene skjermsettet (404 ruter → ~150–180 unike) |
| `50-FLYT-DODE-KNAPPER.md` | Knapp-kartlegging + døde knapper som MÅ løses |

---

## 4. Slik bruker du den i Claude Design

1. Last opp alle disse dokumentene til prosjektet (+ åpne den live hybrid-lenken som visuell referanse).
2. Lim inn PREAMBELEN fra `30-PROMPT-PAKKE.md`, og sett `{VALGT RETNING}` = Hybrid (se §2).
3. Start på ett spor (anbefalt rekkefølge: PlayerHQ → AgencyOS → Forelder → Auth → Marketing). Stats-plattformen er eget spor senere.
4. **Bekreft forståelse og still spørsmålene dine FØR du designer.**

---

## 5. Konvensjoner (alltid)

- Norsk bokmål, «du»-tiltale. Tall i JetBrains Mono, norsk format («48,3», «48 %», 24t `14:30`).
- Ingen emoji — kun Lucide-ikoner (24px, 1.5px stroke).
- Demo-navn: spiller = **Øyvind Rohjan** (initialer ØR, HCP 4,2), coach = **Anders Kristiansen**. (Ekte coach «Markus Røinås Pedersen» på markedssider beholdes.)
- Abonnement: **GRATIS** eller **PRO** (300 kr/mnd). Aldri «ELITE». «Performance / Performance Pro» = coaching-pakker, ikke app-nivåer.
- FYS-testresultater = plassholder-tall (formelen er ikke låst).
