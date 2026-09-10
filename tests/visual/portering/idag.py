"""I dag: responsive innhold, tilstander og kalenderinngang. Ingen database."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUTPUT = Path('_archive/portering-kontroll-2026-09-10')
BASE = 'http://127.0.0.1:5441'
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context()
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE) else route.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    variants = []
    for width in [320, 390, 834, 1440]:
        page.set_viewport_size({'width': width, 'height': 852})
        for theme in ['light', 'dark']:
            for state in ['okt', 'pagar', 'fullfort', 'lang', 'tom-dag', 'tom-uke', 'hvile', 'feil']:
                page.goto(f'{BASE}/idag-prove?tema={theme}&tilstand={state}')
                expect(page.get_by_role('heading', level=1)).to_be_visible()
                page.evaluate('document.fonts.ready')
                assert page.evaluate('document.fonts.check("700 34px Geist") && [...document.fonts].some(f=>f.family==="Geist" && f.status==="loaded")')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, theme, state)
                assert page.locator('[data-od-id="ph-01-idag"]').evaluate('el=>el.scrollWidth<=el.clientWidth'), (width, theme, state)
                agenda = page.get_by_role('region', name='Resten av dagen')
                expect(agenda.get_by_text('Innspill 50–80 m', exact=True)).to_have_count(0)
                expect(agenda.get_by_role('link', name='07.30 Fys · mobilitet Hjemme · 20 min Fullført')).to_have_attribute('href', '/portal/live/fullfort/summary')
                trigger = page.get_by_role('button', name='I dag i tiden', exact=True)
                trigger.click()
                dialog = page.get_by_role('dialog', name='I dag i tiden')
                expect(dialog).to_be_visible()
                expect(dialog.get_by_text('Innspill 50–80 m', exact=True)).to_be_visible()
                page.keyboard.press('Escape')
                expect(dialog).to_have_count(0)
                expect(trigger).to_be_focused()
                if width < 1101:
                    expect(page.get_by_role('link', name='Åpne profilen min')).to_be_visible()
                    expect(page.get_by_role('complementary', name='Ukeoversikt')).to_be_hidden()
                else:
                    expect(page.get_by_role('heading', name='God morgen, Test')).to_be_visible()
                    expect(page.get_by_role('complementary', name='Ukeoversikt')).to_be_visible()
                if state in ['okt', 'pagar', 'fullfort', 'lang']:
                    cta = page.get_by_role('link', name='Fortsett' if state == 'pagar' else 'Se recap' if state == 'fullfort' else 'Start økt', exact=True)
                    assert cta.bounding_box()['height'] >= 48
                    expect(cta).to_have_attribute('href', '/portal/live/naa')
                if state == 'tom-dag':
                    expect(page.get_by_text('Uke 37 · 2 økter er gjennomført')).to_be_visible()
                if state == 'okt':
                    # Tilbake til toppen etter at kalenderknappen er scrollet frem.
                    page.locator('.ph01-scroll').evaluate('el=>el.scrollTop=0')
                    page.evaluate('document.activeElement.blur()')
                    page.screenshot(path=str(OUTPUT / f'ph-01-hel-{width}-{theme}.png'), full_page=True)
                variants.append({'width': width, 'theme': theme, 'state': state})
    # Samme faktiske Geist-filer på de valgte originalrammene, ingen netthenting.
    reference = context.new_page()
    reference.set_viewport_size({'width': 1700, 'height': 1000})
    reference.goto(f'{BASE}/ph-01-reference.html')
    reference.add_style_tag(url=f'{BASE}/geist.css')
    reference.evaluate('document.fonts.ready')
    for label, key in [('PH-01v3a I dag 393 lys', '393-light'), ('PH-01v3g I dag 834 lys', '834-light'), ('PH-01v3h I dag 1440 lys', '1440-light')]:
        frame = reference.locator(f'[data-screen-label="{label}"]:visible')
        expect(frame).to_be_visible()
        frame.screenshot(path=str(OUTPUT / f'ph-01-kilde-{key}.png'))
    assert not errors, errors
    (OUTPUT / 'idag-resultat.json').write_text(json.dumps({'variants': variants, 'errors': errors, 'limitations': 'synthetic component fixture; simulated Next routing; actual Geist files from isolated Next build; no live account'}, indent=2))
    browser.close()
    print(f'I dag: {len(variants)} varianter og kalender/fokus bestod.')
