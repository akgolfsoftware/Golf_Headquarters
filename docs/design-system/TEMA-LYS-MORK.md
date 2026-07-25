# Tema: lys og mørk (fasit)

**Oppdatert:** 2026-07-25 (ny temafasit — lys default + mørk-bryter, Anders; opphever B28)  
**Kilde i kode:** `src/app/layout.tsx` (før paint), `src/components/v2/shell.tsx` (bryter + synk), `src/app/globals.css` (`:root` + `html[data-v2-tema="light"]`).  
**Forretningsfasit:** `docs/platform/BUSINESS-RULES.md` § Tema per produkt.

---

## For deg (én setning)

**Appen (PlayerHQ, AgencyOS, Forelder) er lys som standard — med bryter til mørk for den som vil. Mørk skjerm er vanskelig å lese utendørs i sollys. Marketing og innlogging er fortsatt mørke.**

---

## Per produkt

| Produkt | URL | Default | Kan bytte? |
|---|---|---|---|
| **PlayerHQ** | `/portal` | **Lys** | **Ja** — sol/måne i rail + Mer-ark |
| **AgencyOS** | `/admin` | **Lys** | **Ja** — sol/måne i rail + Mer-ark |
| **Forelder** | `/forelder` | **Lys** | **Ja** — sol/måne i rail + Mer-ark |
| **Auth** | `/auth` | **Mørk** | Nei |
| **Marketing / booking / stats** | `akgolf.no`, `/booking`, `/stats` | **Mørk** | Ikke samme v2-toggle |

> B28 («PlayerHQ alltid lys, ingen bryter») er **opphevet 2026-07-25** (Anders): lys er fortsatt
> default, men brukeren kan nå bytte til mørk. Mørke mockups i marketing viser bryter-tilstanden.

---

## Teknisk (for AI/utvikler)

1. **CSS-grunnlag:** `:root` = mørke `--v2-*`. Lys = `html[data-v2-tema="light"]`.
2. **Cookie:** `ak-v2-tema=light|dark` (path `/`, 1 år).  
   *(Gammel `ak-admin-theme` er utgått — ikke skriv den tilbake.)*
3. **Før paint:** inline-script i rot-layout setter tema etter:
   - App-flater (`/portal`, `/admin`, `/forelder`): **lys default** — mørk kun hvis cookie er `ak-v2-tema=dark`.
   - Øvrige flater (marketing/auth): uendret — lys kun med eksplisitt lys-cookie.
4. **Synk ved SPA-navigasjon:** `V2Shell` leser cookien ved rute-veksling og setter
   `data-v2-tema` deretter (delt attributt på `<html>`, samme dokument på tvers av flatene).
5. **Bryter:** synlig på alle v2-flater (sol/måne i IkonRail + i Mer-arket). SSR-snapshot er lys.
6. **Onboarding** (`/auth/onboarding`): egen lys v2-flate (`VeiviserFlate`) — uendret.

---

## Ikke bland

| Feil antakelse | Sannhet |
|---|---|
| «Design default er lys overalt» | Nei — lys default gjelder app-flatene; marketing/auth er mørke |
| «PlayerHQ kan ikke toggles til mørk» | Kan nå — bryter på alle v2-flater (B28 opphevet 2026-07-25) |
| «AgencyOS er mørk som standard» | Var — nå lys default med bryter, samme som PlayerHQ |
| «Forelder og auth er lyse» | Forelder er lys default; auth er mørk |
| «To cookies (admin vs portal)» | Nei — én cookie (`ak-v2-tema`) for alle app-flater |

---

## Se også

- `docs/design-system/FASIT.md` §1  
- `docs/platform/BUSINESS-RULES.md` § Tema  
- `.claude/rules/design-system-regel.md`  
- `.claude/rules/beslutninger.md`  
