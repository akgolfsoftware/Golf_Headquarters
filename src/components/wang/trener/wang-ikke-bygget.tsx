import { wangSkjerm } from "@/lib/wang/wang-ruter";
import { WangKort, WangSide, WangSidehode, WangTom } from "./wang-ui";

/**
 * Midlertidig innhold for en skjerm som ikke er portert ennå, så menyen
 * aldri gir 404. Skjermagenten erstatter hele page.tsx-en.
 */
export function WangIkkeBygget({ skjermId }: { skjermId: string }) {
  const skjerm = wangSkjerm(skjermId);
  return (
    <WangSide>
      <WangSidehode skjermId={skjerm.id} tittel={skjerm.navn} />
      <WangKort>
        <WangTom tittel="Skjermen er ikke bygget ennå" tekst="Den kommer i denne porteringsrunden." />
      </WangKort>
    </WangSide>
  );
}
