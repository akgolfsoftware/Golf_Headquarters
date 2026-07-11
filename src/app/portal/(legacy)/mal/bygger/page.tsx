import { hentByggerKontekst } from "./actions";
import { MalByggerWizard } from "./bygger-client";

export const dynamic = "force-dynamic";

export default async function MalByggerPage() {
  const kontekst = await hentByggerKontekst();
  return <MalByggerWizard kontekst={kontekst} />;
}
