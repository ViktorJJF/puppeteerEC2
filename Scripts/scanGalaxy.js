const { Random, timeout, msToTime } = require("../utils/utils");
const { PendingXHR } = require("pending-xhr-puppeteer");
const Galaxy = require("../models/Galaxies");

let scanGalaxy = async (galaxyNumber, bot) => {
  try {
    var page = await bot.createNewPage();
    const pendingXHR = new PendingXHR(page);
    // await timeout(10 * 1000);
    let solarSystemPlanets = [];
    for (let solarSystem = 0; solarSystem < 499; solarSystem++) {
      let planets = await bot.solarSystemScraping(
        `${galaxyNumber}:${solarSystem + 1}:1`,
        page,
        pendingXHR
      );
      console.log("escaneado: ", planets);
      solarSystemPlanets.push(planets);
    }
    console.log("se termino de scanear g", galaxyNumber);
    let galaxy = new Galaxy({
      number: galaxyNumber,
      solarSystem: JSON.parse(JSON.stringify(solarSystemPlanets))
    });
    await galaxy.save();
    await page.close();
  } catch (error) {
    console.log("se dio un error en scanGalaxy..probablemente el logeo");
    console.log("el error es: ", error);
    await bot.checkLoginStatus(page);
  }
};

module.exports = scanGalaxy;
