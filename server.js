const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const hbs = require("hbs");
require("./hbs/helpers/helpers");
const ogameApi = require("./ogameApi.js");
const mongoose = require("mongoose");
const Bot = require("./classes/Bot");

const port = process.env.PORT || 3000;

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

const Player = require("./models/Players");
(async () => {
  let bot = new Bot();
  await bot.begin("production");
  await bot.login("rodrigo.diazranilla@gmail.com", "phoneypeople");
  let playersToHunt = ["Geologist Rigel", "SekSek", "Tony Stark", "Peacemaker"];
  //first execution
  playersToHunt.forEach(playerToHunt => {
    hunter(playerToHunt, bot);
  });
  setInterval(() => {
    playersToHunt.forEach(playerToHunt => {
      hunter(playerToHunt, bot);
    });
  }, 20 * 60 * 1000);
})();

let hunter = (nickname, bot) => {
  Player.findOne({ nickname }, async (err, playerInfo) => {
    console.log("buscando información de jugadores...");
    try {
      var page = await bot.createNewPage();
      if (!playerInfo) {
        try {
          let playerInfo = await ogameApi.getPlayerInfo(nickname);
          console.log("la informacion del jugador es: ", playerInfo);
          let player = new Player({
            id: playerInfo.id,
            nickname: playerInfo.nickname,
            planets: playerInfo.planets,
            notes: ""
          });
          await player.save();
        } catch (error) {
          console.log("err" + err);
        }
      }
      let newPlayerInfo = await bot.hunter(playerInfo, page);
      console.log("la nueva informacion del jugador es: ", newPlayerInfo);
      Player.findOneAndUpdate(
        { nickname },
        newPlayerInfo,
        { new: true },
        (err, payload) => {
          if (err) {
            return new Error("Algo salio mal ...");
          }
          console.log("actualizado...", payload);
        }
      );
      await page.close();
    } catch (error) {
      console.log("se dio un error en watchdog..probablemente el logeo");
      console.log("el error es: ", error);
      await bot.checkLoginStatus(page);
      page = await bot.createNewPage();
    }
  });
};

app.get("/", (req, res) => {
  res.render("home", {
    nombre: "Victor Juan Jimenez Flores!",
    anio: new Date().getFullYear()
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

let playersToHunt = [];

app.get("/hunter", (req, res) => {
  console.log("brus");
  res.render("hunter", { playersToHunt });
});

app.get("/api/hunter", async (req, res) => {
  let playerInfo = await ogameApi.getPlayerInfo("Emperor Fidis");
  res.json({ ok: true, playerInfo });
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
  res.redirect("/hunter");
  let playerToHunt = req.body.playerName;
  playersToHunt.push(playerToHunt);
  console.log("ahora los jugadores son: ", playersToHunt);
});

app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});
