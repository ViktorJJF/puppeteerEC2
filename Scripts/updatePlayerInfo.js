const Galaxy = require("../models/Galaxies");
const Player = require("../models/Players");
const mongoose = require("mongoose");

let galaxies = [];

let updatePlayerInfo = async playerId => {
  // let player = await Player.findOne({ id: playerId })
  //   .select("-planets.activities")
  //   .exec();
  let player = await Player.findOne({ id: playerId });
  console.log("actualizando info de: ", player.nickname);
  let planets = player.planets;
  let scanPlanets = [];
  galaxies.forEach(galaxy => {
    galaxy.solarSystem.forEach(solarSystem => {
      solarSystem.forEach(planet => {
        if (planet.playerId == playerId) {
          checkPlanetExist(planet, planets, player);
          scanPlanets.push(planet);
        }
      });
    });
  });
  player.planets = deletePlanets(planets, scanPlanets, "coords");
  player.markModified("planets");
  await player.save();
  console.log("guardado con éxito");
};

let checkPlanetExist = (planet, currentPlanets, player) => {
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

let deletePlanets = (currentPlanets, scanPlanets, propertyToCompare) => {
  for (let i = 0; i < currentPlanets.length; i++) {
    let hasElement = false;
    for (let j = 0; j < scanPlanets.length; j++) {
      if (
        currentPlanets[i][propertyToCompare] ===
        scanPlanets[j][propertyToCompare]
      ) {
        hasElement = true;
        j = 999999;
      }
    }
    if (!hasElement) {
      console.log(
        "procediendo a eliminar: ",
        currentPlanets[i].coords,
        currentPlanets[i].name
      );
      currentPlanets.splice(i, 1);
      i = -1;
    }
  }
  return currentPlanets;
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
  galaxies = await Galaxy.find({});
  let playersToHunt = await Player.find()
    .select("-planets.activities")
    .exec();
  for (const player of playersToHunt) {
    await updatePlayerInfo(player.id);
  }
  //   console.log(JSON.stringify(playersToHunt, null, "  "));
})();

module.exports = updatePlayerInfo;
