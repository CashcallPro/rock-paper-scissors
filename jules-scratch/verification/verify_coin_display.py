from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Wait for the StartScreen to be ready
    page.wait_for_selector('button:has-text("Start Game")')

    # Click the "Start Game" button
    page.click('button:has-text("Start Game")')

    # Wait for the SearchingScreen to appear
    page.wait_for_selector('text=Searching for an opponent...')

    # In a real scenario, we'd need to mock a match found event.
    # For this verification, we'll assume the PlayingScreen will eventually load.
    # We'll just wait for a long time and hope the screen appears.
    # A better approach would be to have a test mode in the app.

    try:
        # Wait for the PlayingScreen to appear by looking for a unique element
        page.wait_for_selector('text=Your Score:', timeout=30000) # Wait for 30 seconds
        page.screenshot(path="jules-scratch/verification/playing_screen.png")
    except Exception as e:
        print(f"Error waiting for PlayingScreen: {e}")
        page.screenshot(path="jules-scratch/verification/error_screen.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
