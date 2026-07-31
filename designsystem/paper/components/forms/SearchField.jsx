import React from "react";
import { FormField } from "./FormField.jsx";
import { TextInput } from "./TextInput.jsx";

/**
 * Søkefelt. Ingen egen anatomi og ingen egen CSS — det er FormField med
 * skjult etikett og en TextInput av type search. Etiketten er visuelt borte,
 * men fortsatt annonsert; et søkefelt uten navn er et felt skjermleseren
 * bare kan kalle «tekstfelt».
 */
export function SearchField({
  label = "Søk",
  placeholder = "Søk etter spiller, økt eller drill",
  hint,
  dataOdId = "felt-sok",
  ...rest
}) {
  return (
    <FormField label={label} labelHidden hint={hint} dataOdId={dataOdId}>
      <TextInput type="search" placeholder={placeholder} dataOdId={`${dataOdId}-kontroll`} {...rest} />
    </FormField>
  );
}
