const Galaxy = require("../models/Galaxies");
const Player = require("../models/Players");
const mongoose = require("mongoose");

let updatePlayerInfo = async playerId => {
  let player = await Player.findOne({ id: playerId })
    .select("-planets.activities")
    .exec();
  console.log("actualizando informacion de : ", player.nickname);
  let planets = player.planets;
  //   console.log(JSON.stringify(player, null, "  "));
  let galaxies = await Galaxy.find({});
  galaxies.forEach(galaxy => {
    galaxy.solarSystem.forEach(solarSystem => {
      solarSystem.forEach(planet => {
        if (planet.playerId == playerId)
          checkPlanetExist(planet, planets, player);
      });
    });
  });
  await player.save();
};

let checkPlanetExist = async (planet, currentPlanets, player) => {
  let newPlanet = {
    id: "",
    name: "",
    coords: "",
    planetType: "planet",
    activities: []
  };
  let coords = planet.coords;
  console.log("estamos en ", coords, planet.moon);
  let hasPlanet = false;
  let hasMoon = false;
  currentPlanets.forEach(currentPlanet => {
    if (
      planet.coords == currentPlanet.coords &&
      currentPlanet.planetType == "planet"
    ) {
      hasPlanet = true;
    }
    if (
      planet.coords == currentPlanet.coords &&
      currentPlanet.planetType == "moon"
    ) {
      hasMoon = true;
    }
  });
  if (!hasPlanet) {
    console.log("se agregara planeta en:", coords);
    // console.log("se agregara este nuevo planeta: ", newPlanet);
    // console.log("se agregara esta nueva luna: ", newMoon);
    player.planets.push({
      id: "123123",
      name: planet.name,
      coords: planet.coords,
      planetType: "planet",
      activities: []
    });
  }
  if (!hasMoon && planet.moon) {
    console.log("se agregara luna en:", coords);
    player.planets.push({
      id: "123123",
      name: "luna",
      coords: planet.coords,
      planetType: "moon",
      activities: []
    });
  }
};

(async () => {
  mongoose.connect(
    "mongodb+srv://VictorJJF:Sed4cfv52309$@cluster0-ceisv.mongodb.net/pepebot",
    {
      useNewUrlParser: true
    },
    (err, res) => {
      if (err) throw err;
      console.log("DB online ONLINE");
    }
  );
  let playersToHunt = await Player.find({})
    .select("-planets.activities")
    .exec();
  for (const player of playersToHunt) {
    await updatePlayerInfo(player.id);
  }
  //   console.log(JSON.stringify(playersToHunt, null, "  "));
})();

module.exports = updatePlayerInfo;
