/**
 * Tomtilstand på panel- og sidenivå (~25 skjermer): tittel + forklaring
 * + valgfri CTA. Løfter det Region gir som én tekstlinje til noe som
 * peker mot en handling.
 *
 * Dekker KUN «ingen data ennå» — en legitim, permanent datatilstand.
 * IKKE «ikke bygget ennå»; se .prompt.md. Callout har ingen «tom»-tone,
 * og Region eier tomhet på komponentnivå (inne i en graf, en KPI, en rad).
 */
export interface EmptyStateProps {
  /** Kort setning om hva som ikke finnes: «Ingen runder logget ennå» */
  title?: string;
  /** Forklaringen — påkrevd i praksis; komponenten advarer hvis den mangler */
  children?: React.ReactNode;
  /** Ett dempet ikon i --soft sirkel. Utelat når tomheten er selvforklarende. */
  icon?: React.ReactNode;
  /** Én knapp som starter det som mangler. Utelat når brukeren ikke kan gjøre noe. */
  action?: React.ReactNode;
  /** center i panel/side · start i sidespalte, inspektør og lister */
  align?: "center" | "start";
  density?: "md" | "sm";
  dataOdId?: string;
}
