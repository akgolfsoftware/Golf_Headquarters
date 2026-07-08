# Design-system-regel — ÉN kanon, ingen unntak

Skrevet 8. juli 2026. Erstatter og overstyrer alt design-innhold skrevet før denne datoen —
gamle regelfiler, revisjonsdokumenter og "andre kanon for driftsskjermer"-unntaket er fjernet.

## Kanon (absolutt, ikke en anbefaling)

**Kilden er det levende Claude Design-prosjektet** («AK Golf HQ Design System»,
`claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`), hentet direkte via DesignSync.
Ikke en repo-side kopi, ikke et historisk snapshot — prosjektet SELV. Ved tvil: hent filen på
nytt via DesignSync (`get_file`) fremfor å stole på hukommelse eller gamle notater.

- **Komponenter:** `src/components/athletic/golfdata/` — portet fra prosjektets `components/`.
  Én komponent per fil, én-til-én med kildens `.jsx`/`.prompt.md`-kontrakt.
- **Skjermer:** komponeres UTELUKKENDE av disse komponentene. Finnes komponenten ikke i
  prosjektet → stopp og meld gapet til Anders. Aldri ad-hoc UI, aldri en egen løsning "til
  golfdata får det".
- **Tokens:** `src/styles/golfdata-tokens.css`, synket fra prosjektets `tokens/*.css` — verdi for
  verdi, aldri oppfunnet i repoet.
- **Fonter:** Familjen Grotesk (display) · Inter (UI) · JetBrains Mono (tall). Ingen andre.
- **Ikoner:** Lucide, 1,5px strøk. Ingen emoji.

## Ingen unntak — heller ikke for "driftsskjermer"

Den tidligere beslutningen om at hånd-rullet Tailwind/shadcn-lag var en "akseptert egen kanon"
for kø/risiko/moderering/talent/kart-skjermer er **opphevet 8. juli 2026**. Det finnes ikke lenger
noe akseptert nummer-to-lag. Alle skjermer i PlayerHQ og AgencyOS skal til slutt bygges fra
golfdata/-komponenter — det er en tidsplan-sak (se `plans/design-implementering-neste-steg.md`
og aktiv plan-fil), ikke en arkitekturbeslutning om å beholde noe permanent utenfor kanon.

## Vedlikeholdsmodus → avvikling

`src/components/athletic/*.tsx` (det gamle branded-biblioteket) er ikke lenger et akseptert
sideløp — det avvikles skjerm for skjerm etter hvert som hver skjerm bygges om. Ikke utvid det.
Ikke bygg nye skjermer mot det, selv midlertidig.

`src/components/ui/` (shadcn: Dialog, Input, Sheet, Popover, Tabs) er unntatt — det er
primitiv-laget for skjema/overlay og overlapper ikke golf-UI-en. Det berøres ikke av denne regelen.

## Praktisk beslutningsregel

| Skal lage | Gjør |
|---|---|
| Ny golf-UI-komponent | Hent den fra det levende Claude Design-prosjektet (DesignSync), port til `golfdata/` |
| Dialog / input / sheet / tabs / popover | `src/components/ui/` |
| Ny skjerm | Komponer fra `golfdata/` per prosjektets `prompt.md`-kontrakter; meld gap, ikke improviser |
| Farge/spacing/type | Tokens — hent fra prosjektets `tokens/*.css`, aldri hardkodet hex |

## Design-veiledning

Kun `.claude/skills/ak-designekspert` + det levende Claude Design-prosjektets `guidelines/` (ZIP-en er fasit-handover).
Andre generiske design-skills i `~/.claude/skills/` gir motstridende råd og skal ikke brukes.

## Grok Build / Fable 5 integrasjon (token-besparende)

Når du jobber i Grok Build på dette prosjektet (design-implementering):
- Bruk fable-ak-style.md (docs/fable-ak-style.md) som kondensert referanse.
- Kombiner med Fable 5_System_Prompt.md for prose-stil (naturlige avsnitt, minimal bullets, varm tone) i forklaringer, planer og docs.
- Aldri lim inn full Fable eller ZIP – referer filer og bruk targeted reads/edits.
- Dette sparer tokens mens vi holder "Fable 5 setting" (prose, disiplinert) + AK Golf kanon 1:1.
