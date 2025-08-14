from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Verify the button on the start screen
    page.goto("http://localhost:3000")

    # The button is absolutely positioned, so we might need to wait for it to be visible
    # The button is a child of a div with class 'absolute'
    shop_button = page.locator('div.absolute > button')
    expect(shop_button).to_be_visible()

    page.screenshot(path="jules-scratch/verification/start_screen_with_button.png")

    # Verify navigation to the shop page
    shop_button.click()

    expect(page).to_have_url("http://localhost:3000/shop")
    expect(page.get_by_role("heading", name="Shop")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/shop_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
