# 2 · Merkearkitektur

AK Golf er en **paraply med varianter**, ikke fem merkevarer og ikke ett
uttrykk som visker bort forskjellene. Hver virksomhet arver samme skjelett —
logobruk, typografi, romskala, geometri — og får én ting av sitt eget: en
identitetsfarge og en tone.

## Familien

| Virksomhet | Hvordan navnet skrives | Identitetsfarge | Hvor mye AK Golf synes |
|---|---|---|---|
| **AK Golf Academy** | `AK Golf Academy` | Clay `#D97757` | Fullt ut. Dette *er* AK Golf |
| **AK Golf Junior Academy** | `AK Golf Junior Academy`, kort: `Junior Academy` | Grønn `#5B8450` | Fullt ut |
| **AK Golf HQ** (PlayerHQ / AgencyOS) | `AK Golf HQ` | Blå `#3F7CB3` | Fullt ut — men skjermene styres av Train-lock |
| **Organisasjon** (WANG-coaching, klubbarbeid) | Kundens navn først: `WANG Toppidrett Fredrikstad — coaching ved AK Golf` | Skifer `#4E6A7E` | Som leverandør, ikke som eier |
| **Skarpnord Golf Products** | `Skarpnord Golf Products` | Oker `#9C7A33` | Lav profil til virksomheten har omsetning |
| **Mulligan Indoor Golf** | `Mulligan Indoor Golf` | *Egen, utenfor systemet* | **Ingen.** Se `01-merket.md` |

**Team Norway Golf er ikke i denne tabellen.** Team Norway har sitt eget
designsystem (Claw, `designsystem/team-norway/`) og eier `/team-norway/*`.
AK Golf-merket gjelder ikke der.

## Hvorfor fargene er som de er

Rekkefølgen følger spillerens vei gjennom huset, ikke en fargevifte:

**Junior (grønn, vekst) → Academy (clay, kjernen) → HQ (blå, systemet) →
Organisasjon (skifer, kravet) → Products (oker, utstyret).**

Fargen koder hvor i utviklingsløpet du står. Det gjør at en forelder som ser
grønt og et forbund som ser skifer, begge leser noe sant — uten at det må
forklares.

## Tre systemer, én konfliktregel

Huset har tre designsystemer. De overlapper aldri på samme skjerm:

| System | Eier | Fasit |
|---|---|---|
| **AK Golf** (dette) | Merket: logo, farge, tone, foto, marked, materiell | `designsystem/ak-golf/` |
| **Train-lock** | Hver skjerm i PlayerHQ, AgencyOS og Forelder | `designsystem/train-lock/` |
| **Claw** | `/team-norway/*` | `designsystem/team-norway/` |

**Ved konflikt:** gjelder det en produktskjerm, vinner Train-lock. Gjelder det
merket, vinner AK Golf. Gjelder det Team Norways egne skjermer, vinner Claw.
**Ingen skjerm har to fasiter** (Anders 31.08.2026, `.claude/rules/beslutninger.md`).

Praktisk oversatt: dette systemet bestemmer hvordan AK Golf ser ut *utenpå og
rundt* produktet. Det bestemmer aldri hvordan en knapp inne i appen ser ut.

## Når en ny virksomhet kommer til

1. Den arver skjelettet uendret. Ingen ny font, ingen ny romskala, ingen ny radius.
2. Den får én identitetsfarge, med målt tekstvariant og lys variant (`04-farge.md`).
3. Navnet skrives `AK Golf <Navn>` hvis merket skal synes — ellers står den
   utenfor paraplyen, som Mulligan, og skal da ikke låne noe fra dette systemet
   i det hele tatt. Halvveis tilhørighet finnes ikke.
