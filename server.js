const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const hbs = require("express-hbs");
require("./hbs/helpers/helpers");
const ogameApi = require("./ogameApi.js");
const mongoose = require("mongoose");
const Bot = require("./classes/Bot");
const hunter = require("./Scripts/hunter.js");
const autoWatchDog = require("./Scripts/autoWatchDog");
const scanGalaxy = require("./Scripts/scanGalaxy.js");
const {
  timeout
} = require("./utils/utils.js");
const Player = require("./models/Players");
const Galaxy = require("./models/Galaxies");
const BotModel = require("./models/Bots");
const {
  PendingXHR
} = require("pending-xhr-puppeteer");
const formatISO9075 = require("date-fns/formatISO9075");
const getMonth = require("date-fns/getMonth");
const getDate = require("date-fns/getDate");
const getHours = require("date-fns/getHours");
const {
  format,
  utcToZonedTime
} = require("date-fns-tz");
const _ = require("underscore");
const config = require("./config");

const port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/public"));
//Express HBS engine
app.engine(
  "hbs",
  hbs.express4({
    partialsDir: __dirname + "/views/partials"
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());

//Helpers
//DB
mongoose.connect(
  "mongodb+srv://VictorJJF:Sed4cfv52309$@cluster0-ceisv.mongodb.net/pepebot", {
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
  //init
  if (config.environment === "dev") return;
  await bot.begin("prod");
  // await bot.login("jimenezflorestacna@gmail.com", "sed4cfv52309@");
  await bot.login("rodrigo.diazranilla@gmail.com", "phoneypeople");
  // await bot.login("vj.jimenez96@gmail.com", "sed4cfv52309@");
  // await bot.login("cs.nma18@gmail.com", "sofia2710");
  if (config.environment === "dev") return;
  let playersFromDB = await Player.find({
    server: config.SERVER
  }, [
    "nickname",
    "hunt"
  ]);
  // console.log("players from db es:", playersFromDB);
  //change
  playersFromDB.forEach(player => {
    if (player.hunt) {
      playersToHunt.push(player.nickname);
    }
  });
  playersFromDB = null;
  while (1 == 1) {
    for (const playerToHunt of playersToHunt) {
      await hunter(playerToHunt, bot);
    }
    await timeout(3 * 60 * 1000);
  }
})();

app.get("/", (req, res) => {
  res.render("home", {
    nombre: "PepeHunter",
    universe: config.UNIVERSE,
    lang: config.LANGUAGE,
    server: config.SERVER,
    anio: new Date().getFullYear(),
    path: "/"
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/acciones", async (req, res) => {
  let bots = await BotModel.find({}).lean();
  res.render("actions", {
    path: "/acciones",
    bots: bots
  });
});

app.get("/hunter", async (req, res) => {
  let {
    page,
    perPage
  } = req.query;
  page = page || 1;
  perPage = perPage || 5;
  let options = {
    skip: (parseInt(page) - 1) * parseInt(perPage) || 0,
    limit: parseInt(perPage) || 5
  };
  let playersToHunt = await Player.find({
        server: config.SERVER
      },
      null,
      options
    )
    .select("-planets")
    .exec();
  let totalPlayersToHunt = await Player.count({
    server: config.SERVER
  });
  let allPlayersToHunt = await Player.find({
      server: config.SERVER
    })
    .select("-planets")
    .exec();
  let totalPages = Math.ceil(totalPlayersToHunt / perPage);
  res.render("hunter", {
    playersToHunt,
    totalPlayersToHunt,
    page,
    perPage,
    totalPages,
    allPlayersToHunt,
    path: "/hunter"
  });
});

app.get("/hunter/:id", async (req, res) => {
  let playerId = req.params.id;
  console.log("el id es: ", playerId);
  // let playersToHunt = await Player.find()
  //   .select("-planets")
  //   .exec();
  // console.log("players: ", playersToHunt);
  res.render("partials/modalHunter");
});

app.get("/universo", async (req, res) => {
  let galaxyNumber = req.query.galaxia || "1";
  let showRanking = req.query.ranking;
  let galaxy = await Galaxy.findOne({
    server: config.SERVER,
    number: galaxyNumber
  });
  if (!galaxy)
    return res.render("universe", {
      noData: true,
      path: "/universo"
    });
  let date = formatISO9075(galaxy.createdAt);
  // console.log("el sistema solar: ", galaxy);
  let planetsIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  let galaxiesIndex = [1, 2, 3, 4, 5, 6];
  res.render("universe", {
    galaxy: galaxy.solarSystem,
    planetsIndex,
    galaxiesIndex,
    showRanking,
    galaxyNumber,
    date,
    path: "/universo"
  });
});

app.get("/acciones", async (req, res) => {
  let bots = await BotModel.find({
    server: config.SERVER
  });
  res.render("actions", {
    bots
  });
});

app.post("/universo", async (req, res) => {
  let galaxy = req.body.galaxy;
  let showRanking = req.body.showRanking == "on" ? true : false;
  console.log("showranking es: ", showRanking);
  res.redirect(`/universo?galaxia=${galaxy}&&ranking=${showRanking}`);
});

app.get("/tablas", async (req, res) => {
  let players = await Player.find({
      server: config.SERVER
    })

    .select("nickname -_id")
    .exec();
  console.log("los jugadores son: ", players);
  if (players.length === 0)
    return res.render("graphics", {
      noData: true,
      path: "/tablas"
    });
  let nickname = req.query.nickname || players[0].nickname;
  let showDetails = req.query.detailed ? req.query.detailed == "true" : false;
  let playerToHunt = await Player.findOne({
    server: config.SERVER,
    nickname: nickname.toLowerCase()
  });
  // console.log("su info es: ", playerToHunt);
  let planets = playerToHunt.planets;
  var x = 60; //minutes interval
  var times = []; // time array
  var tt = 0; // start time
  var ap = ["AM", "PM"]; // AM-PM

  //loop to increment the time and push results in array
  for (var i = 0; tt < 24 * 60; i++) {
    var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
    var mm = tt % 60; // getting minutes of the hour in 0-55 format
    times[i] =
      ("0" + (hh % 12)).slice(-2) +
      ":" +
      ("0" + mm).slice(-2) +
      ap[Math.floor(hh / 12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
    tt = tt + x;
  }

  let dates = [];
  for (const planet of planets) {
    // planetActivities.forEach(date => {
    //   console.log(getDate(date.date));
    // });
    let group = _.groupBy(planet.activities, date => {
      const parisTimeZone = "America/Lima";
      let localeDate = utcToZonedTime(date.date, parisTimeZone);
      return getDate(localeDate);
    });
    // planet.activities = planet.activities.reverse();
    dates.push(group);
  }
  for (const date of dates) {
    for (const day in date) {
      if (date.hasOwnProperty(day)) {
        // date[day] = [];
        let intervals = [];
        let hours = _.groupBy(date[day], hour => {
          return getHours(hour.date);
        });
        times.forEach((hourInterval, idx) => {
          if (!hours[String(idx)]) hours[String(idx)] = [];
        });
        date[day] = hours;
      }
    }
  }
  // console.log(JSON.stringify(dates));

  // dates.forEach(date => {
  // console.log(dates[0]["21"]);
  // // });
  // dates[0]["20"]["13"].forEach(date => {
  //   console.log(formatISO9075(date.date));
  // });
  for (let i = 0; i < planets.length; i++) {
    planets[i].dates = dates[i];
  }
  // planets.forEach((planet, i) => {
  //   console.log("planeta :", i, planet.dates);
  // });
  let totalDays = Object.keys(dates[0] || {}).length;
  res.render("graphics", {
    players,
    playerToHunt,
    planets,
    times,
    dates,
    totalDays,
    showDetails,
    path: "/tablas"
  });
});

app.post("/tablas", (req, res) => {
  let nickname = req.body.nickname;
  let showDetails = req.body.showDetails == "on" ? "true" : false;
  res.redirect(`/tablas?nickname=${nickname}&&detailed=${showDetails}`);
});

app.get("/api/hunter", async (req, res) => {
  let playerInfo = await ogameApi.getPlayerInfo("Emperor Fidis");
  res.json({
    ok: true,
    playerInfo
  });
});
// app.get("/api/graphics", async (req, res) => {
//   let nickname=req.query.nickname;
//   let detailed=req.query.detailed;
//   res.json({ ok: true, playerInfo });
// });

app.get("/test", (req, res) => {
  res.render("test");
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
      notes: "",
      hunt: true,
      server: config.SERVER
    });
    console.log("agregando a este jugador: ", player);
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
    id: "123123",
    name: body.name,
    coords: body.coords,
    planetType: body.planetType,
    activities: []
  };
  let playerToUpdate = await Player.findOne({
      server: config.SERVER,
      nickname
    })
    .select("-planets.activities")
    .exec();
  playerToUpdate.planets.push(newPlanet);
  await playerToUpdate.save();
  res.redirect("/hunter");
});

app.post("/api/activities", (req, res) => {
  Player.find({
    nickname: "Emperor Fidis"
  }).exec((err, playerInfo) => {
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

app.get("/api/players/:id", async (req, res) => {
  try {
    let playerId = req.params.id;
    console.log("recibi este id: ", playerId);
    let playerInfo;
    if (playerId) {
      playerInfo = await Player.findOne({
          server: config.SERVER,
          id: playerId
        })
        .select("-planets.activities")
        .exec();
    } else playerInfo = [];
    res.json({
      ok: true,
      playerInfo
    });
  } catch (error) {
    res.json({
      ok: false,
      msg: "algo salio mal..."
    });
    console.log(error);
  }
});

app.get("/api/players", async (req, res) => {
  try {
    let nickname = req.query.nickname;
    let playersToHunt;
    if (nickname) {
      nickname = nickname.toLowerCase();
      playersToHunt = await Player.find({
        server: config.SERVER,
        nickname
      });
    } else playersToHunt = await Player.find({
      server: config.SERVER
    });
    res.json({
      ok: true,
      playersToHunt
    });
  } catch (error) {
    res.json({
      ok: false,
      msg: "algo salio mal..."
    });
  }
});

app.post("/api/hunter", (req, res) => {
  console.log("recibi estos datos: ", req.body.playerName);
  let playerToHunt = req.body.playerName;
  playersToHunt.push(playerToHunt);
  res.redirect("/hunter");
  console.log("ahora los jugadores son: ", playersToHunt);
});

app.get("/api/hunteados", (req, res) => {
  res.json({
    server: config.SERVER,
    playersToHunt
  });
});

app.get("/api/scan", async (req, res) => {
  let nickname = req.query.nickname.toLowerCase();
  let playerInfo = await Player.findOne({
      server: config.SERVER,
      nickname
    })
    .select("-planets.activities")
    .exec();
  if (!playerInfo) {
    playerInfo = await ogameApi.getPlayerInfo(nickname);
  }
  if (playerInfo) {
    try {
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
          planet.activities.push(activity);
        }
      }
      await page.close();
      res.json({
        ok: true,
        playerInfo
      });
    } catch (error) {
      console.log("se dio un error en scan..probablemente el logeo");
      console.log("el error es: ", error);
      await bot.checkLoginStatus(page);
    }
  } else {
    res.json({
      ok: true,
      playerInfo: {}
    });
  }
});

app.get("/api/scan/universe", async (req, res) => {
  res.json({
    ok: true,
    msg: "Empezando a escanear universo"
  });
  //eliminando scan anterior
  let galaxies = await Galaxy.deleteMany({
    server: config.SERVER
  });
  for (let i = 1; i <= 6; i++) {
    scanGalaxy(String(i), bot);
    // await timeout(5 * 1000);
  }
  console.log("se termino de escanear el universo");
  return;
});

app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});