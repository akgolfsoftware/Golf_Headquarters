/* Laster-tilstand for /portal/tren/tester (Paper-port W1, fase2).
   Fasit: playerhq-tester-hub.html — enkle skjelettlinjer i avtagende bredde.
   Ligger på tester-nivået (ikke tren/) så fys-plan ikke arver den. */

import { V2Laster } from "@/components/v2/feil-laste";

export default function Loading() {
  return <V2Laster variant="liste" />;
}
