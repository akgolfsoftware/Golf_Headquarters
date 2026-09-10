"""Faktiske v3-komponenter med syntetiske data og lokale reservefonter."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUTPUT = Path("_archive/portering-kontroll-2026-09-10")
BASE = "http://127.0.0.1:5441"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    context = browser.new_context()
    context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(BASE) else route.abort())
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    variants = []
    for width in [320, 390, 834, 1440]:
        page.set_viewport_size({"width": width, "height": 950})
        for theme in ["light", "dark"]:
            for state in ["start", "live", "fullfort", "lang"]:
                page.goto(f"{BASE}/portal?tema={theme}&tilstand={state}")
                expect(page.locator("html")).to_have_attribute("data-train-lock", "4")
                expect(page.get_by_role("heading", name="I dag", exact=True)).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, theme, state)
                assert page.locator("body").evaluate("el=>getComputedStyle(el).backgroundColor") == ("rgb(0, 0, 0)" if theme == "dark" else "rgb(242, 241, 237)")
                cta = page.get_by_role("link", name={"start": "Start økt", "lang": "Start økt", "live": "Fortsett", "fullfort": "Se recap"}[state])
                expect(cta).to_have_attribute("href", "/portal/tren/wb/syntetisk-okt")
                assert cta.bounding_box()["height"] >= 48
                expect(page.get_by_role("progressbar", name="Uke 37 · treningsminutter")).to_have_attribute("aria-valuenow", "75")
                if state == "live":
                    expect(page.get_by_role("progressbar", name="Økten", exact=True)).to_have_attribute("aria-valuenow", "45")
                    expect(page.get_by_text("28 min igjen")).to_be_visible()
                if width in [390, 1440] and state == "start":
                    page.screenshot(path=str(OUTPUT / f"ph-01-naa-{width}-{theme}.png"), full_page=True)
                variants.append({"width": width, "theme": theme, "state": state})

    # Lagret valg overlever ruteveksling, også uten V2Shell.
    page.goto(f"{BASE}/portal?tema=dark")
    page.get_by_role("button", name="AgencyOS", exact=True).click()
    expect(page.locator("html")).to_have_attribute("data-v2-tema", "dark")
    page.get_by_role("button", name="PlayerHQ fullskjerm", exact=True).click()
    expect(page.locator("html")).to_have_attribute("data-v2-tema", "dark")
    page.get_by_role("button", name="WANG", exact=True).click()
    expect(page.locator("html")).not_to_have_attribute("data-train-lock", "4")
    page.goto(f"{BASE}/portal")
    assert page.locator("body").evaluate("el=>getComputedStyle(el).backgroundColor") == "rgb(242, 241, 237)"
    page.get_by_role("button", name="AgencyOS", exact=True).click()
    expect(page.locator("html")).to_have_attribute("data-v2-tema", "dark")
    page.get_by_role("button", name="PlayerHQ fullskjerm", exact=True).click()
    expect(page.locator("html")).not_to_have_attribute("data-v2-tema", "dark")

    # Arket åpnes med fokus inne, Shift+Tab blir i arket, Escape går tilbake.
    trigger = page.get_by_role("button", name="I dag i tiden", exact=True)
    trigger.click()
    dialog = page.get_by_role("dialog", name="I dag i tiden")
    expect(dialog).to_be_focused()
    page.keyboard.press("Shift+Tab")
    close = dialog.get_by_role("button", name="Lukk", exact=True)
    expect(close).to_be_focused()
    assert close.bounding_box()["width"] >= 44 and close.bounding_box()["height"] >= 44
    assert dialog.evaluate("el=>getComputedStyle(el).borderTopLeftRadius") == "32px"
    page.keyboard.press("Escape")
    expect(dialog).to_have_count(0)
    expect(trigger).to_be_focused()
    assert not errors, errors
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "train-lock-resultat.json").write_text(json.dumps({"variants": variants, "interactions": "passed", "errors": errors, "limitations": "isolated components; fallback fonts; simulated Next navigation"}, indent=2))
    browser.close()
    print(f"Train-lock: {len(variants)} varianter, rute/tema og tastatur bestod.")
