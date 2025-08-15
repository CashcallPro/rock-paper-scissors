from playwright.sync_api import sync_playwright, Page, expect

def verify_button_styles(page: Page):
    """
    This script verifies the styling of the choice buttons on the playing screen.
    """
    # 1. Arrange: Go to the application's start page.
    page.goto("http://localhost:3000")

    # 2. Act: Click the "BATTLE" button to navigate to the playing screen.
    # We wait for the button to be visible to ensure the page has loaded.
    battle_button = page.get_by_role("button", name="BATTLE")
    expect(battle_button).to_be_visible(timeout=30000) # Increased timeout for slow server
    battle_button.click()

    # The game goes through a 'searching' and 'opponentFound' phase.
    # We need to wait for the playing screen to be rendered.
    # A good indicator for the playing screen is the presence of the choice buttons.
    # Let's wait for the "Rock" button to appear.
    rock_button = page.get_by_role("button", name="Rock\n✊")
    expect(rock_button).to_be_visible(timeout=30000)

    # 3. Screenshot: Capture the choice buttons for visual verification.
    # We can take a screenshot of the container of the buttons.
    buttons_container = page.locator(".z-10.flex.flex-row")
    expect(buttons_container).to_be_visible()
    buttons_container.screenshot(path="jules-scratch/verification/button_styles.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_button_styles(page)
        browser.close()

if __name__ == "__main__":
    main()
