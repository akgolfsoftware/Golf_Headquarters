import styles from "./app.module.css";

export default function WangAppLoading() {
  return (
    <main className={styles.loadingState} aria-busy="true" aria-label="Laster WANG-oversikten">
      <div className={styles.loadingSidebar} />
      <div className={styles.loadingContent}>
        <div className={styles.loadingLine} />
        <div className={styles.loadingHero} />
        <div className={styles.loadingCards}>
          <span /><span /><span />
        </div>
      </div>
    </main>
  );
}
