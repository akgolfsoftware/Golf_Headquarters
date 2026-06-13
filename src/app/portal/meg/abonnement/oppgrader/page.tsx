import { redirect } from "next/navigation";

// /portal/meg/abonnement/oppgrader — historisk mailto-BETA. Den ekte
// checkout-flyten er ./flyt (Stripe Checkout); denne ruten beholdes som
// redirect fordi eksterne lenker peker hit.
export default function OppgraderPage() {
  redirect("/portal/meg/abonnement/oppgrader/flyt");
}
