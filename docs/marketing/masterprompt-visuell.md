# Masterprompt — AK Golf visuell produksjon (Higgsfield)

Gjenbrukbar prompt-mal for alle bilder/video til ak-golf-website. Bygget på
Claude Paper-fasiten (akgolf-hq `designsystem/paper/`) og de 30 ekte fotoene
i `public/brand/foto/`. Modell: GPT Image 2 (`gpt_image_2`), 16:9, 2k.

## Regler (gjelder alltid)

1. **Ekte foto vinner.** Generer kun det som ikke finnes blant de 30 ekte
   Academy-fotoene. Coaching-scener med mennesker = alltid ekte foto.
2. **Aldri stock-følelse.** Ingen glisende modeller, ingen high-five,
   ingen kunstig gyllen glød, ingen «passion»-estetikk.
3. **Paper-paletten er lyssettingen:** krem/ivory-highlights (#FAF9F5),
   blekk-mørke skygger (#141413), varm men dempet — aldri mettet HDR.
   Oransje (#D97757) kun som liten aksent (skjermglow, ball-markering).
4. **Norsk kontekst:** nordisk lys, ikke California. Innendørs-scener er
   kveldsmørke med skjermlys.
5. Tekst i bildet: aldri. Logo i bildet: aldri (legges på i kode).

## Malen

```xml
<oppdrag>
[én setning: hva bildet skal vise og hvilken seksjon det bærer]
</oppdrag>

<stil>
Editorial sports photography, Kinfolk/Monocle-tone. Naturlig kornethet,
grunt dybdeskarphet, rolig komposisjon med mye negativ plass til tekst.
Fargeverden: cream #FAF9F5 highlights, ink #141413 shadows, dempet
oliven/jordtoner. Nordisk lys.
</stil>

<motiv>
[konkret: objekter, miljø, kamerahøyde, utsnitt. Mennesker kun bakfra
eller anonymt — ansikter tilhører de ekte fotoene.]
</motiv>

<unngå>
stock photo aesthetics, smiling models, lens flare, oversaturated HDR,
text, logos, watermarks, American golf resort look
</unngå>
```

## Kjøring

```bash
higgsfield generate create gpt_image_2 --prompt "<malen over, utfylt>" \
  --aspect_ratio 16:9 --resolution 2k --wait
```

Konverter til webp før bruk: `cwebp -q 82 inn.png -o public/brand/<mappe>/<navn>-16x9.webp`
Navngivning: kebab-case, `<serie>-<motiv>-16x9.webp` — samme mønster som resten av `public/brand/`.
