// more information at https://gist.github.com/psmolak/409d038fb4a9157aecf25c84110d5b55
// https://board.origin.ogame.gameforge.com/index.php/Thread/3927-OGame-API/

const axios = require("axios");
var parseString = require("xml2js").parseString;
const config = require("./config");

//get players list
let endPoint =
  "https://" +
  config.SERVER +
  "-" +
  config.LANGUAGE +
  ".ogame.gameforge.com/api/players.xml";
console.log("empezando web scraping en universo: ", endPoint);
let player = null;

const getPlayerId = nickName => {
  return new Promise((resolve, reject) => {
    let playerId = null;
    axios
      .get(endPoint)
      .then(res => {
        // console.log(res.data);
        parseString(res.data, function(err, result) {
          let players = result.players.player;
          players.forEach(player => {
            if (player["$"].name.toLowerCase() == nickName) {
              resolve(player["$"].id);
            }
          });
          if (!playerId) {
            reject(null);
          }
        });
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
};

const getPlanetsCoordinates = playerId => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://" +
          config.SERVER +
          "-" +
          config.LANGUAGE +
          ".ogame.gameforge.com/api/playerData.xml?id=" +
          playerId
      )
      .then(res => {
        // console.log(res.data);
        parseString(res.data, function(err, result) {
          let planets = result.playerData.planets[0].planet;
          let coords = [];
          planets.forEach(planet => {
            coords.push({
              id: planet["$"].id,
              name: planet["$"].name,
              coords: planet["$"].coords,
              planetType: "planet",
              active: true,
              activities: []
            });
            if (planet.hasOwnProperty("moon")) {
              coords.push({
                name: planet.moon[0]["$"].name,
                coords: planet["$"].coords,
                planetType: "moon",
                active: true,
                activities: []
              });
            }
          });
          resolve(coords);
        });
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
};

const getPlayerInfo = async nickname => {
  console.log("obteniendo información del jugador: ", nickname);
  var nickname = nickname.toLowerCase();
  let playerInfo = { id: 0, nickname: nickname, planets: [] };
  try {
    player = await getPlayerId(nickname);
    playerInfo.id = player;
    planetsCoordinates = await getPlanetsCoordinates(player);
    playerInfo.planets = JSON.parse(JSON.stringify(planetsCoordinates));
    console.log("Información del jugador: ", playerInfo);
    return playerInfo;
  } catch (error) {
    console.log("no se encontro informacion del jugador: ", nickname);
    return null;
  }
};

module.exports = {
  getPlayerInfo,
  getPlayerId
};
