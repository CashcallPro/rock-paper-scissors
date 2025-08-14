from playwright.sync_api import Page, expect

def test_gifts_page(page: Page):
    """
    This test verifies that the gifts page is rendered correctly.
    """
    # 1. Arrange: Go to the gifts page.
    page.goto("http://localhost:3000/gifts")

    # 2. Assert: Confirm the page has the correct title.
    expect(page.locator("h1")).to_have_text("Gifts")

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")
