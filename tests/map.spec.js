const { test, expect } = require("@playwright/test");

test("map", async ({ page }) => {
	test.setTimeout(500000);
	await page.goto("/map/", { waitUntil: "networkidle" });
	// await page.waitForRequest('/map/photos.geojson');
	await page.waitForTimeout(10000);
	await expect(page).toHaveScreenshot("map-default.png");
});
