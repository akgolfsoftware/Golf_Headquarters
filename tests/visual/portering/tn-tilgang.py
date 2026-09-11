"""Nettleserprøve av ekte TN-komponenter med syntetiske svar og isolert ruting."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = "http://127.0.0.1:5441/team-norway/tilgang"
OUT = Path("_archive/portering-kontroll-2026-09-10")
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.route("**/*", lambda route: route.continue_() if route.request.url.startswith("http://127.0.0.1:5441/") else route.abort())

    def visit(query=""):
        page.goto(BASE + query)
        page.wait_for_load_state("networkidle")
        expect(page.locator("#root")).not_to_be_empty()

    # DOM inspiseres før interaksjonene. Alle persondata er syntetiske.
    visit()
    assert page.get_by_role("heading", name="2 personer med tilgang").is_visible()
    variants = []
    for width in (320, 390, 834, 1440):
        page.set_viewport_size({"width": width, "height": 1000 if width >= 834 else 844})
        for state, query in (("liste", ""), ("valgt", "?valgt=syntetisk-1"), ("tom", "?fixture=tom"), ("laster", "?fixture=laster"), ("feil", "?fixture=feil")):
            visit(query)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, state, "horisontal overflyt")
            if state == "valgt":
                expect(page.get_by_label("Fra", exact=True)).to_be_visible()
                button = page.get_by_role("button", name="Lagre tilgang", exact=True)
                rect = button.bounding_box()
                assert rect["height"] >= 44 and rect["x"] >= 0 and rect["x"] + rect["width"] <= width
            if width in (390, 1440) and state in ("liste", "valgt"):
                page.screenshot(path=str(OUT / f"tn-18-{state}-{width}.png"), full_page=True)
            variants.append({"bredde": width, "tilstand": state, "uten_overflyt": True})

    page.set_viewport_size({"width": 390, "height": 844})
    visit()
    page.get_by_role("link", name="Eksempel Trener Med Et Langt Etternavn", exact=False).filter(visible=True).click()
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("link", name="Tilbake til trenerlisten")).to_be_visible()
    expect(page.get_by_role("heading", name="2 personer med tilgang")).not_to_be_visible()
    page.get_by_role("link", name="Tilbake til trenerlisten").click()
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("heading", name="2 personer med tilgang")).to_be_visible()

    # Tastaturmeny, synlig aktiv rute og fokus tilbake ved Escape.
    menu = page.get_by_role("button", name="Åpne meny")
    menu.click()
    link = page.get_by_role("navigation", name="Team Norway").get_by_role("link")
    expect(link).to_have_attribute("aria-current", "page")
    link.focus()
    page.keyboard.press("Escape")
    expect(menu).to_be_focused()
    expect(menu).to_have_attribute("aria-expanded", "false")

    # Nettfeil bevarer valg; neste forsøk får akkurat samme payload.
    visit("?valgt=syntetisk-1&fixture=nettfeil")
    page.get_by_role("button", name="Hjelpetrener", exact=True).click()
    page.get_by_label("Fra", exact=True).fill("2026-09-12")
    page.get_by_label("Til", exact=True).fill("2026-09-30")
    page.get_by_role("button", name="Lagre tilgang", exact=True).click()
    expect(page.get_by_role("button", name="Lagrer …", exact=True)).to_be_disabled()
    # Et nytt submit i samme ventetid må ikke sende et nytt kall.
    page.locator("form").evaluate("form => form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
    expect(page.get_by_role("alert")).to_contain_text("Valgene dine er beholdt")
    expect(page.get_by_label("Fra", exact=True)).to_have_value("2026-09-12")
    expect(page.get_by_role("button", name="Hjelpetrener", exact=True)).to_have_attribute("aria-pressed", "true")
    assert page.evaluate("window.tnResultatlogg.length") == 1
    page.get_by_role("button", name="Lagre tilgang", exact=True).click()
    expect(page.get_by_role("status")).to_have_text("Tilgangen er lagret.")
    requests = page.evaluate("window.tnResultatlogg")
    assert len(requests) == 2 and requests[0] == requests[1]
    assert requests[0]["rolle"] == "ASSISTANT" and requests[0]["targetUserId"] == "syntetisk-1"

    visit("?valgt=syntetisk-1&fixture=siste-trener")
    page.get_by_role("button", name="Avslutt", exact=True).click()
    expect(page.get_by_role("alert")).to_contain_text("Siste trener i Testgruppen")
    page.get_by_role("button", name="Tilbake", exact=True).click()
    expect(page.get_by_label("Fra", exact=True)).to_have_value("2026-08-01")

    visit("?fixture=kontroller")
    field = page.get_by_label("Kontrollfelt", exact=True)
    expect(field).to_have_attribute("aria-invalid", "true")
    expect(page.locator("#" + field.get_attribute("aria-describedby").replace(":", "\\:"))).to_have_text("Fyll inn feltet")
    expect(page.get_by_text("Dette hintet skal erstattes")).to_have_count(0)
    for size, minimum in (("sm", 44), ("md", 48), ("lg", 56)):
        assert page.get_by_role("button", name="Knapp " + size, exact=True).bounding_box()["height"] >= minimum
    expect(page.get_by_role("button", name="Sperret knapp")).to_be_disabled()
    page.emulate_media(reduced_motion="reduce")
    button = page.get_by_role("button", name="Knapp md", exact=True)
    box = button.bounding_box()
    page.mouse.move(box["x"] + 10, box["y"] + 10)
    page.mouse.down()
    assert button.evaluate("el => getComputedStyle(el).transform") == "none"
    page.mouse.up()
    assert not errors, errors

    result = {"varianter": variants, "interaksjoner": "bestått", "nettfeil_og_nytt_forsok": "bestått", "dobbelt_submit": "avvist", "siste_trener": "bevart", "javascript_feil": errors, "avgrensning": "Komponentprøve med syntetiske serversvar, simulert Next-ruting og lokale reservefonter; ingen produksjons- eller innloggingstest."}
    (OUT / "tn-18-resultat.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    browser.close()
    print(f"TN-18: {len(variants)} skjermvarianter og interaksjonsprøvene bestod.")
