"""Prøver bygget Next-app med aktiv CSP. Alle eksterne forespørsler avskjæres.

Kjør kun mot kontrollkopien med syntetiske miljøverdier (se README).
"""
from pathlib import Path
import base64
import json
import re
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / '_archive/portering-kontroll-2026-09-10'
BASE = 'http://127.0.0.1:5452'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(service_workers='block')
    page = context.new_page()
    errors, security_errors, requests = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: security_errors.append(m.text) if 'Content Security Policy' in m.text else None)

    def network(route):
        if route.request.url.startswith(BASE + '/'):
            route.continue_()
        elif route.request.url.startswith('https://dummy.supabase.co/auth/v1/token'):
            if route.request.method == 'POST':
                requests.append(route.request.post_data_json)
            route.fulfill(status=400, content_type='application/json',
                          headers={'access-control-allow-origin': BASE},
                          body=json.dumps({'code': 'invalid_credentials', 'message': 'Invalid login credentials'}))
        else:
            route.abort()

    context.route('**/*', network)
    nonces = []
    for width in [390, 1280]:
        page.set_viewport_size({'width': width, 'height': 900})
        response = page.goto(BASE + '/team-wang/logg-inn')
        page.wait_for_load_state('networkidle')
        page.evaluate('document.fonts.ready')
        csp = response.headers.get('content-security-policy', '')
        nonce = re.search(r"'nonce-([^']+)'", csp).group(1)
        nonces.append(nonce)
        # Next must attach the request's nonce to its own scripts. Do not bypass CSP.
        assert page.locator('script[src]').count() > 0
        assert page.locator('script[src^="/_next/"]').evaluate_all('(els,n)=>els.every(el=>el.nonce===n)', nonce)
        heading = page.get_by_role('heading', name='Logg inn', exact=True)
        expect(heading).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert 'Montserrat' in heading.evaluate('el=>getComputedStyle(el).fontFamily')
        assert page.evaluate('document.fonts.check("800 26px Montserrat")')
        assert page.locator('html').get_attribute('data-train-lock') is None
        page.screenshot(path=str(OUT / f'wang-c7-app-{width}.png'), full_page=True)
    assert len(set(nonces)) == 2, 'Nonce must be fresh for each request'
    page.get_by_label('E-post', exact=True).fill('syntetisk@example.invalid')
    page.get_by_label('Passord', exact=True).fill('bare-syntetisk-test')
    page.get_by_role('button', name='Logg inn', exact=True).click()
    expect(page.locator('form').get_by_role('alert')).to_contain_text('Kunne ikke logge inn')
    assert len(requests) == 1
    assert requests[0]['email'] == 'syntetisk@example.invalid'
    assert requests[0]['password'] == 'bare-syntetisk-test'
    expect(page.get_by_label('E-post', exact=True)).to_have_value('syntetisk@example.invalid')
    assert not errors, errors
    assert not security_errors, security_errors

    # Source frames use the same font files, without fetching Google Fonts.
    font_css = []
    for css_file in (ROOT / '.worktrees/portering-kontroll-2026-09-10/.next/static/chunks').glob('*.css'):
        for block in re.findall(r'@font-face\s*\{[^}]+\}', css_file.read_text()):
            if ('Montserrat' in block or 'Quattrocento' in block) and 'src:url' in block:
                def embed_font(match):
                    font_file = css_file.parent / match.group(1)
                    encoded = base64.b64encode(font_file.read_bytes()).decode()
                    return 'url(data:font/woff2;base64,' + encoded + ')'
                font_css.append(re.sub(r'url\([\"\']?(\.\./media/[^)\"\']+)[\"\']?\)', embed_font, block))

    def local_css(file):
        text = file.read_text()
        def inline(match):
            address = match.group(1)
            if address.startswith(('http:', 'https:')):
                return ''
            return local_css(file.parent / address)
        return re.sub(r'@import\s+url\("([^"]+)"\);', inline, text)

    source = (ROOT / 'designsystem/wang/skjermer-batch2/c7-logg-inn.html').read_text()
    source = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', '', source)
    css = local_css(ROOT / 'designsystem/wang/styles.css') + local_css(ROOT / 'designsystem/wang/skjermer-batch1/skjerm.css')
    reference = context.new_page()
    reference.set_viewport_size({'width': 1280, 'height': 900})
    reference.set_content('<style>' + css + '\n' + ''.join(font_css) + '</style>' + source, wait_until='networkidle')
    reference.evaluate('document.fonts.ready')
    assert reference.evaluate('document.fonts.check("800 22px Montserrat")')
    reference.locator('.phone').first.screenshot(path=str(OUT / 'wang-c7-referanse-390.png'))
    reference.locator('.desk').first.screenshot(path=str(OUT / 'wang-c7-referanse-desktop.png'))
    result = {'appWidths': [390, 1280], 'fonts': 'actual Next font files',
              'auth': 'actual SDK request intercepted locally; no real login',
              'csp': 'enforced; framework script nonces match; fresh nonce per request',
              'jsErrors': errors, 'securityErrors': security_errors,
              'reference': 'C7 original phone 390 and desktop frame 980'}
    (OUT / 'wang-c7-next-resultat.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    browser.close()
    print('WANG C7: Next-bygg, CSP, Montserrat, mobil/desktop og SDK-felt bestod. Ingen reell innlogging.')
