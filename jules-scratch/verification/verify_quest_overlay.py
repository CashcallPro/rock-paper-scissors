from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Arrange: Go to the application homepage.
    page.goto("http://localhost:3001")

    # Wait for the page to load and the start screen to be visible
    expect(page.get_by_text("Welcome to")).to_be_visible(timeout=30000)

    # 2. Act: Find the "Quests" button and click it.
    # We locate the div that contains the "Quests" span and then find the button inside it.
    quests_button_container = page.locator("div.flex.flex-col.items-center:has-text('Quests')")
    quests_button = quests_button_container.locator("button") # Assuming HeaderButton renders a button

    # A more direct selector if HeaderButton has a role of button
    # quests_button = page.get_by_role('button', name='Quests') # This would be ideal if accessible name is set

    # Let's try a more robust selector that finds the button near the "Quests" text
    quests_text = page.get_by_text("Quests")
    # Assuming the button is the first button element within the parent div of the text
    quest_button = quests_text.locator('xpath=./../button')

    # The most robust selector would be to add a test-id, but for now let's try this.
    # The structure is a div with a button and a span.
    # Let's click the span's parent's button.

    # The issue is that HeaderButton is a custom component. I don't know what it renders.
    # Let's assume it renders a button.
    # The div container has a `p-2` class.

    # Let's try to find the button by its background image. This is brittle.
    # backgroundImage="url('https://s3dux5rwcu.ufs.sh/f/3pYCTPyYdTmWUCM2kH9thzndp9rDx7cfkvlgICFVWXuHR3qb')"
    # I can't easily select by background image with playwright.

    # Let's stick with the text selector. The text is unique.
    # The button is a sibling of the span.

    # Final attempt at a selector, let's find the span and click the button before it.
    # This assumes the button is the preceding sibling of the span.
    # This is not correct from the code. The button is before the span in the div.

    # Let's use the text "Quests" to find the container div, and then find the button.
    # I'll use a CSS selector that looks for a div containing a span with the text "Quests"
    # and then finds a button within that div.
    quest_button_selector = "div:has(> span:text-is('Quests')) > button"

    # The text is "Quests", but in the code it's `Quests`. Let's be precise.
    quest_button_selector = "div:has(> span:text-is('Quests'))"
    quest_button_element = page.locator(quest_button_selector)

    # The onClick is on the HeaderButton, so we should click that.
    # HeaderButton is a react component. It probably renders a <button>
    # So let's find a button inside the container.

    quest_button = page.locator("div:has-text('Quests')").locator("button")

    # Let's try something simpler. Let's just click the text.
    # The parent div does not have an onClick. The HeaderButton does.
    # Let's assume the HeaderButton is a button.
    # The div has two children, HeaderButton and span.
    # I will click the button that is a child of the div that contains the span with text "Quests".

    quests_button = page.locator('div:has(span:has-text("Quests"))').locator('button')
    expect(quests_button).to_be_visible()
    quests_button.click()

    # 3. Assert: Confirm the overlay is visible.
    expect(page.get_by_text("Quests", exact=True)).to_be_visible()
    expect(page.get_by_text("Daily Quest")).to_be_visible()
    expect(page.get_by_text("Special Offer")).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/quest_overlay.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
