const { timeout } = require("../utils/utils");
const { PendingXHR } = require("pending-xhr-puppeteer");
const Bot = require("../classes/Bot");
const Galaxy = require("../models/Galaxies");
const Player = require("../models/Players");
const config = require("../config");

let totalPlayers = [];

let getTopPlayers = async (bot) => {
  let page = await bot.createNewPage();
  await page.goto(
    "https://s168-es.ogame.gameforge.com/game/index.php?page=highscore"
  );
  for (let i = 1; i <= 8; i++) {
    totalPlayers = [...totalPlayers, ...(await scanTotalPointsPage(i, page))];
  }
  await page.close();
  return totalPlayers;
};

let scanTotalPointsPage = async (pageNumber, page) => {
  pageNumber = String(pageNumber);
  console.log("estamos en la pagina: ", pageNumber);
  if (pageNumber !== "1") {
    await page.waitForSelector(".pagebar>a");
    await page.click(".pagebar>a:nth-child(" + pageNumber + ")");
    await page.waitForSelector("table#ranks>tbody>tr");
  }
  let players = [];
  players = await page.evaluate(() => {
    let playersNode = Array.from(
      document.querySelectorAll("table#ranks>tbody>tr")
    );
    return playersNode.map((playerNode) => {
      return {
        playerId: playerNode.querySelector(".sendmsg_content>a")
          ? playerNode
              .querySelector(".sendmsg_content>a")
              .getAttribute("data-playerid")
          : "0",
        playername: playerNode.querySelector("span.playername").innerText,
        position: playerNode.querySelector(".position").innerText,
      };
    });
  });
  return players;
};

let updateGalaxiesTop = async () => {
  let galaxies = await Galaxy.find({
    server: config.SERVER,
  });
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = 0; j < galaxies[i].solarSystem.length; j++) {
      for (let k = 0; k < galaxies[i].solarSystem[j].length; k++) {
        let playerRank = findPlayerById(galaxies[i].solarSystem[j][k].playerId);
        if (playerRank) galaxies[i].solarSystem[j][k].rank = playerRank;
      }
    }
    console.log("se empezara a guardar la galaxia: ", i);
    galaxies[i].markModified("solarSystem");
    await galaxies[i].save();
    console.log("galaxia ", i, " guardada con exito");
  }
};

let findPlayerById = (playerId) => {
  if (!playerId) return;
  let playerIndex = totalPlayers.findIndex(
    (player) => player.playerId == playerId
  );
  if (playerIndex > -1) {
    return totalPlayers[playerIndex].position;
  }
  return;
};

(async () => {
  let bot = new Bot();
  await bot.begin("dev");
  await bot.login("cs.nma18@gmail.com", "sofia2710");
  await getTopPlayers(bot);
  await updateGalaxiesTop();
})();
