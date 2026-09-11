"""V3-meny, Caddie-ark og fangst i native dialog. Kun syntetisk nettverk."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright, expect
BASE = 'http://127.0.0.1:5441'
OUT = Path('_archive/portering-kontroll-2026-09-10')
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context()
    context.add_init_script('window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined;')
    context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    variants = []
    for width in [320, 390, 834, 1440]:
        for theme in ['light', 'dark']:
            page.set_viewport_size({'width': width, 'height': 900})
            page.goto(f'{BASE}/player-nav?tema={theme}')
            expect(page.get_by_role('heading', name='Navigasjonsprøve')).to_be_visible()
            island = page.locator('[data-tl-player-island]')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            if width < 1101:
                expect(island).to_be_visible()
                assert island.bounding_box()['height'] == 64
                expect(island.get_by_role('link')).to_have_count(4)
                expect(island.get_by_role('button')).to_have_count(1)
                for link in island.get_by_role('link').all():
                    box = link.bounding_box()
                    assert box['width'] == 48 and box['height'] == 48
                expect(island.get_by_role('link', name='Plan', exact=True)).to_have_attribute('href', '/portal/planlegge')
                page.get_by_label('Aktiv seksjon').select_option('analyse')
                expect(island.get_by_role('link', name='Analyse', exact=True)).to_have_attribute('aria-current', 'page')
                old_y = island.bounding_box()['y']
                page.get_by_role('button', name='Siste handling').scroll_into_view_if_needed()
                assert island.bounding_box()['y'] == old_y
                last = page.get_by_role('button', name='Siste handling').bounding_box()
                assert last['y'] + last['height'] <= island.bounding_box()['y']
            else:
                expect(island).not_to_be_visible()
            opener = page.get_by_role('button', name='Spør Caddie', exact=True)
            expect(page.get_by_role('textbox')).to_have_count(0)
            opener.click()
            dialog = page.get_by_role('dialog', name='Spør Caddie', exact=True)
            expect(dialog).to_be_visible()
            assert dialog.evaluate('el=>el.matches(":modal")')
            assert dialog.bounding_box()['width'] == (380 if width >= 768 else width)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            for _ in range(6):
                page.keyboard.press('Tab')
                assert dialog.evaluate('el=>el.contains(document.activeElement)')
            field = dialog.get_by_role('textbox')
            field.fill('Bevar denne syntetiske kladden')
            page.keyboard.press('Escape')
            expect(dialog).not_to_be_visible()
            expect(opener).to_be_focused()
            opener.click()
            expect(field).to_have_value('Bevar denne syntetiske kladden')
            # Capture must stay in the browser's top layer and close independently.
            dialog.get_by_role('button', name='Mikrofon', exact=True).click()
            capture = page.get_by_role('dialog', name='Fang med stemmen', exact=True)
            expect(capture).to_be_visible()
            assert capture.evaluate('el=>Boolean(el.closest("dialog:modal"))')
            for _ in range(18):
                page.keyboard.press('Tab')
                assert capture.evaluate('el=>el.contains(document.activeElement)')
            page.keyboard.press('Escape')
            expect(capture).to_have_count(0)
            expect(dialog).to_be_visible()
            expect(field).to_have_value('Bevar denne syntetiske kladden')
            dialog.get_by_role('button', name='Lukk Caddie', exact=True).click()
            expect(opener).to_be_focused()
            if width in [390, 834, 1440]:
                page.screenshot(path=str(OUT / f'player-nav-{width}-{theme}.png'), full_page=False)
            variants.append({'width': width, 'theme': theme})
    assert not errors, errors
    (OUT / 'player-nav-resultat.json').write_text(json.dumps({'variants': variants, 'errors': errors, 'interactions': 'passed', 'scope': 'actual navigation/composer components; simulated Next routing; no chat submitted'}, indent=2))
    browser.close()
    print('PlayerHQ v3: åtte varianter; meny, Caddie, bevart kladd og stemmeark bestod.')
