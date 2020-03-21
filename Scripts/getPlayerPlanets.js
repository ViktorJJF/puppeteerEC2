const { timeout } = require("../utils/utils");
const { PendingXHR } = require("pending-xhr-puppeteer");
const ogameApi = require("../ogameApi");
const Bot = require("../classes/Bot");

let globalPlanets = [];
let start = async (nickname, bot) => {
  let playerId = await ogameApi.getPlayerId(nickname);
  console.log("la informacion del jugador es:", playerId);
  let promises = [];
  for (let i = 1; i <= 6; i++) {
    promises.push(scanGalaxy(i, 1, 249, playerId, bot));
    promises.push(scanGalaxy(i, 250, 499, playerId, bot));
  }

  await Promise.all(promises);
  // for (let i = 1; i <= 6; i++) {

  // }
  console.log("Los planetas son:", globalPlanets);
};

let scanGalaxy = async (galaxyNumber, from, to, playerId, bot) => {
  try {
    var page = await bot.createNewPage();
    const pendingXHR = new PendingXHR(page);
    // await timeout(10 * 1000);
    for (let solarSystem = from; solarSystem <= to; solarSystem++) {
      let planets = await bot.solarSystemScraping(
        `${String(galaxyNumber)}:${solarSystem}:1`,
        page,
        pendingXHR
      );
      planets.forEach(planet => {
        if (planet.playerId === playerId) {
          globalPlanets.push({
            playerName: planet.playerName,
            coords: planet.coords,
            moon: planet.moon
          });
          console.log("Se encontro este planeta:", planet);
        }
      });
    }
    await page.close();
  } catch (error) {
    console.log("se dio un error en scanGalaxy..probablemente el logeo");
    console.log("el error es: ", error);
    await bot.checkLoginStatus(page);
  }
};

(async () => {
  let bot = new Bot();
  await bot.begin("prod");
  await bot.login("rodrigo.diazranilla@gmail.com", "phoneypeople");
  start("sacz", bot);
})();

module.exports = start;
