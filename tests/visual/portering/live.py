"""PH-05: ekte komponent/IndexedDB, syntetisk server, alle nett-kall avskåret."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE = 'http://127.0.0.1:5441'
OUT = Path('_archive/portering-kontroll-2026-09-10')
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context()
    context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
    page = context.new_page()
    errors, variants, checks = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    serial = [0]
    def load(state='fylt', theme='dark', same_id=None):
        serial[0] += 1
        page.goto(f'{BASE}/live-prove?tilstand={state}&tema={theme}&id={same_id or "live-"+str(serial[0])}')
        if state == "startfeil": expect(page.locator("[data-phase]")).to_have_attribute("data-phase", "start-error")
        if state not in ['lasting', 'startfeil', 'ferdig', 'avlyst']:
            expect(page.locator('[data-phase]')).to_have_attribute('data-phase', 'active')
    def controls(js): return page.evaluate(js)
    def button(name): return page.get_by_role('button', name=name, exact=True)
    def open_finish(): button('Avslutt').click(); expect(page.get_by_role('dialog')).to_be_visible()
    for width in [320, 390, 834, 1440]:
        page.set_viewport_size({'width': width, 'height': 852})
        for theme in ['light', 'dark']:
            for state in ['fylt', 'tom', 'lang', 'lasting', 'startfeil']:
                load(state, theme)
                expect(page.locator('h1')).to_be_visible()
                page.evaluate('document.fonts.ready')
                assert controls('[...document.fonts].some(f=>f.family==="Geist" && f.status==="loaded")')
                assert controls('document.querySelector("[data-phase]").scrollWidth <= innerWidth'), (width, theme, state)
                if state in ['lasting', 'startfeil']:
                    expect(button('Avslutt')).to_be_disabled()
                    expect(page.get_by_test_id('live-clock')).to_have_text('00:00')
                    expect(button('+1 rep').first).to_be_disabled()
                if state == 'fylt':
                    button('Pause').click()
                    page.screenshot(path=str(OUT / f'live-{width}-{theme}.png'), full_page=True)
                    assert button('+1 rep').first.bounding_box()['height'] >= 64
                variants.append({'width': width, 'theme': theme, 'state': state})
    # StrictMode: samme startløfte gjenbrukes, avsluttet-status respekteres.
    page.set_viewport_size({'width': 390, 'height': 852})
    for state, destination in [('ferdig', '/summary'), ('avlyst', '/portal/planlegge')]:
        load(state)
        page.wait_for_function('window.liveControls.navigation !== ""')
        assert controls('window.liveControls.navigation').endswith(destination)
        assert controls('window.liveControls.events.filter(e=>e.kind==="start").length') == 1
        expect(button('Avslutt')).to_be_disabled()
    load('startfeil')
    page.clock.install()
    page.clock.fast_forward(5000)
    expect(page.get_by_test_id('live-clock')).to_have_text('00:00')
    controls('window.liveControls.startFail=false')
    button('Prøv å åpne igjen').click()
    page.clock.run_for(100)
    expect(page.locator('[data-phase]')).to_have_attribute('data-phase', 'active')
    page.clock.run_for(2200)
    assert page.get_by_test_id('live-clock').inner_text() != '00:00'
    button('Pause').click()
    paused_clock = page.get_by_test_id('live-clock').inner_text()
    page.clock.fast_forward(10000)
    expect(page.get_by_test_id('live-clock')).to_have_text(paused_clock)
    checks.append('StrictMode, avlyst/fullført, startfeil, retry og pauseklokke')
    # Rask registrering og refresh bevarer pauset klokke og lavere angretall.
    button('+1 rep').first.evaluate('(b)=>{for(let i=0;i<12;i++)b.click()}')
    expect(page.get_by_test_id('count-d1')).to_have_text('12 reps · 0 treff')
    button('Angre siste').first.evaluate('(b)=>{for(let i=0;i<3;i++)b.click()}')
    expect(page.get_by_test_id('count-d1')).to_have_text('9 reps · 0 treff')
    page.wait_for_function('async()=> (await window.liveQueue.lesLiveDrillUtkast(new URLSearchParams(location.search).get("id")))?.drills[0].repsTotal===9')
    controls('(()=>{const u=new URL(location.href);u.searchParams.set("tilstand","fylt");history.replaceState(null,"",u)})()')
    page.reload()
    expect(page.locator('[data-phase]')).to_have_attribute('data-phase', 'active')
    expect(page.get_by_test_id('count-d1')).to_have_text('9 reps · 0 treff')
    expect(button('Fortsett')).to_have_attribute('aria-pressed', 'true')
    expect(page.get_by_test_id('live-clock')).to_have_text(paused_clock)
    page.get_by_text('Rett antall', exact=True).first.click()
    button('Trekk fra én: Automatisk').first.evaluate('(b)=>{for(let i=0;i<9;i++)b.click()}')
    page.clock.run_for(1500)
    page.wait_for_function('window.liveControls.logs.d1?.repsTotal===0')
    checks.append('12 raske trykk, tre angre, pause/refresh, korrigering til null sendes')
    # Øvelsens hake er lokal inntil fullføring; gir ingen automatisk avslutning.
    for _ in range(3): button('Marker øvelsen ferdig').click()
    expect(page.get_by_role('heading', name='Alle øvelsene er markert ferdige')).to_be_visible()
    assert controls('window.liveControls.events.filter(e=>e.kind==="finish").length') == 0
    button('Øvelser 3/3').click()
    page.get_by_role('button', name='Fjern ferdigmarkering for Oppvarming').click()
    expect(button('Øvelser 2/3')).to_be_visible()
    # Frie notater og dialogtastatur; kladden fjernes først etter vellykket svar.
    button('Notater').click()
    page.get_by_label('Notat fra økta', exact=True).fill('Syntetisk notat som følger økta.')
    button('Legg til notat').click()
    expect(page.get_by_text('Syntetisk notat som følger økta.', exact=True)).to_be_visible()
    open_finish()
    expect(button('Fortsett økta')).to_be_focused()
    page.keyboard.press('Shift+Tab')
    expect(button('Avslutt og logg økta')).to_be_focused()
    page.keyboard.press('Tab')
    expect(button('Fortsett økta')).to_be_focused()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).not_to_be_visible()
    expect(button('Avslutt')).to_be_focused()
    open_finish()
    controls('window.liveControls.finishDelay=200')
    button('Avslutt og logg økta').evaluate('(b)=>{b.click();b.click()}')
    page.clock.run_for(1200)
    page.wait_for_function('window.liveControls.navigation.endsWith("/summary")')
    assert controls('window.liveControls.events.filter(e=>e.kind==="finish").length') == 1
    assert controls('window.liveControls.finishedIds') == ['d1', 'd3']
    assert controls('async()=>await window.liveQueue.lesLiveDrillUtkast(new URLSearchParams(location.search).get("id"))') is None
    checks.append('siste øvelse fullfører ikke økta, notater, dialogfokus/Escape, dobbel fullføring')
    # Skru av testklokka med ny side.
    page.close(); page = context.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_viewport_size({'width': 390, 'height': 852})
    load('sluttfeil')
    button('+1 treff').first.click()
    open_finish()
    button('Avslutt og logg økta').click()
    expect(page.get_by_role('alert')).to_contain_text('Fullføringen ble ikke bekreftet')
    assert controls('window.liveControls.logs.d1.repsTotal') == 1
    assert controls('window.liveControls.navigation') == ''
    expect(page.get_by_role('dialog')).to_be_visible()
    controls('window.liveControls.finishFail=false')
    button('Prøv fullføring igjen').click()
    page.wait_for_function('window.liveControls.navigation.endsWith("/summary")')
    checks.append('siste trykk lagret før serverfullføring; sluttfeil beholder dialog og kan prøves igjen')
    load('lagrefeil')
    button('+1 rep').first.click(); open_finish(); button('Avslutt og logg økta').click()
    expect(page.get_by_role('alert')).to_be_visible()
    assert controls('window.liveControls.events.filter(e=>e.kind==="finish").length') == 0
    controls('window.liveControls.saveFail=false')
    button('Prøv fullføring igjen').click()
    page.wait_for_function('window.liveControls.navigation.endsWith("/summary")')
    load()
    button('+1 rep').first.click(); controls('window.liveControls.loseFinishReply=true')
    open_finish(); button('Avslutt og logg økta').click()
    expect(page.get_by_role('alert')).to_be_visible()
    button('Prøv fullføring igjen').click()
    page.wait_for_function('window.liveControls.navigation.endsWith("/summary")')
    assert controls('window.liveControls.events.filter(e=>e.kind==="finish").length') == 1
    checks.append('lagringsfeil sperrer sluttstatus; tapt fullføringssvar prøves idempotent igjen')
    # Ekte frakobling etter åpning. Nytt nett sender lokalt lagrede null/positive tall.
    load(); button('Pause').click(); context.set_offline(True)
    button('+1 rep').first.click()
    expect(page.locator('[role="status"]')).to_contain_text('Uten nett')
    page.wait_for_function('async()=> (await window.liveQueue.lesLiveDrillUtkast(new URLSearchParams(location.search).get("id")))?.drills[0].repsTotal===1')
    context.set_offline(False)
    page.wait_for_function('window.liveControls.logs.d1?.repsTotal===1')
    checks.append('nettbrudd etter start og automatisk sending ved gjenoppkobling')
    # En eldre kvittering må ikke kvittere eller slette en nyere registrering.
    race = controls('''async()=>{
      const q=window.liveQueue, id="queue-race";
      const drill=n=>[{drillId:"d",repsTotal:n,repsWithoutBall:0,repsLowSpeed:0,repsAutomatic:n,repsHit:0,status:"active"}];
      await q.lagreLiveDrillUtkast(id,drill(1),10,{paused:true,drillSec:10});
      let release, started;
      const waiting=new Promise(r=>started=r);
      const old=q.synkLiveDrillKo(id,async()=>{started();return new Promise(r=>release=r)});
      await waiting; await q.lagreLiveDrillUtkast(id,drill(2),12,{paused:true,drillSec:12});
      release({ok:true}); const oldResult=await old;
      const pending=await q.lesLiveDrillUtkast(id);
      const newResult=await q.synkLiveDrillKo(id,async(_,ds)=>({ok:ds[0].repsTotal===2}));
      const retained=await q.lesLiveDrillUtkast(id);
      return {oldResult,newResult,count:pending.drills[0].repsTotal,retained:retained.totalSec,pending:(await q.listLiveDrillKo()).some(r=>r.sessionId===id)};
    }''')
    assert race == {'oldResult': 'venter', 'newResult': 'synket', 'count': 2, 'retained': 12, 'pending': False}, race
    # Samme nettleser i en annen fane sender først når første sending har kvittert.
    controls('''async()=>{
      const q=window.liveQueue,id="queue-tabs";
      await q.lagreLiveDrillUtkast(id,[{drillId:"d",repsTotal:1,repsWithoutBall:0,repsLowSpeed:0,repsAutomatic:1,repsHit:0,status:"active"}],0);
      window.firstSend=q.synkLiveDrillKo(id,async()=>{window.firstStarted=true;return new Promise(r=>window.releaseFirst=r)});
    }''')
    page.wait_for_function('window.firstStarted')
    other = context.new_page(); other.goto(f'{BASE}/live-prove?id=other-tab')
    other.wait_for_function('!!window.liveQueue')
    other.evaluate('''async()=>{
      const q=window.liveQueue,id="queue-tabs";
      await q.lagreLiveDrillUtkast(id,[{drillId:"d",repsTotal:2,repsWithoutBall:0,repsLowSpeed:0,repsAutomatic:2,repsHit:0,status:"active"}],0);
      window.secondSend=q.synkLiveDrillKo(id,async(_,ds)=>{window.secondStarted=ds[0].repsTotal;return {ok:true}});
    }''')
    assert other.evaluate('window.secondStarted ?? null') is None
    controls('window.releaseFirst({ok:true})')
    assert controls('window.firstSend') == 'venter'
    assert other.evaluate('window.secondSend') == 'synket'
    assert other.evaluate('window.secondStarted') == 2
    other.close()
    checks.append('to faner sender i rekkefølge med Web Locks')
    checks.append('ekte IndexedDB: gammel kvittering bevarer ny versjon, synket kladd beholder klokke')
    # Enheten nekter lokal lagring: behold tellingen og stopp fullføring.
    blocked = context.new_page()
    blocked.add_init_script('indexedDB.open=()=>{throw new DOMException("Syntetisk lagringsfeil","SecurityError")}')
    blocked.goto(f'{BASE}/live-prove?id=blocked-storage')
    expect(blocked.locator('[data-phase]')).to_have_attribute('data-phase', 'active')
    blocked.get_by_role('button',name='+1 rep',exact=True).first.click()
    expect(blocked.locator('[role="status"]')).to_contain_text('Kunne ikke lagre på denne enheten')
    blocked.get_by_role('button',name='Avslutt',exact=True).click()
    blocked.get_by_role('button',name='Avslutt og logg økta',exact=True).click()
    expect(blocked.get_by_role('alert')).to_be_visible()
    assert blocked.evaluate('window.liveControls.events.filter(e=>e.kind==="finish").length') == 0
    blocked.get_by_role('button',name='Fortsett økta',exact=True).click()
    expect(blocked.locator('[data-phase]')).to_have_attribute('data-phase', 'active')
    expect(blocked.get_by_test_id('count-d1')).to_have_text('1 reps · 0 treff')
    blocked.close()
    checks.append('nektet lokal lagring viser feil og hindrer fullføring')
    # 200 % tekst ved 320 px; handlingene nås også med skjermtastaturhøyde.
    page.set_viewport_size({'width': 320, 'height': 500}); load('lang')
    controls('document.documentElement.style.fontSize="32px"')
    assert controls('document.querySelector("[data-phase]").scrollWidth <= innerWidth')
    button('Avslutt').click()
    button('Fortsett økta').scroll_into_view_if_needed()
    expect(button('Fortsett økta')).to_be_in_viewport()
    checks.append('200 prosent tekst ved 320 px og lav skjermhøyde')
    for name in ['ph-05-reference.html', 'ph-05-wide-reference.html']:
        page.set_viewport_size({'width': 1800, 'height': 1100}); page.goto(f'{BASE}/{name}')
        frames = page.locator('[data-screen-label]:visible')
        expect(frames.first).to_be_visible()
        target = frames.last if 'wide' in name else frames.first
        target.screenshot(path=str(OUT / ('live-source-mac.png' if 'wide' in name else 'live-source-mobile.png')))
    assert not errors, errors
    OUT.joinpath('live-resultat.json').write_text(json.dumps({'variants':variants,'checks':checks,'errors':errors},ensure_ascii=False,indent=2))
    print(f'PH-05: {len(variants)} varianter og {len(checks)} flyt-/lagringskontroller bestod.')
    browser.close()
