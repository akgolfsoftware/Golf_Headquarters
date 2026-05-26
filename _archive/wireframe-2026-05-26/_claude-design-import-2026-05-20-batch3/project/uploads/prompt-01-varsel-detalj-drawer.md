# Prompt 01 — Varsel-detalj drawer

## Hensikt

Når Markus klikker på en varsel-rad i `/portal/varsler`, åpnes en høyre-drawer (480 px bred) som viser hele meldingen, kontekst og handlinger — uten å forlate listen.

## Trigger

Klikk på `NotificationItem` i `/portal/varsler`. Lukkes via X, Esc eller klikk utenfor.

## Layout

- Container: høyre-drawer 480 px, full høyde, cream `#FAFAF7` bakgrunn (mørk: `#163027`), inner padding `p-8`.
- Topp: eyebrow JetBrains Mono 10 px uppercase `PLAYERHQ · VARSEL`, X-ikon (Lucide X, stroke 1.75) ytre høyre.
- Hero: stort Lucide-ikon (varierer per type: Calendar, ClipboardList, Trophy, MessageSquare, Info) i `rounded-2xl` lime-card 64×64.
- Tittel: Inter Tight 28 px medium, italic Instrument Serif for nøkkelordet.
- Tidsstempel: JetBrains Mono 11 px tabular nums, format `19. mai · 14:32`.
- Body-tekst: Inter 15 px, line-height 1.6, prose-styling for lenker/lister.
- Kontekst-blokk (hvis link finnes): grå `bg-secondary` card med `ArrowUpRight`-CTA "Gå til kilden".
- Bunn-handlinger: to knapper — primær forest "Marker som lest", secondary outline "Slett varsel". Sticky bottom-bar med `border-t border-border`.

## Komponenter

- `Sheet` fra shadcn/ui (side="right")
- `Button` (primary, outline)
- Lucide: X, Calendar, ClipboardList, Trophy, MessageSquare, Info, ArrowUpRight, Trash2

## Eksempel-data

```
Type: achievement
Tittel: "Du nådde Greenside SG-mål"
Body: "Etter 12 ukers fokus på chip-spill er din Greenside SG +0.42 over gjennomsnitt. Sett av tid til feiring med coachen din."
Link: /portal/mal/goal/sg-greenside-2026
Tidspunkt: 19. mai 2026, 14:32
```

## Branding-krav

- Cream `#FAFAF7`, forest `#005840`, lime `#D1F843`.
- Inter Tight + Inter + JetBrains Mono + Instrument Serif italic for hero-ord.
- Lucide stroke 1.75, ingen emojier.
- 8pt-grid: `p-8`, `gap-6`, `space-y-4`.
- Norsk bokmål.

## Tilstander

- **Ulest**: lime prikk øverst-venstre på drawer-header.
- **Lest**: drakk prikk fjernes, "Marker som lest"-knapp byttes til "Allerede lest".
- **Ingen link**: skjul kontekst-blokk.
