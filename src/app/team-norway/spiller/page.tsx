import { redirect } from "next/navigation";

/** /team-norway/spiller uten spiller sender til spillerlisten, der navnet åpner IUP. */
export default function Page() {
  redirect("/team-norway/spillere");
}
