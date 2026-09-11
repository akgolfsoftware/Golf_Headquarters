"""C7: brukerens felt sendes én gang, feil bevarer felt, ingen kontooppretting."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = "http://127.0.0.1:5441"
OUTPUT = Path("_archive/portering-kontroll-2026-09-10")
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context()
    context.route("**/*", lambda r: r.continue_() if r.request.url.startswith(BASE) else r.abort())
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    variants = []
    for width in [320, 390, 834, 1280]:
        page.set_viewport_size({"width": width, "height": 900})
        for mode in ["klar", "passordfeil", "nettfeil"]:
            page.goto(f"{BASE}/team-wang/logg-inn?mode={mode}")
            expect(page.get_by_role("heading", name="Logg inn", exact=True)).to_be_visible()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, mode)
            expect(page.get_by_label("Elevens navn")).to_have_count(0)
            expect(page.get_by_role("link", name="Fortsett uten å logge inn")).to_have_attribute("href", "/team-wang")
            expect(page.get_by_role("link", name="Glemt passord")).to_have_attribute("href", "/auth/forgot-password")
            email = page.get_by_label("E-post", exact=True)
            password = page.get_by_label("Passord", exact=True)
            expect(email).to_have_attribute("autocomplete", "username")
            expect(password).to_have_attribute("autocomplete", "current-password")
            submit = page.get_by_role("button", name="Logg inn", exact=True)
            assert submit.bounding_box()["height"] >= 48
            assert email.evaluate("el=>getComputedStyle(el).fontSize") == "16px"
            if mode != "klar":
                email.fill("syntetisk@example.invalid")
                password.fill("bare-en-syntetisk-test")
                submit.click()
                expect(page.get_by_role("button", name="Logger inn …")).to_be_disabled()
                page.locator("form").evaluate("form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
                expect(page.get_by_role("alert")).to_be_visible()
                assert page.evaluate("window.wangForsok") == 1
                assert page.evaluate("window.wangFelt") == {"epost": "syntetisk@example.invalid", "passord": "bare-en-syntetisk-test"}
                expect(email).to_have_value("syntetisk@example.invalid")
                expect(password).to_have_value("bare-en-syntetisk-test")
                if mode == "nettfeil":
                    page.get_by_role("button", name="Logg inn", exact=True).click()
                    expect(page.get_by_role("status")).to_have_text("Du er logget inn.")
                    assert page.evaluate("window.wangForsok") == 2
            if width in [390, 1280] and mode == "klar":
                page.screenshot(path=str(OUTPUT / f"wang-c7-{width}.png"), full_page=True)
            variants.append({"width": width, "state": mode})
    page.goto(f"{BASE}/team-wang/logg-inn")
    page.get_by_label("Passord", exact=True).fill("syntetisk")
    page.get_by_role("button", name="Vis passord", exact=True).click()
    expect(page.get_by_label("Passord", exact=True)).to_have_attribute("type", "text")
    page.get_by_role("button", name="Skjul passord", exact=True).click()
    expect(page.get_by_label("Passord", exact=True)).to_have_attribute("type", "password")
    assert not errors, errors
    (OUTPUT / "wang-c7-resultat.json").write_text(json.dumps({"variants": variants, "interactions": "passed", "errors": errors, "limitations": "simulated auth responses; fallback fonts"}, indent=2))
    browser.close()
    print(f"WANG C7: {len(variants)} varianter, feltinnsending og feiltilstander bestod.")
