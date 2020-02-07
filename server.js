const express = require("express");
const app = express();
const hbs = require("hbs");
require("./hbs/helpers/helpers");

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
//Express HBS engine
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
//Helpers

(async () => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: true
    // Launch chromium using a proxy server on port 9876.
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
  });
  const page = await browser.newPage();
  await page.goto("https://www.expressvpn.com/es/what-is-my-ip");
  await page.waitForSelector("p.ip-address");
  let data = page.evaluate(() => {
    var ip = document.querySelector("p.ip-address").innerText;
    var local = document.querySelector(
      ".col-right > .row-eq-height > .col-left-inner > .tool-panel__body > h4:nth-child(2)"
    ).innerText;
    var proveedor = document.querySelector(
      ".col-right > .row-eq-height > .col-left-inner > .tool-panel__body > .mb-0"
    ).innerText;
    return { ip, local, proveedor };
  });
  console.log("tu ip es: ", await data);
  //   await browser.close();
})();

app.get("/", (req, res) => {
  res.render("home", {
    nombre: "Victor Juan Jimenez Flores!",
    anio: new Date().getFullYear()
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});
