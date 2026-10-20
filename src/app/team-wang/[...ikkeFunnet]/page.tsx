import { notFound } from "next/navigation";

/**
 * Adresser under /team-wang som ikke finnes. Next viser bare rotens 404 for
 * adresser uten rute, så denne fanger dem og kaller notFound(), som gir
 * WANG-404-en i src/app/team-wang/not-found.tsx. Ekte ruter vinner alltid.
 */
export default function TeamWangUkjentAdresse() {
  notFound();
}
