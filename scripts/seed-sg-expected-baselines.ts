/**
 * Deaktivert legacy writer for Broadie/PGA-kurven. Bruk isolert AK SG-pipeline.
 */
async function main() {
  throw new Error(
    "Seed blokkert: den gamle Broadie-/PGA-kurven skal ikke skrives til kunde-databasen. Bruk den isolerte AK SG-pipelinen etter godkjent rettighets- og modellkontroll.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
