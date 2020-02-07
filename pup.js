"use strict";

(async () => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: false
    // Launch chromium using a proxy server on port 9876.
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
  });
  const page = await browser.newPage();
  await page.goto(
    "https://s167-es.ogame.gameforge.com/game/index.php?page=ingame&component=research"
  );
  //   await browser.close();
})();
