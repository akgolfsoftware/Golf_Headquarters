"""Valgt PH-07: dagvalg, responsive blokker, detaljer og serverbekreftede svar."""
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
    errors, variants = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for width in [320, 390, 834, 1440]:
        page.set_viewport_size({'width': width, 'height': 852})
        for theme in ['light', 'dark']:
            for state in ['fylt', 'tom', 'lang', 'overlapp']:
                page.goto(f'{BASE}/plan-prove?tema={theme}&tilstand={state}')
                expect(page.get_by_role('heading', name='Plan', exact=True)).to_be_visible()
                page.evaluate('document.fonts.ready')
                assert page.evaluate('document.fonts.check("700 34px Geist") && [...document.fonts].some(f=>f.family==="Geist" && f.status==="loaded")')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, theme, state)
                expect(page.get_by_role('link', name='Ny økt', exact=True)).to_have_attribute('href', '/portal/planlegge/workbench?uke=0&start=2026-08-17T09%3A00')
                if width < 1101:
                    expect(page.get_by_role('complementary')).to_be_hidden()
                    row = page.get_by_role('button', name='Heldag Skole Timeplan Låst', exact=True)
                    # iPad flytter statusen fra radens slutt til tidslinjen.
                    if width == 834:
                        row = page.get_by_role('button', name='Heldag Låst Skole Timeplan', exact=True)
                    row.click()
                    dialog = page.get_by_role('dialog', name='Detaljer om avtalen')
                    expect(dialog).to_be_visible()
                    expect(dialog.get_by_text('Skoleavtalen vises fra timeplanen.')).to_be_visible()
                    expect(dialog.get_by_role('button', name='Flytt økt')).to_have_count(0)
                    page.keyboard.press('Escape')
                    expect(row).to_be_focused()
                    page.get_by_role('button', name='tirsdag 18. august', exact=True).click()
                    expect(page.get_by_role('heading', name='Ingen avtaler denne dagen' if state != 'tom' else 'Plass til en god uke')).to_be_visible()
                    page.get_by_role('button', name='mandag 17. august', exact=True).click()
                else:
                    expect(page.get_by_role('complementary')).to_be_visible()
                    expect(page.locator('[data-time-grid-day]')).to_have_count(7)
                    page.get_by_role('button', name='Skole', exact=True).click()
                    expect(page.get_by_role('complementary').get_by_text('Skoleavtalen vises fra timeplanen.')).to_be_visible()
                    if state == 'overlapp':
                        a = page.get_by_role('button', name='Innspill 50–80 m, mandag').bounding_box()
                        b = page.get_by_role('button', name='Overlappende økt, mandag').bounding_box()
                        assert a['x'] + a['width'] <= b['x'] or b['x'] + b['width'] <= a['x']
                        late = page.get_by_role('button', name='Sen kort økt, mandag')
                        late.scroll_into_view_if_needed()
                        assert late.bounding_box()['height'] >= 34
                        late.click()
                        expect(page.get_by_role('complementary').get_by_role('heading', name='Sen kort økt')).to_be_visible()
                if state == 'fylt':
                    if width >= 1101:
                        page.get_by_role('button', name='Innspill 50–80 m, mandag').click()
                    page.evaluate('window.scrollTo(0,0)')
                    page.screenshot(path=str(OUT / f'ph-07-app-{width}-{theme}.png'), full_page=True)
                variants.append({'width': width, 'theme': theme, 'state': state})
    # Forslag: samme vekt på begge svar, vent på reell (syntetisk) serverrespons.
    for width in [390, 1440]:
        page.set_viewport_size({'width': width, 'height': 852})
        for state, decision in [('fylt', 'ACCEPTED'), ('fylt', 'REJECTED'), ('feil', 'ACCEPTED')]:
            page.goto(f'{BASE}/plan-prove?tilstand={state}')
            if width == 1440:
                page.get_by_role('button', name='Nærspill – ekstra, tirsdag').click()
                scope = page.get_by_role('complementary')
            else:
                scope = page.get_by_role('article')
            accept = scope.get_by_role('button', name='Legg i planen')
            reject = scope.get_by_role('button', name='Ikke denne uka')
            assert accept.evaluate('e=>getComputedStyle(e).backgroundColor') == reject.evaluate('e=>getComputedStyle(e).backgroundColor')
            (accept if decision == 'ACCEPTED' else reject).click()
            expect(accept).to_be_disabled()
            page.wait_for_function('window.planKall.length === 1')
            if state == 'feil':
                expect(page.get_by_role('alert').filter(visible=True)).to_have_text('Endringen ble ikke lagret. Prøv igjen.')
                expect(accept).to_be_enabled()
                assert page.evaluate('window.tnOppfriskinger') == 0
            else:
                expect(page.get_by_role('status').filter(visible=True)).to_have_text('Økten er lagt i planen.' if decision == 'ACCEPTED' else 'Forslaget er avslått.')
                assert page.evaluate('window.planKall[0].input.decision') == decision
                assert page.evaluate('window.tnOppfriskinger') == 1
                if decision == 'ACCEPTED':
                    if width < 1101:
                        page.get_by_role('button', name='tirsdag 18. august', exact=True).click()
                        expect(page.get_by_role('button', name='14.00 Nærspill – ekstra')).to_be_visible()
                    else:
                        expect(page.get_by_role('button', name='Nærspill – ekstra, tirsdag')).to_be_visible()
                    expect(page.get_by_text('3 av 5 økter', exact=True).filter(visible=True)).to_be_visible()
    # Øktark, fokusfelle, flytting og riktig startlenke.
    for width in [390, 1440]:
        page.set_viewport_size({'width': width, 'height': 852})
        page.goto(f'{BASE}/plan-prove')
        if width < 1101:
            trigger = page.get_by_role('button', name='09.00 Innspill 50–80 m')
            trigger.click()
            scope = page.get_by_role('dialog')
            for _ in range(12):
                page.keyboard.press('Tab')
                assert scope.evaluate('e=>e.contains(document.activeElement)')
        else:
            page.get_by_role('button', name='Innspill 50–80 m, mandag').click()
            scope = page.get_by_role('complementary')
        expect(scope.get_by_role('link', name='Start økt')).to_have_attribute('href', '/portal/live/test-okt/brief')
        scope.get_by_role('button', name='Flytt økt').click()
        scope.get_by_label('Dato', exact=True).fill('2026-08-18')
        scope.get_by_label('Klokkeslett', exact=True).fill('10:30')
        scope.get_by_role('button', name='Lagre tidspunkt').click()
        expect((scope if width < 1101 else page).get_by_role('status').filter(visible=True)).to_contain_text('Økten er flyttet.')
        assert page.evaluate('window.planKall[0].input.newStartMinute') == 630
        expect(scope.get_by_text('tirsdag 18. august · 10.30 · 50 min')).to_be_visible()
    # Større tekst får vokse; ingen skjult horisontal rulling.
    page.set_viewport_size({'width': 390, 'height': 852})
    page.goto(f'{BASE}/plan-prove?tilstand=lang')
    expect(page.get_by_role('heading', name='Plan', exact=True)).to_be_visible()
    page.evaluate('document.fonts.ready')
    page.add_style_tag(content='html{font-size:32px}')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    for width in [390, 834, 1440]:
        page.set_viewport_size({'width': width, 'height': 852})
        page.goto(f'{BASE}/plan-prove?tilstand=laster')
        expect(page.get_by_role('status', name='Laster planen')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    reference = context.new_page()
    reference.set_viewport_size({'width': 1700, 'height': 1000})
    reference.goto(f'{BASE}/ph-07-reference.html')
    reference.add_style_tag(url=f'{BASE}/geist.css')
    reference.evaluate('document.fonts.ready')
    for label, key in [('PH-07v3a Plan 393 lys', '393-light'), ('PH-07v3g Plan 834 lys', '834-light'), ('PH-07v3h Plan 1440 lys', '1440-light')]:
        frame = reference.locator(f'[data-screen-label="{label}"]:visible')
        expect(frame).to_be_visible()
        frame.screenshot(path=str(OUT / f'ph-07-kilde-{key}.png'))
    assert not errors, errors
    (OUT / 'plan-resultat.json').write_text(json.dumps({'variants': variants, 'errors': errors, 'actions': '2 widths: accepted/rejected/failure, move, focus; synthetic intercepted actions only', 'limitations': 'component fixture, simulated routing, no authenticated live account'}, indent=2))
    browser.close()
    print(f'Plan: {len(variants)} varianter og svar/flytting/fokus bestod.')
