const { Random, timeout, msToTime } = require("../utils/utils");
const Player = require("../models/Players");
const ogameApi = require("../ogameApi");
const { PendingXHR } = require("pending-xhr-puppeteer");

async function beginHunter(nickname, bot) {
  console.log("se aplicara hunter a este jugador: ", nickname);
  while (1 == 1) {
    console.log("empezando nueva vuelta");
    try {
      let playerInfo = await Player.findOne({ nickname });
      console.log("la informacion del jugador es: ", playerInfo);
      if (!playerInfo) {
        let playerApi = await ogameApi.getPlayerInfo(nickname);
        let player = new Player({
          id: playerApi.id,
          nickname: playerApi.nickname,
          planets: playerApi.planets,
          notes: ""
        });
        playerInfo = await player.save();
      }

      var page = await bot.createNewPage();
      // let newPlayerInfo = await bot.hunter(playerInfo, page);
      //hunter
      const pendingXHR = new PendingXHR(page);
      console.log("empezando hunter para...", playerInfo.nickname);
      for (const planet of playerInfo.planets) {
        if (planet.active) {
          let activity = await bot.checkPlanetActivity(
            planet.coords,
            planet.planetType,
            playerInfo.nickname,
            page,
            pendingXHR
          );
          if (!activity) {
            planet.active = false;
            await playerInfo.save();
          } else planet.activities.push(activity);
        }
      }
      await playerInfo.save();
      //end hunter
      await page.close();
      console.log("esperando 5 segundos para proximo hunter");
      console.log("se empezara nufevo bucle");
      console.log("esperando 5 segundos");
      await timeout(5 * 1000);
      console.log("se termino de esperar los 5 seg");
    } catch (error) {
      console.log("se dio un error en hunter..probablemente el logeo");
      console.log("el error es: ", error);
      await bot.checkLoginStatus(page);
      page = await bot.createNewPage();
    }
  }
}

module.exports = beginHunter;
