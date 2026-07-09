# Kvalitetsplan v2 — fra 4/10 til 10/10 (Anders' krav 9. juli 2026)

Gjelder BÅDE komponentbiblioteket (126 stk) og skjermene (bølge 1+ ). Nivå 1 = grunnplanen
(10 steg). Nivå 2 = det som skiller «pent» fra «verdensklasse» — art direction per skjerm.

## Nivå 1 — grunnkvalitet (komponenter)

1. **Tilstander:** standard/hover/fokus/trykket/tom/laster/feil per komponent; tilstandsgalleri = diff-kontrakt.
2. **Dataliv:** count-up på tall, draw-in på grafer/barer, puls på live, hover-verdi på alle grafer; reduced-motion respekteres. Ett bevegelsesspråk: 180 ms, cubic-bezier(0.2,0,0,1).
3. **Interaksjonspolish:** hover-løft, press-scale 0,98, chip-inn; alt trykkbart ser trykkbart ut.
4. **Robusthet:** stress-galleri m/ verstefall (lange navn, ekstreme tall, tomt, 40-lister).
5. **Mobil-motparter:** UkeGrid↔UkeListe, DataTabell↔KortListe, TidsGrid↔Agenda; 44 px mål.
6. **Typografi:** én skala, tabulære tall, konsekvent caps-sporing, optisk trim av hero-tall.
7. **Kontrast/a11y-bevis:** automatisk AA-matrise, tastatur på faner/velgere/⌘K, fokusring.
8. **Konsistens-vakt:** skript nekter rå hex utenfor tokens, ulovlige størrelser, lime på opp/ned.
9. **Designdommer-pass** per familie mot referansebildene + Mobbin-prinsippene.
10. **Golden masters:** fryste galleri-bilder per familie = fase 6-fasit; avvik blokkerer.

## Nivå 2 — art direction (det som tar skjermene til 10/10)

11. **Graf-motor v2.** WBVIZ-lånegrafen erstattes av egen ChartV2: horisontale gridlinjer,
    y-akse-verdier, x-etiketter, gradient-fyll, glød på linjen, endepunkt m/ halo,
    baseline-strek. Krypto-/Whoop-referansenes grafkvalitet — ikke «strek på flate».
12. **Dybdesystem.** Elevation på mørk flate: 1px innvendig topp-highlight
    (rgba(255,255,255,0.04)), myk stor skygge (0 12px 32px rgba(0,0,0,0.35)),
    vignett-gradient i canvas-toppen (svak forest-glød). Kortene skal FØLES lagdelt.
13. **Ett hero-øyeblikk per skjerm.** Art direction-regel: hver skjerm har ÉN visuell helt
    (størst, tint, glød) — alt annet trapper bevisst ned i to nivåer. Lesesrekkefølgen skal
    kunne tegnes med én pil.
14. **Spacing-rytme.** 8pt-rytme håndhevet: seksjonsavstand 28, kortpadding 20, radavstand
    11; eyebrow → innhold alltid 12–14. Ujevn luft er hovedårsaken til «4/10-følelsen».
15. **Koreografert entré.** Skjermens elementer animerer inn i rekkefølge (hero → KPI →
    lister, 40 ms stagger) — én gang, aldri loop.
16. **Detalj-laget.** Avrundede tall-badges med hairline, delikate skillelinjer (aldri
    heltrukne kanter overalt), ikonstrøk 1,5 px konsekvent, prikk-teksturer med ekte
    tilfeldighet (seeded), score-farger på Scorekort.
17. **Dommer-rubrikk med tallkarakter.** ak-designekspert scorer hver skjerm 1–10 mot
    Anders' referansebilder på: hierarki · typografi · dybde · grafkvalitet · rytme ·
    detaljer. Ingen skjerm leveres under 9. Gap → fiks → re-score (maks 3 runder, deretter
    eskaleres til Anders med konkret valg).
18. **Referanse-side-ved-side.** Hver skjerm rendres ved siden av nærmeste Mobbin-/Anders-
    referanse i dommer-runden — «ser vår ut som deres klasse?» er spørsmålet.

## Nivå 0 — WIREFRAME-DISIPLIN (Anders 10. juli: «forbedre wireframing»)

Kommer FØR all visuell polish. En skjerm får ikke visuell dom før wireframen står.
Wireframe = struktur/proporsjon/informasjonsrekkefølge, ikke farger. Sjekkliste per skjerm:

- **Ingenting klippes.** Hvert element ligger innenfor sin container; ingen tekst/chip/knapp
  kuttes av panelkant. Grids bruker `minmax()`/`auto-fit` og `min-width:0` på barn — aldri
  faste bredder som overflower. Test: skjermbilde i full høyde, søk etter avkuttede kanter.
- **Én ramme.** En skjerm-komponent returnerer INNHOLD, aldri sin egen app-ramme/sidebar —
  ramma settes ett sted (Skjerm). Dobbel chrome = wireframe-feil, ikke stilfeil.
- **Kolonnebalanse.** Side-om-side-kort/paneler har bevisst høyderelasjon (align-items:start
  eller lik høyde) — aldri én kort halv-tom mens nabo er full.
- **Ingen død luft.** Innhold fyller høyden det får, eller sentreres bevisst. Stor tom
  bunnflate = layouten er ikke ferdig tenkt.
- **Overlays overlapper ikke innhold.** Popover/tooltip/meny plasseres så de ikke dekker
  naboceller; i demo-tilstand forankres de under/ved siden av, ikke oppå.
- **Lesesrekkefølge tegnes med én pil.** Viktigst øverst-venstre → detalj → handling. Én
  hero per skjerm (§13). Grupper som hører sammen står sammen; luft skiller grupper.
- **Proporsjon.** Kolonnebredder følger informasjonsvekten (liste bredere enn metadata),
  ikke tilfeldige fraksjoner. Faste soner (44px mål, kolonnebredder) er bevisste.
- **Responsiv wireframe.** Mobil er egen struktur (flate-skillet), ikke desktop-gridet
  stablet — verifiseres som egen wireframe.

**Håndheving:** dommer-rubrikken (§17) får «wireframe/struktur» som EGEN akse, og en skjerm
med klipping/dobbel-ramme/overlapp scores maks 5 på den aksen uansett hvor pen den er.
Wireframe-aksen må stå ≥9 før visuell finpuss teller.

## Rekkefølge

A. Steg 11+12+14 i v2-core (fundamentet — arves av ALT) → re-render bølge 1+1b.
B. Steg 13+16 skjerm for skjerm (art direction-pass) → dommer-runde (17+18) til ≥9.
C. Steg 1–5 på biblioteket (tilstander/dataliv/robusthet/mobil-motparter).
D. Steg 6–10 (finish + vakter + golden masters).

Verifisering: hver runde leveres som før/etter-bilder + dommer-score per skjerm.

## ÆRLIG STATUS 10. juli (svar på «er alt 10/10 nå?»): NEI — her er gapet

**Komponentene (126):** komplette, render-verifisert 0 feil, følger tokens/ordbok/logo.
MEN kvalitetsplanens nivå 1 er IKKE kjørt på dem: mangler tilstander (hover/fokus/tom/
laster/feil), dataliv (count-up/draw-in — kun grafen har fått §11), robusthet (stress-test
lange navn/ekstreme tall/40-lister), mobil-motparter, kontrast/a11y-bevis, konsistens-vakt.
Ærlig nivå nå: ~8/10, ikke 10/10.

**Wireframe per skjerm:** dommer kjørt på 20 fase-5-skjermer (snitt 8,5), 6 strukturbrudd
rettet. MEN wireframe-aksen (§ nivå 0) er ikke systematisk verifisert på ALLE skjermer,
og bølge 1/1b-skjermene er ikke re-dommert etter §11–12-løftet. Ikke bevist 10/10 overalt.

## NESTE STEG (etter wb-forenkle) — rekkefølge til ekte 10/10

1. **Wireframe-audit av ALT** (nivå 0): dommer m/ egen wireframe-akse på alle skjermer +
   komponentgalleriene → fikslista → rett → re-dommer til struktur-akse ≥9 overalt. (Først —
   struktur før polish, Anders' regel.)
2. **Komponent-kvalitetspass** (nivå 1): tilstander + dataliv + robusthet på alle 126 i ett
   tilstands-/stress-galleri; mobil-motparter der de mangler. Dommer per familie ≥9.
3. **Art direction-pass** (nivå 2, §13/16) skjerm for skjerm → dommer-rubrikk ≥9 per skjerm.
4. **Konsistens-vakt + golden masters** (§8/§10): skript nekter rå hex/feil størrelser/lime-
   på-data; fryste galleri-bilder = fase 6-fasit.
5. **Anders' fase 5-godkjenning** → **fase 6: bygging i appen** bølge for bølge (Vercel-
   preview, full skjermbilde-diff mot golden master, «?»-hjelp + ordbok håndhevet).
Leveres som før/etter + dommer-score per runde. Ingenting kalles 10/10 før dommer-aksen
beviser det.
