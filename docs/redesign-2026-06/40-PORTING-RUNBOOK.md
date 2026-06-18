# Porting-runbook — push-button design→app

> Track 4 / porting-rigg. Slik porter vi én skjerm fra Claude Design til appen, hver gang, uten tull. Følg stegene; loop til 0 avvik.

## Per skjerm — de 7 stegene
1. **Hent kilden.** Eksporter skjermen fra Claude Design (standalone) → `public/design-handover/<skjerm>/`. Lag element-liste (hver seksjon, hvert tall, rekkefølge).
2. **Bygg FRA kilden** (ikke fra minne/eksisterende kode), med komponentene i `src/components/` + tokens fra `globals.css`.
3. **Screenshot** implementeringen: `node scripts/route-shot.mjs <rute> <bredde>` (PlayerHQ 430, AgencyOS 1280). Krever `npm run dev` kjørende.
4. **Adversarial diff** — spawn kritiker-agent med kilde-PNG + min PNG + element-lista (mal under). Den FINNER avvik.
5. **Fiks til 0 avvik**, re-screenshot, kjør diff på nytt. Loop.
6. **Koble data + knapper:** ekte Prisma-data, hver knapp en destinasjon (mot `flyt-inventar/00-OPPSUMMERING`). Ingen døde knapper.
7. **Oppdater MASTER-SKJERMPLAN** — de 6 hakene i SAMME commit. Verifiser: `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build`.

## Adversarial diff-agent — prompt-mal
```
Du er en KRITIKER, ikke en heiagjeng. Sammenlign to skjermbilder av samme skjerm:
A = Claude Design-kilden (fasit): <sti-A.png>
B = appens implementering: <sti-B.png>
+ element-liste: <lim inn>
List HVERT avvik (topp-område, rekkefølge, farge, tekst, font, spacing, manglende/
ekstra element, layout). Default: anta avvik finnes til du har lett grundig.
Godta KUN disse bevisste unntakene: next/font ±1-2px breddeavvik; appens pill-knapp-
idiom; delt shell-topbar; lime-disiplin. Alt annet = avvik som skal rettes.
Returner: nummerert avviksliste + verdikt BESTÅTT (0 avvik) / IKKE BESTÅTT.
```

## Token-migrering (klar til å påføre ved porting-start, Fase 2)
**Lyst tema er allerede hybrid** (cream #FAFAF7 / forest #005840 / lime #D1F843) — ingen endring i `:root`.
**Kun `.dark` (AgencyOS) endres** til terminal-paletten. Bytt disse i `src/app/globals.css` `.dark`-blokken (shadcn HSL-format «H S% L%»):

| Token | I dag | → Hybrid terminal | Hex |
|---|---|---|---|
| `--background` | 157 47% 11% | **153 39% 5%** | #07100C |
| `--foreground` | 60 8% 96% | **135 24% 93%** | #EAF2EC |
| `--card` / `--popover` / `--secondary` / `--muted` | 157 39% 14% | **152 33% 10%** | #11221A |
| `--muted-foreground` | 137 4% 63% | **142 11% 65%** | #9DB0A4 |
| `--border` / `--input` | 158 30% 24% | **147 23% 18%** | #243A2E |
| `--destructive` | 2 80% 75% | **14 86% 59%** | #F0683E |
| `--success` | 157 49% 56% | **147 58% 56%** | #4FD08A |
| `--warning` | 34 80% 60% | **42 79% 57%** | #E8B43C |
| `--info` | 222 100% 76% | **208 83% 65%** | #5AA9F0 |

`--primary`/`--accent`/`--ring` = lime (72 92% 62%) — uendret. `--lib/design-tokens.ts` oppdateres tilsvarende for charts.
**Bakgrunns-rutenett:** der AgencyOS-flater bruker et rutenett, hold det knapt synlig (≈ `rgba(180,225,195,.035)`).
*Endringene er rene CSS-verdier — kan ikke brekke build. Påføres som første steg i Fase 2 (før skjerm-porting), ikke mens design ennå er i flyt.*

## Sletting (fra audit — gjøres ved porting-start)
Trygt: `_archive/` (412 MB), `content/blog`+`lib/blog.ts`, `admin/facilities`+`admin/locations` page-mapper, ~20 døde komponenter, ~135 foreldreløse. **IKKE slett:** `portal/mal/*` (levende, 84 refs), `design-system/`. Full liste: `audit/00-OPPSUMMERING.md`.
