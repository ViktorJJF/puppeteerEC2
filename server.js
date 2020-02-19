const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const hbs = require("hbs");
require("./hbs/helpers/helpers");
const ogameApi = require("./ogameApi.js");
const mongoose = require("mongoose");
const Bot = require("./classes/Bot");
const hunter = require("./Scripts/hunter.js");
const { timeout } = require("./utils/utils.js");
const Player = require("./models/Players");
const { PendingXHR } = require("pending-xhr-puppeteer");

const port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/public"));
//Express HBS engine
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Helpers

//DB
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

let bot = new Bot();
let playersToHunt = [];

(async () => {
  await bot.begin("prod");
  await bot.login("jimenezflorestacna@gmail.com", "sed4cfv52309@");
  // await bot.login("rodrigo.diazranilla@gmail.com", "phoneypeople");
  //first execution
  // let playersToHunt = [
  //   "Edipo",
  //   "Peacemaker",
  //   "The HadeS",
  //   "Coronavirus",
  //   "SekSek",
  //   "Makavrox",
  //   "Atrevete",
  //   "Man Yun Kin",
  //   "Miss Dark",
  //   "Nanatzu No Taisai",
  //   "Xendor",
  //   "Lyram",
  //   "Lord Tycho",
  //   "EN VENTA",
  //   "Renegade Ferret"
  // ];
  let playersFromDB = await Player.find();
  playersFromDB.forEach(player => {
    console.log("inicializando los jugadores");
    playersToHunt.push(player.nickname);
  });
  console.log("players to hunt es: ", playersToHunt);
  while (1 == 1) {
    for (const playerToHunt of playersToHunt) {
      await hunter(playerToHunt, bot);
    }
    await timeout(15 * 60 * 1000);
  }
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

app.get("/hunter", async (req, res) => {
  let playersToHunt = await Player.find();
  res.render("hunter", { playersToHunt });
});

app.get("/api/hunter", async (req, res) => {
  let playerInfo = await ogameApi.getPlayerInfo("Emperor Fidis");
  res.json({ ok: true, playerInfo });
});

app.post("/api/players", async (req, res) => {
  let body = req.body;
  let nickname = body.nickname;
  console.log("se agregara al jugador: ", nickname);
  let playerInfo = await ogameApi.getPlayerInfo(nickname);
  if (playerInfo) {
    let player = new Player({
      id: playerInfo.id,
      nickname: playerInfo.nickname,
      planets: playerInfo.planets,
      notes: ""
    });
    playerInfo = await player.save();
    console.log("agregando a lista de hunteados...");
    playersToHunt.push(playerInfo.nickname);
  } else {
    console.log("no se encontro su informacion y no se agrego...");
  }

  console.log("esta es su info: ", playerInfo);
  res.redirect("/hunter");
});

app.post("/api/players/planet", async (req, res) => {
  let body = req.body;
  let nickname = body.nickname;
  let newPlanet = {
    id: body.id,
    name: body.name,
    coords: body.coords,
    planetType: body.planetType,
    activities: []
  };
  let playerToUpdate = await Player.findOne({ nickname });
  playerToUpdate.planets.push(newPlanet);
  await playerToUpdate.save();
  res.redirect("/hunter");
});

app.post("/api/activities", (req, res) => {
  Player.find({ nickname: "Emperor Fidis" }).exec((err, playerInfo) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    let planets = playerInfo[0].planets;
    planets.forEach(planet => {
      console.log(planet);
    });
    res.json({
      ok: true
    });
  });
});

app.post("/api/players", async (req, res) => {
  let playerInfo = await ogameApi.getPlayerInfo("Emperor Fidis");
  console.log("la informacion del jugador es: ", playerInfo);
  body = req.body;
  let player = new Player({
    id: playerInfo.id,
    nickname: playerInfo.nickname,
    planets: playerInfo.planets,
    notes: ""
  });
  player.save((err, playerDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      playerDB
    });
  });
});

app.post("/api/hunter", (req, res) => {
  console.log("recibi estos datos: ", req.body.playerName);
  let playerToHunt = req.body.playerName;
  playersToHunt.push(playerToHunt);
  res.redirect("/hunter");
  console.log("ahora los jugadores son: ", playersToHunt);
});

app.get("/api/scan", async (req, res) => {
  let nickname = req.query.nickname.toLowerCase();
  let playerInfo = await Player.findOne({ nickname });
  if (!playerInfo) {
    playerInfo = await ogameApi.getPlayerInfo(nickname);
    // let player = new Player({
    //   id: playerApi.id,
    //   nickname: playerApi.nickname,
    //   planets: playerApi.planets,
    //   notes: ""
    // });
    // playerInfo = await player.save();
  }
  if (playerInfo) {
    var page = await bot.createNewPage();
    const pendingXHR = new PendingXHR(page);
    for (const planet of playerInfo.planets) {
      planet.activities = [];
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
          // await playerInfo.save();
        } else planet.activities.push(activity);
      }
    }
    await page.close();
    res.json({ ok: true, playerInfo });
  } else {
    res.json({ ok: true, playerInfo: {} });
  }
});

app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});
