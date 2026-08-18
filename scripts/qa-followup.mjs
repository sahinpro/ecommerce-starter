import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const out = {};

  await page.goto(`${BASE}/admin/sign-in`, { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill('not-an-admin@example.com');
  await page.locator('#password').fill('wrong-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(1500);
  out.invalidLoginUrl = page.url();
  out.invalidLoginAlert = await page.getByRole('alert').innerText().catch(() => '');

  out.responsive = [];
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 8
    );
    const mobileMenu = await page.locator('button[aria-label="Open menu"]').locator('visible=true').count();
    const primary = await page.getByRole('navigation', { name: 'Primary' }).locator('visible=true').count();
    const wishlist = await page.getByRole('button', { name: /^wishlist$/i }).locator('visible=true').count();
    await page.goto(`${BASE}/shop`, { waitUntil: 'domcontentloaded' });
    const shopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 8
    );
    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded' });
    const checkoutText = await page.locator('h1').first().innerText();
    out.responsive.push({
      width,
      homeOverflow: overflow,
      shopOverflow,
      nav: mobileMenu + primary,
      wishlist,
      checkoutH1: checkoutText.trim()
    });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded' });
  out.about = { status: 200, title: await page.title() };
  await page.goto(`${BASE}/faq`, { waitUntil: 'domcontentloaded' });
  out.faq = await page.title();

  await browser.close();
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
