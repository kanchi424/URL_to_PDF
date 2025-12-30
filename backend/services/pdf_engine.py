from playwright.async_api import async_playwright
import os

class PdfEngine:
    def __init__(self, output_dir: str = "pdfs"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    async def generate_pdf(self, url: str, filename: str) -> str:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            # specific viewport for consistent desktop rendering
            page = await browser.new_page(viewport={"width": 1280, "height": 720}) 
            
            try:
                await page.goto(url, wait_until="networkidle")
                
                # Get the full height of the page
                dimensions = await page.evaluate("""() => {
                    return {
                        width: document.documentElement.scrollWidth,
                        height: document.documentElement.scrollHeight
                    }
                }""")
                
                width = dimensions["width"]
                height = dimensions["height"]
                
                # Ensure a minimum height/width if something goes wrong, but usually scroll dimensions are fine.
                # For pixel-perfect matching, we print to a PDF page size that matches the content.
                # page.pdf expects width/height as strings with units or numbers (pixels).
                
                path = os.path.join(self.output_dir, filename)
                
                # We do NOT set format="A4" here, so we can set valid width/height
                await page.pdf(
                    path=path,
                    width=f"{width}px",
                    height=f"{height}px",
                    print_background=True,
                    page_ranges="1" # We only want one long page usually, or let it paginate if needed? 
                                    # Actually, "pixel to pixel" usually implies one long strip like a screenshot.
                                    # If we set height to full scrollHeight, it will be one page.
                )
                
                await browser.close()
                return path
            except Exception as e:
                await browser.close()
                print(f"Error making PDF for {url}: {e}")
                raise e
