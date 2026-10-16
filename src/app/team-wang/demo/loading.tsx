import styles from "./demo.module.css";

export default function WangGolfDemoLoading() {
  return (
    <main className={styles.statePage} aria-busy="true" aria-live="polite">
      <div className={styles.stateCard}>
        <span className={styles.loadingMark} aria-hidden="true" />
        <h1>Laster Golf-demo</h1>
        <p>Henter idretter, grupper, planer og kalender fra WANG-databasen.</p>
      </div>
    </main>
  );
}
