const { Random, timeout, msToTime } = require("../utils/utils");
const Player = require("../models/Players");
const ogameApi = require("../ogameApi");
const { PendingXHR } = require("pending-xhr-puppeteer");
const sendTelegramMessage = require("../telegramService.js");

async function beginHunter(nickname, bot) {
  console.log("se aplicara hunter a este jugador: ", nickname);
  console.log("empezando nueva vuelta");
  var nickname = nickname.toLowerCase();
  try {
    let playerInfo = await Player.findOne({ nickname });
    if (!playerInfo) {
      let playerApi = await ogameApi.getPlayerInfo(nickname);
      let player = new Player({
        id: playerApi.id,
        nickname: playerApi.nickname,
        planets: playerApi.planets,
        isOn: true,
        notes: ""
      });
      playerInfo = await player.save();
    }

    var page = await bot.createNewPage();
    // let newPlayerInfo = await bot.hunter(playerInfo, page);
    //hunter
    const pendingXHR = new PendingXHR(page);
    console.log("empezando hunter para...", playerInfo.nickname);
    let isOn = false,
      isAllOff = true;
    for (const planet of playerInfo.planets) {
      // if (planet.active) {
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
      if (activity.lastActivity === "on") isOn = true;
      if (activity.lastActivity !== "off") isAllOff = false;
      // }
    }
    if (!isOn && playerInfo.isOn == true) {
      console.log(playerInfo.nickname, " esta of!");
      if (isAllOff)
        sendTelegramMessage(
          `<b>${playerInfo.nickname}</b> está <b>totalmente</b>💤💤💤`
        );
      else sendTelegramMessage(`<b>${playerInfo.nickname}</b> está 💤💤💤`);
      playerInfo.isOn = false;
    }
    if (isOn && playerInfo.isOn == false) {
      playerInfo.isOn = true;
    }
    // await playerInfo.save();
    playerInfo = null;
    //end hunter
    // await page.close();
    console.log("se termino de esperar los 5 seg");
  } catch (error) {
    console.log("se dio un error en hunter..probablemente el logeo");
    console.log("el error es: ", error);
    await bot.checkLoginStatus(page);
  }
}

module.exports = beginHunter;
