// App shell — Design canvas with all 8 sections.
const { useState } = React;

function App() {
  return (
    <DesignCanvas>
      <DCSection id="s1" title="1 · Legg til betalingskort" subtitle="PlayerHQ · /portal/meg/abonnement/kort/ny — Stripe Elements">
        <DCArtboard id="s1a" label="A · By-the-book to-kolonne" width={1280} height={820}>
          <S1_VariantA/>
        </DCArtboard>
        <DCArtboard id="s1b" label="B · Card-first hero" width={1280} height={820}>
          <S1_VariantB/>
        </DCArtboard>
        <DCArtboard id="s1c" label="C · Forest split med PRO-context" width={1280} height={820}>
          <S1_VariantC/>
        </DCArtboard>
        <DCArtboard id="s1m" label="Mobile · variant A" width={390} height={820}>
          <S1_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s2" title="2 · Coach profil-hub" subtitle="CoachHQ · /admin/meg — sticky tab-bar over 6 seksjoner">
        <DCArtboard id="s2a" label="A · Sticky tab-bar, by-the-book" width={1280} height={900}>
          <S2_VariantA/>
        </DCArtboard>
        <DCArtboard id="s2b" label="B · Dashboard grid med stats-hero" width={1280} height={900}>
          <S2_VariantB/>
        </DCArtboard>
        <DCArtboard id="s2c" label="C · Cover-photo magazine layout" width={1280} height={900}>
          <S2_VariantC/>
        </DCArtboard>
        <DCArtboard id="s2m" label="Mobile · variant A" width={390} height={820}>
          <S2_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s3" title="3 · Spiller-plan detalj (coach)" subtitle="CoachHQ · /admin/spillere/[id]/plan/[planId] — Drills-tab default">
        <DCArtboard id="s3a" label="A · Klassisk tab-layout" width={1280} height={900}>
          <S3_VariantA/>
        </DCArtboard>
        <DCArtboard id="s3b" label="B · To-pane drill workbench" width={1280} height={900}>
          <S3_VariantB/>
        </DCArtboard>
        <DCArtboard id="s3c" label="C · Kanban per periode-blokk" width={1280} height={900}>
          <S3_VariantC/>
        </DCArtboard>
        <DCArtboard id="s3m" label="Mobile · variant A" width={390} height={820}>
          <S3_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s4" title="4 · Økt-detalj (coach)" subtitle="CoachHQ · /admin/gjennomfore/okter/[id] — status-pill endrer farge">
        <DCArtboard id="s4a" label="A · Stacked sections" width={1280} height={900}>
          <S4_VariantA/>
        </DCArtboard>
        <DCArtboard id="s4b" label="B · 2-col med live-rail" width={1280} height={900}>
          <S4_VariantB/>
        </DCArtboard>
        <DCArtboard id="s4c" label="C · Tidslinje-strip horisontal" width={1280} height={900}>
          <S4_VariantC/>
        </DCArtboard>
        <DCArtboard id="s4m" label="Mobile · variant A" width={390} height={820}>
          <S4_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s5" title="5 · AI foreslå drill (modal)" subtitle="PlayerHQ · /portal/planlegge?tab=drills — loading → result">
        <DCArtboard id="s5a" label="A · Modal · loading + result" width={720} height={780}>
          <S5_VariantA/>
        </DCArtboard>
        <DCArtboard id="s5b" label="B · Side-panel slide-in" width={520} height={780}>
          <S5_VariantB/>
        </DCArtboard>
        <DCArtboard id="s5c" label="C · Full-screen takeover" width={1280} height={780}>
          <S5_VariantC/>
        </DCArtboard>
        <DCArtboard id="s5m" label="Mobile · sheet" width={390} height={780}>
          <S5_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s6" title="6 · AI foreslå turnering (modal)" subtitle="PlayerHQ · /portal/planlegge?tab=turneringer">
        <DCArtboard id="s6a" label="A · Modal med filter-strip" width={720} height={820}>
          <S6_VariantA/>
        </DCArtboard>
        <DCArtboard id="s6b" label="B · Card-stack swipe" width={520} height={820}>
          <S6_VariantB/>
        </DCArtboard>
        <DCArtboard id="s6c" label="C · Kalender-overlay" width={1100} height={820}>
          <S6_VariantC/>
        </DCArtboard>
        <DCArtboard id="s6m" label="Mobile · sheet" width={390} height={820}>
          <S6_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s7" title="7 · AI mål-bygger (modal)" subtitle="PlayerHQ · /portal/planlegge?tab=mal — 3-stegs flyt">
        <DCArtboard id="s7a" label="A · 3-stegs wizard" width={720} height={820}>
          <S7_VariantA/>
        </DCArtboard>
        <DCArtboard id="s7b" label="B · Split-pane (steps + content)" width={1000} height={780}>
          <S7_VariantB/>
        </DCArtboard>
        <DCArtboard id="s7c" label="C · Chat-style konversasjon" width={620} height={820}>
          <S7_VariantC/>
        </DCArtboard>
        <DCArtboard id="s7m" label="Mobile · sheet" width={390} height={820}>
          <S7_Mobile/>
        </DCArtboard>
      </DCSection>

      <DCSection id="s8" title="8 · Live Session Logger" subtitle="PlayerHQ · /portal/(fullscreen)/live/[id]/logger — én-håndsbruk">
        <DCArtboard id="s8a" label="A · Stor +1 touchtarget" width={390} height={780}>
          <S8_VariantA/>
        </DCArtboard>
        <DCArtboard id="s8b" label="B · Split rep + progress-strip" width={390} height={780}>
          <S8_VariantB/>
        </DCArtboard>
        <DCArtboard id="s8c" label="C · Gesture-driven minimalist" width={390} height={780}>
          <S8_VariantC/>
        </DCArtboard>
        <DCArtboard id="s8d" label="D · Tablet/landscape" width={780} height={500}>
          <S8_Tablet/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
