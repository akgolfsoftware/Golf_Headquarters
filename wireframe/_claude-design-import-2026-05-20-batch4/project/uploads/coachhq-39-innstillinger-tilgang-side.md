# CoachHQ — Innstillinger tilgang (side)

**Rute:** `/admin/settings/tilgang`.

## Kontekst
Tilgangsstyring per rolle. Hvem ser hva. Anders kan låse moduler for visse roller.

## Formål
- Matrise: Rolle × Modul × Tilgang
- Audit-log lenke
- 2FA-krav per rolle

## Layout

**Header:**
- "Tilgang" Inter Tight 700 32px
- "5 roller · 24 moduler · 142 grants" mono
- "Audit-log"-link høyre

**Tilgangs-matrise (tabell):**
Kolonner: Modul | Hovedcoach | Coach | Assistent | Admin | Fysisk
Rader (moduler): Stall · Spiller-profil · Plan-bygger · Innboks · Godkjenninger · Bookinger · Anlegg · Finance · AI · Settings · Audit-log...

Hver celle: dropdown med Read / Edit / Admin / None. Default-valgte basert på rolle.

**Sikkerhetsregler-card:**
- "2FA påkrevd for: " toggles per rolle (Hovedcoach: ON, Admin: ON)
- "IP-whitelist": "Aktiver"-toggle
- "Session-tid": dropdown (1h, 8h, 24h, aldri)

**Bunn:**
"Lagre tilgangskart" forest fill + "Gjenopprett standardverdier" outline

## Branding
Cream bg, hvit tabell, lime "edit" celler, muted "none".
