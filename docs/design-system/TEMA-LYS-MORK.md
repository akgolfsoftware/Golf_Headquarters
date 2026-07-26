# Tema: lys og mørk (beskrivelse av kode)

**Oppdatert:** 2026-07-26 — rettet mot deployet kode. Forrige versjon (23. juli) beskrev
det gamle mørk-først-systemet og var motsatt av virkeligheten på fire punkter.

**Kilde i kode (les denne, ikke gjett):**
- `src/app/globals.css` — `:root` er LYS; `html[data-v2-tema="dark"]` er mørk
- `src/app/layout.tsx` — før-paint-script som velger tema
- `src/components/v2/shell.tsx` — bryter + synk ved SPA-navigasjon

**Status:** Designreglene er bevisst tømt 2026-07-25 — nytt designsystem utvikles i Open
Design. Denne filen er derfor en *beskrivelse av hva koden gjør*, ikke en låst regel.
Ved konflikt vinner `docs/platform/BUSINESS-RULES.md` § Tema per produkt.

---

## For deg (én setning)

**App-flatene er lyse som standard med bryter til mørk. Marketing og auth er mørke.**

Mørk skjerm er vanskelig å lese utendørs i sollys — derfor er lys default i appen.

---

## Per produkt

| Produkt | URL | Default | Kan bytte? |
|---|---|---|---|
| **PlayerHQ** | `/portal` | **Lys** | **Ja** — bryter i shell |
| **AgencyOS** | `/admin` | **Lys** | **Ja** — bryter i shell |
| **Forelder** | `/forelder` | **Lys** | **Ja** — bryter i shell |
| **Auth** | `/auth/*` | **Mørk** | Nei — ingen v2-shell |
| **Marketing / stats** | `akgolf.no`, `/stats` | **Mørk** | Nei — egen stil |

---

## Teknisk

1. **CSS-grunnlag:** `:root` = **lyse** `--v2-*`. Mørk = `html[data-v2-tema="dark"]`.
   `html[data-v2-tema="light"]` finnes som bakoverkompatibelt alias og gir samme
   verdier som default.
2. **Cookie:** `ak-v2-tema=light|dark` (path `/`, 1 år).
   *(Gammel `ak-admin-theme` er utgått — ikke skriv den tilbake.)*
3. **Før paint** (`layout.tsx`) — to regler, avhengig av rute:
   - **App** (`/portal`, `/admin`, `/forelder`): mørk **kun** hvis cookie er `dark`.
   - **Alt annet** (marketing, auth, stats): mørk **med mindre** cookie er `light`.
4. **Ved SPA-navigasjon:** `V2Shell` setter samme regel på nytt, siden Next navigerer i
   samme dokument og attributtet ellers ville hengt igjen fra forrige flate.
5. **Bryter:** vises på **alle** v2-flater (rail på desktop, i Mer-panelet på mobil).

---

## Ikke bland

| Feil antakelse | Sannhet |
|---|---|
| «CSS er mørk-først» | Nei — `:root` er lys siden Fase F |
| «AgencyOS er mørk som standard» | Nei — lys, som resten av appen |
| «PlayerHQ er låst til lys (B28)» | Nei — B28-låsen er borte, bryteren gjelder også der |
| «Lys overalt» | Nei — marketing og auth er mørke |
| «To cookies (admin vs portal)» | Nei — én cookie for hele appen |

---

## Historikk

Fram til 24. juli var `:root` mørk, PlayerHQ var låst lys (B28) og AgencyOS var mørk som
standard. Fase F (25. juli) snudde grunnlaget til lys og fjernet låsen. Gamle beskrivelser
i `docs/design-system/` er merket UTGÅTT.

---

## Se også

- `docs/platform/BUSINESS-RULES.md` § Tema per produkt (forretningsfasit)
- `docs/design-system/FASIT.md` §1
- `.claude/rules/beslutninger.md`
