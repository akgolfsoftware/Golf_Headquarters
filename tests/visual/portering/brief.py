"""PH-04: faktiske komponenter, syntetiske økter og avskåret start-handling."""
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
            for state in ['fylt', 'tom', 'lang', 'pagar', 'pause', 'ferdig', 'avlyst', 'coach', 'gratis', 'forslag']:
                page.goto(f'{BASE}/brief-prove?tema={theme}&tilstand={state}')
                expect(page.locator('h1')).to_be_visible()
                page.evaluate('document.fonts.ready')
                assert page.evaluate('[...document.fonts].some(f=>f.family==="Geist" && f.status==="loaded")')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, theme, state)
                expect(page.get_by_text('Eksempelbanen · 09:00–09:50', exact=True)).to_be_visible()
                if state in ['fylt', 'tom', 'lang']:
                    expect(page.get_by_role('button', name='Start økta', exact=True)).to_be_enabled()
                elif state in ['pagar', 'pause']:
                    expect(page.get_by_role('link', name='Fortsett økta')).to_have_attribute('href', '/portal/live/syntetisk-okt/tapper')
                elif state == 'ferdig':
                    expect(page.get_by_role('link', name='Se oppsummering')).to_have_attribute('href', '/portal/live/syntetisk-okt/summary')
                elif state == 'gratis':
                    expect(page.get_by_role('link', name='Se abonnement')).to_have_attribute('href', '/portal/meg/abonnement')
                else:
                    expect(page.get_by_role('button', name='Start økta', exact=True)).to_have_count(0)
                    expect(page.get_by_role('link', name='Se abonnement')).to_have_count(0)
                expect(page.get_by_role('link', name='Tilbake til Plan', exact=True).last).to_have_attribute('href', '/portal/planlegge')
                if state == 'fylt':
                    page.screenshot(path=str(OUT / f'brief-{width}-{theme}.png'), full_page=True)
                variants.append({'width': width, 'theme': theme, 'state': state, 'model': 'wb'})
    for model in ['plan', 'v2']:
        for width in [390, 1440]:
            page.set_viewport_size({'width': width, 'height': 852})
            page.goto(f'{BASE}/brief-prove?modell={model}')
            expect(page.locator('h1')).to_be_visible()
            if model == 'plan':
                expect(page.get_by_text('Åtte av tolv i vinduet.', exact=True)).to_be_visible()
                expect(page.get_by_text('Hold samme rutine gjennom hele oppgaven.', exact=True)).to_be_visible()
            else:
                expect(page.get_by_role('link', name='Start økta', exact=True)).to_have_attribute('href', '/portal/live/syntetisk-okt/active')
                expect(page.get_by_text('Lik rutine', exact=True)).to_be_visible()
                expect(page.get_by_text('10 min · 12 baller · Slag', exact=True)).to_have_count(2)
            variants.append({'width': width, 'state': 'fylt', 'model': model})
    for width in [320, 834]:
        page.set_viewport_size({'width': width, 'height': 600})
        page.goto(f'{BASE}/brief-prove?tilstand=lang')
        expect(page.locator('h1')).to_be_visible()
        page.evaluate('document.documentElement.style.fontSize="32px"')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        start = page.get_by_role('button', name='Start økta', exact=True)
        start.scroll_into_view_if_needed()
        expect(start).to_be_in_viewport()
        assert start.bounding_box()['height'] >= 48
    page.set_viewport_size({'width': 390, 'height': 852})
    page.goto(f'{BASE}/brief-prove?tilstand=feil')
    button = page.get_by_role('button', name='Start økta', exact=True)
    button.focus()
    page.keyboard.press('Enter')
    expect(page.get_by_role('button', name='Åpner økta…')).to_be_disabled()
    expect(page.get_by_role('alert')).to_contain_text('Økta kunne ikke åpnes')
    expect(page.locator('h1')).to_have_text('Innspill 50–80 m')
    assert page.evaluate('window.briefKall') == 1
    # To innsendingshendelser i samme tur skal også beskyttes før React tegner.
    button.evaluate('(b)=>{b.form.requestSubmit(); b.form.requestSubmit()}')
    expect(page.get_by_role('button', name='Åpner økta…')).to_be_disabled()
    expect(button).to_be_enabled()
    assert page.evaluate('window.briefKall') == 2
    for url, label in [('ph-04-reference.html', 'PH-04 Økt-ark'), ('ph-04-wide-reference.html', 'PH-04 Økt-ark · Mac')]:
        page.set_viewport_size({'width': 1800, 'height': 1100})
        page.goto(f'{BASE}/{url}')
        frame = page.locator('[data-screen-label]:visible').filter(has=page.get_by_text('Innspill 50–80 m', exact=True)).last if 'wide' in url else page.locator('[data-screen-label="PH-04 Økt-ark"]:visible')
        expect(frame).to_be_visible()
        frame.screenshot(path=str(OUT / ('brief-source-mac.png' if 'wide' in url else 'brief-source-mobile.png')))
    OUT.joinpath('brief-sammenligning.html').write_text("""<!doctype html><html lang="nb"><meta charset="utf-8"><title>PH-04 – valgt kilde og øktark</title><style>body{margin:32px;font:16px system-ui;background:#f2f1ed;color:#111}section{display:flex;align-items:flex-start;gap:24px;overflow:auto}figure{margin:0;flex:none}img{max-width:100%;display:block}figcaption{margin:12px 0;max-width:600px;line-height:1.5}</style><h1>PH-04 · øktark</h1><p>Valgt ZIP (4). Syntetiske appdata. Kilden har eldre SF Pro, appen valgt Geist/v3. Direkte app-rute har eget ark. Bakgrunn og 380 px Mac-panel gjenstår; ingen visuell godkjenning er registrert.</p><section><figure><figcaption>Original PH-04 · mobil</figcaption><img src="brief-source-mobile.png" width="390"></figure><figure><figcaption>App · 390 px · mørk</figcaption><img src="brief-390-dark.png" width="390"></figure><figure><figcaption>App · 390 px · lys</figcaption><img src="brief-390-light.png" width="390"></figure></section><h2>Desktop</h2><figure><figcaption>Original B2 PH-04</figcaption><img src="brief-source-mac.png" width="1200"></figure><figure><figcaption>App · 1440 px · mørk, sentrert direktevisning</figcaption><img src="brief-1440-dark.png" width="1200"></figure></html>""")
    assert not errors, errors
    OUT.joinpath('brief-resultat.json').write_text(json.dumps({'variants': variants, 'extra': ['200% tekst', 'feil og nytt forsøk', 'dobbel innsending', 'tastatur'], 'errors': errors}, ensure_ascii=False, indent=2))
    print(f'PH-04: {len(variants)} varianter bestod, samt stor tekst, tastatur og feil ved start.')
    browser.close()
