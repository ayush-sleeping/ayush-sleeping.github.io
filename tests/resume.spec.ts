// The resume: "Download resume" / "Download PDF" fetch the PDF in public/assets/resume/, and
// printing the page (Ctrl+P) still shows only About, Experience, Education and Skills.
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("the page carries the resume's facts and the download links", async ({ page }) => {
  await page.goto("./");
  const links = page.locator("a[download]");
  // Home button, sidebar row, Help band.
  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", /assets\/resume\/Ayush_Mishra_Resume\.pdf$/);
  }
  await expect(page.locator("#education a[href^='https://']")).toHaveCount(2);
  await expect(page.locator("#education")).toContainText("Data Structures");
});

test("Download resume downloads the PDF", async ({ page, request }) => {
  await page.goto("./");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#home a[download]").click(),
  ]);
  expect(download.suggestedFilename()).toBe("Ayush_Mishra_Resume.pdf");
  const href = await page.locator("#home a[download]").getAttribute("href");
  const res = await request.get(href!);
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("print shows only the resume sections", async ({ page }) => {
  await page.goto("./");
  await page.emulateMedia({ media: "print" });
  for (const id of ["home", "certifications", "projects", "services", "contact", "faq"]) {
    await expect(page.locator(`#${id}`)).toBeHidden();
  }
  await expect(page.locator("aside[data-i~='side']")).toBeHidden();
  for (const id of ["about", "experience", "education", "skills"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});
