const puppeteer = require("puppeteer");
const moment = require("moment");
const { timeout } = require("../utils/utils.js");
const uuidv1 = require("uuid/v1");
const { PendingXHR } = require("pending-xhr-puppeteer");
const config = require("../config");

module.exports = class Bot {
  constructor() {
    //check mongoose model
    this.BASE_URL = "https://pl.ogame.gameforge.com/";
    this.LOGIN_URL = "https://lobby.ogame.gameforge.com/es_ES/";
    this._id = null;
    this.server = null;
    this.language = null;
    this.telegramGroupId = null;
    this.telegramId = null;
    this.ogameEmail = "rodrigo.diazranilla@gmail.com";
    this.ogamePassword = "phoneypeople";
    this.state = null;
    this.userId = null;
    this.page = null;
    this.browser = null;
    this.navigationPromise = null;
    this.typingDelay = 50;
    this.currentPage = 0;
    this.actions = [];

    //currentPage
    // 0 -- > mainPage
    // 1 -- > Galaxy
    // this.HEADERS = [('User-agent', 'Mozilla/5.0 (Windows NT 6.2; WOW64)\
    //  AppleWebKit/537.15 (KHTML, like Gecko) Chrome/24.0.1295.0 Safari/537.15')]
  }
  async initialize(botOjbect) {
    this._id = botOjbect._id;
    this.server = botOjbect.server;
    this.language = botOjbect.language;
    this.telegramGroupId = botOjbect.telegramGroupId;
    this.telegramId = botOjbect.telegramId;
    this.ogameEmail = botOjbect.ogameEmail;
    this.ogamePassword = botOjbect.ogamePassword;
    this.state = botOjbect.state;
    this.userId = botOjbect.userId;
    this.proxy = botOjbect.proxy;
    this.page = null;
    this.browser = null;
    this.navigationPromise = null;
    this.typingDelay = 50;
    this.currentPage = 0;
    this.actions = [];
  }
  async begin(environment) {
    console.log("iniciando bot...");
    if (environment === "dev") {
      const pathToExtension =
        "C:\\Users\\JIMENEZ\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\ipmfkhoihjbbohnfecpmhekhippaplnh\\4.1.3_0";
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          `--disable-extensions-except=${pathToExtension}`,
          `--load-extension=${pathToExtension}`,
        ],
      });
    } else {
      this.browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(30000);
    this.navigationPromise = this.page.waitForNavigation();

    await this.page.goto(this.LOGIN_URL);

    console.log("se termino el inicio");
  }
  async login(ogameEmail, ogamePassword, page) {
    try {
      var page = page || this.page;
      console.log(`Empezando Logeo...`);
      //closing add
      await this.closeAds(page);

      await page.waitForSelector(
        "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
      );
      await page.click(
        "div > #loginRegisterTabs > .tabsList > li:nth-child(1) > span"
      );

      await page.waitForSelector('input[type="email"]');
      await page.click('input[type="email"]');
      await page.type(
        'input[type="email"]',
        ogameEmail ? ogameEmail : this.ogameEmail,
        {
          delay: this.typingDelay,
        }
      );

      await page.waitForSelector('input[type="password"]');
      await page.click('input[type="password"]');
      await page.type(
        'input[type="password"]',
        ogamePassword ? ogamePassword : this.ogamePassword,
        {
          delay: this.typingDelay,
        }
      );
      await page.waitForSelector(
        "#loginTab > #loginForm > p > .button-primary > span"
      );
      await page.click("#loginTab > #loginForm > p > .button-primary > span");
      await page.waitForSelector("div > #joinGame > a > .button > span", {
        timeout: 3000,
      });
      await page.click("div > #joinGame > a > .button > span");

      // await page.waitForSelector(".open > .rt-tr > .rt-td > .btn > span");
      // await page.click(".open > .rt-tr > .rt-td > .btn > span");

      await page.waitForSelector(".open > .rt-tr > .rt-td > .btn > span");
      let pageToClose = page;
      //main page ogame
      page = await this.clickAndWaitForTarget(
        ".open > .rt-tr > .rt-td > .btn > span",
        page,
        this.browser
      );
      await pageToClose.close();
      await page.close();
      // await this.closeAds();
      console.log("Logeo finalizado exitosamente");
      return true;
    } catch (error) {
      return false;
    }
  }

  async createNewPage() {
    let mainMenuUrl =
      "https://" +
      config.SERVER +
      "-" +
      config.LANGUAGE +
      ".ogame.gameforge.com/game/index.php?page=ingame&component=overview&relogin=1";
    let page = await this.browser.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(mainMenuUrl, {
      waitUntil: "networkidle0",
      timeout: 0,
    });
    return page;
  }

  async checkLoginStatus(page) {
    var page = page || this.page;
    var currentPage = null;
    currentPage = await page.evaluate(() => {
      var selector;
      selector = document.querySelector("div#toolbarcomponent");
      if (selector) {
        console.log("se cumplio mainPage");
        return "mainPage";
      }
      selector = document.querySelector("#joinGame>a>button.button");
      if (selector) {
        console.log("se cumplio playoage");
        return "playPage";
      }
      selector = document.querySelector(
        '.rt-td.action-cell>button[type="button"]'
      );
      if (selector) {
        console.log("se cumplio selecUniversePage");
        return "selectUniversePage";
      }
    });
    console.log("se verificara en que pagina estamos...");
    switch (currentPage) {
      case "mainPage":
        console.log("no paso nada.. seguimos normal");
        await page.close();
        break;
      case "playPage":
        try {
          console.log("nos encontramos en vista playPage");
          await page.waitForSelector("#joinGame>a>button.button");
          await page.click("#joinGame>a>button.button");
          await page.waitForSelector(
            '.rt-td.action-cell>button[type="button"]'
          );
          page = await this.clickAndWaitForTarget(
            '.rt-td.action-cell>button[type="button"]',
            page,
            this.browser
          );
          await page.close();
        } catch (error) {
          console.log("se dio un error en playpage");
          await this.checkLoginStatus(page);
        }
        break;
      case "selectUniversePage":
        console.log("nos encontramos en vista universo");
        console.log("empezaremos el clickAndwait");
        page = await this.clickAndWaitForTarget(
          '.rt-td.action-cell>button[type="button"]',
          page,
          this.browser
        );
        console.log("se termino el click and wait");
        //main page ogame
        await page.close();
        break;
      default:
        console.log("el caso default: a logearse");
        await this.login(null, null, page);
        console.log("cambiamos de pagina");
        break;
    }
    console.log("se retornara la pagina cerrada");
    // await page.close();
    return 0;
  }

  async watchDog(page) {
    console.log("empezando watchdog");
    var page = page || this.page;
    console.log("verificando ataques...");
    await this.refreshPage(page);
    await page.waitForSelector("#attack_alert");
    let notAttacked = await page.evaluate(() => {
      return document.querySelector("#attack_alert.noAttack");
    });
    if (notAttacked) {
      console.log("no estas siendo atacado");
      return false;
    } else {
      console.log("estas siendo atacado !!");
      return true;
    }
  }
  async attackDetail(page) {
    var page = page || this.page;
    let enemyMissions = [];
    // await timeout(5000);
    console.log("verificando los detalles del ataque...");

    //Click to overview enemy missions
    await page.waitForSelector(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed",
      {
        visible: true,
      }
    );
    await page.click(
      "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed"
    );
    await page.waitForSelector("table#eventContent");
    //checking details
    await timeout(1000);
    var self = this;
    let attackDetails = [];
    let enemyMissionsRows = await page.$$("tr.eventFleet");
    for (const enemyMission of enemyMissionsRows) {
      var isEnemy = await enemyMission.$("td.countDown>span.hostile");
      if (isEnemy) {
        let fleet = await enemyMission.$("td.icon_movement");
        await fleet.hover();
        var attackDetail = await enemyMission.evaluate((enemyMission) => {
          var attackDetail = {
            hostilePlayer: {
              name: "",
              origin: {
                planetName: "",
                coords: "",
                type: "",
              },
              target: {
                planetName: "",
                coords: "",
                type: "",
              },
              impactHour: "",
              timeRemaining: "",
            },
            ships: [],
          };
          attackDetail.hostilePlayer.origin.coords = enemyMission
            .querySelector("td.coordsOrigin")
            .innerText.replace(/[\[\]']+/g, "");
          let planetPosition = attackDetail.hostilePlayer.origin.coords.split(
            ":"
          )[2];
          attackDetail.hostilePlayer.origin.planetName = enemyMission.querySelector(
            "td.originFleet"
          ).innerText;
          attackDetail.hostilePlayer.origin.type = enemyMission.querySelector(
            "td.originFleet>figure.moon"
          )
            ? "moon"
            : "planet";

          attackDetail.hostilePlayer.target.coords = enemyMission
            .querySelector("td.destCoords")
            .innerText.replace(/[\[\]']+/g, "");
          attackDetail.hostilePlayer.target.planetName = enemyMission.querySelector(
            "td.destFleet"
          ).innerText;
          attackDetail.hostilePlayer.target.type = enemyMission.querySelector(
            "td.destFleet>figure.moon"
          )
            ? "moon"
            : "planet";
          //impacto hour
          attackDetail.hostilePlayer.impactHour = parseInt(
            enemyMission.getAttribute("data-arrival-time") * 1000
          );
          attackDetail.hostilePlayer.timeRemaining = parseInt(
            enemyMission.getAttribute("data-arrival-time") * 1000 - Date.now()
          );

          var shipsRows = document.querySelectorAll("table.fleetinfo>tbody>tr");
          //get ships
          shipsRows.forEach(async (ship, index) => {
            if (index > 0) {
              var shipJson = {
                name: "",
                qty: 0,
              };
              try {
                shipJson.name = ship.querySelector("td").innerText;
                shipJson.qty = ship.querySelector("td.value").innerText;
                attackDetail.ships.push(shipJson);
              } catch (exception) {
                console.log("hubo un error con el scraping del ataque");
                console.log(exception);
              }
            }
          });
          console.log("ships es: ", attackDetail.ships);
          return attackDetail;
        });
        //get hostil player name
        console.log("se termino la evaluacion, empieza hover");
        await page.click("#ingamepage");
        await timeout(500);
        let hostilPlayerSelector = await enemyMission.$("td.sendMail");
        await hostilPlayerSelector.hover();
        let hostilPlayerName = await enemyMission.evaluate(() => {
          return document.querySelector(".tpd-tooltip").innerText;
        });
        attackDetail.hostilePlayer.name = hostilPlayerName;
        attackDetails.push(attackDetail);
      }
    }
    console.log("te estan atacando con: ", JSON.stringify(attackDetails));
    return attackDetails;
  }

  async goToSolarSystem(coords, page) {
    console.log("Dirigiendo bot al sistema solar: ", coords);
    var page = page || this.page;
    let [galaxy, system, planet] = coords.split(":");
    var galaxyView = await page.$(
      "#menuTable>li:nth-child(10)>a.menubutton.selected"
    );
    if (!galaxyView) {
      await page.waitForSelector(
        "#toolbarcomponent > #links > #menuTable > li:nth-child(10) > .menubutton"
      );
      await page.click(
        "#toolbarcomponent > #links > #menuTable > li:nth-child(10) > .menubutton"
      );
    }
    let galaxyInputSelector = "#galaxy_input";
    await page.waitForSelector(galaxyInputSelector);
    let galaxyCurrentValue = await page.evaluate(
      () => document.querySelector("#galaxy_input").value
    );
    if (galaxyCurrentValue !== galaxy) {
      await page.click(galaxyInputSelector);
      await page.type(galaxyInputSelector, galaxy, {
        delay: this.typingDelay,
      });
    }
    let systemInputSelector = "#system_input";
    await page.waitForSelector(systemInputSelector);
    let systemCurrentValue = await page.evaluate(
      () => document.querySelector("#system_input").value
    );
    if (systemCurrentValue !== system) {
      await page.click(systemInputSelector);
      await page.type(systemInputSelector, system, {
        delay: this.typingDelay,
      });
    }
    if (galaxyCurrentValue !== galaxy || systemCurrentValue !== system) {
      //click !vamos!
      await page.waitForSelector(
        "#galaxycomponent > #inhalt > #galaxyHeader > form > .btn_blue:nth-child(9)"
      );
      // await timeout(1000);
      await page.click(
        "#galaxycomponent > #inhalt > #galaxyHeader > form > .btn_blue:nth-child(9)"
      );
    }
    await page.waitForSelector("tr.row");
  }

  async goToPage(pageName, page) {
    var page = page || this.page;
    //closing add
    switch (pageName) {
      case "galaxy":
        this.currentPage = "galaxy";
        console.log("yendo a vista galaxias");
        await page.waitForSelector(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(10) > .menubutton"
        );
        await page.click(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(10) > .menubutton"
        );
        // await navigationPromise
        break;
      case "fleet":
        console.log("yendo a vista flota");
        await page.waitForSelector(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9) > .menubutton"
        );
        await page.click(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9) > .menubutton"
        );
        break;
      case "fleetMovement":
        console.log("yendo a vista flota");
        await page.waitForSelector(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9)>span.menu_icon>a"
        );
        await page.click(
          "#toolbarcomponent > #links > #menuTable > li:nth-child(9)>span.menu_icon>a"
        );
        break;

      default:
        break;
    }
    // await this.closeAds();
  }

  async checkPlanetActivity(coords, planetType, player, page, pendingXHR) {
    var [galaxy, system, planet] = coords.split(":");
    await this.goToSolarSystem(coords, page);
    //esperando que todos los XHR finalicen
    if (!pendingXHR) {
      const pendingXHR = new PendingXHR(page);
    }
    await pendingXHR.waitForAllXhrFinished();
    planetType == "planet"
      ? console.log(player, "Empezando a escanear planeta: ", coords)
      : console.log(player, "Empezando a escanear luna: ", coords);
    // await timeout(500);
    let planetExist;
    if (planetType == "planet") {
      planetExist = await page.$(
        `tr.row>td[rel="planet${planet}"]>.ListImage>a>img.planetTooltip`
      );
    } else {
      planetExist = await page.$(`tr.row>td[rel="moon${planet}"]`);
    }
    if (!planetExist) {
      console.log("el planeta no existe");
      return {
        date: new Date(),
        lastActivity: null,
      };
    }
    // if (planetType == "planet")
    //   await page
    //     .waitForSelector(
    //       `tr.row>td[rel="planet${planet}"]>.ListImage>a>img.planetTooltip`
    //     )
    //     .catch(err => {
    //       console.log("el error en planetActivity:", err);
    //     });
    // else
    //   await page
    //     .waitForSelector(`tr.row>td[rel="moon${planet}"]`)
    //     .catch(err => {
    //       console.log("erroe en luna: ", err);
    //     });
    // await timeout(2500);
    var planetActivity = {
      date: new Date(),
      lastActivity: null,
    };

    planetActivity.lastActivity = await page.evaluate(
      ({ planet, planetType, coords }) => {
        console.log("estamos en coordenadas: ", coords);
        var lastActivity = "off";
        let planetSelector = document.querySelector(
          planetType == "planet"
            ? `tr.row>td[rel="planet${planet}"]>.ListImage`
            : `tr.row>td[rel="moon${planet}"]`
        );
        if (planetSelector.querySelector(".activity")) {
          if (planetSelector.querySelector(".activity.showMinutes")) {
            lastActivity = planetSelector.querySelector(".activity.showMinutes")
              .innerText;
          } else {
            lastActivity = "on";
          }
        }
        console.log("la actividad fue: ", lastActivity);
        return lastActivity;
      },
      {
        planet,
        planetType,
        coords,
      }
    );
    console.log(player, "Estado: ", planetActivity.lastActivity);
    return planetActivity;
  }

  async solarSystemScraping(coords, page, pendingXHR) {
    console.log("Empezando a escanear sistema solar: ", coords);
    var page = page || this.page;
    await this.goToSolarSystem(coords, page);
    await pendingXHR.waitForAllXhrFinished();
    console.log("empezando scraping");
    let planets = [];
    let planetsSelector = await page.$$("tr.row");
    let position = 1;
    for (const planet of planetsSelector) {
      let planetJson = {};
      planetJson.position = position;
      let planetExist = await planet.$(".ListImage");
      let planetExist2 = await planet.$(".ListImage");
      if (planetExist) {
        // await planetExist.hover();
        // // await timeout(1000);
        // let militaryInfo = await page.evaluate(() => {
        //   let points = document.querySelector(
        //     ".tpd-content-wrapper[style='visibility: visible;'] .uv-player-highscore>ul>li:nth-child(2)"
        //   );
        //   let shipsQty = document.querySelector(
        //     ".tpd-content-wrapper[style='visibility: visible;'] .uv-player-highscore>ul>li:nth-child(3)"
        //   );
        //   return {
        //     points: points ? points.innerText : 0,
        //     shipsQty: shipsQty ? shipsQty.innerText : 0
        //   };
        // });
        planetJson.name = await planet.evaluate((e) => {
          let planetNameSelector = e.querySelector("td.planetname");
          return planetNameSelector
            ? planetNameSelector.innerText
            : "Desconocido...";
        });
        planetJson.playerName = await planet.evaluate((e) =>
          e.querySelector("td.playername>a>span")
            ? e.querySelector("td.playername>a>span").innerText
            : null
        );
        planetJson.rank = await planet.evaluate((e) =>
          e.querySelector(".uv-galaxy-rank")
            ? e.querySelector(".uv-galaxy-rank").innerText
            : 0
        );
        planetJson.honor = (await planet.evaluate((e) =>
          e.querySelector(".status_abbr_honorableTarget")
        ))
          ? true
          : false;
        planetJson.state = await planet.evaluate((e) => {
          let bandit1 = e.querySelector(".honorRank.rank_bandit1");
          let bandit2 = e.querySelector(".honorRank.rank_bandit2");
          let bandit3 = e.querySelector(".honorRank.rank_bandit3");
          let bandit = bandit1 || bandit2 || bandit3;
          let inactive = e.querySelector(".status_abbr_inactive");
          let green = e.querySelector(".status_abbr_noob");
          let vacation = e.querySelector(".status_abbr_vacation");
          return vacation
            ? "vacation"
            : inactive
            ? "inactive"
            : green
            ? "green"
            : bandit
            ? "bandit"
            : "normal";
        });
        // planetJson.militaryInfo = militaryInfo;
        planetJson.moon = (await planet.evaluate((e) =>
          e.querySelector(".moon.js_no_action")
        ))
          ? false
          : true;
        let [galaxy, system] = coords.split(":");
        planetJson.coords = `${galaxy}:${system}:${position}`;
        planetJson.playerId = await planet.evaluate((e) => {
          let playerId = e.querySelector("td.action a.sendMail");
          return playerId ? playerId.getAttribute("data-playerid") : 0;
        });
        //me
        if (planetJson.playerName === "Cosaco") {
          planetJson.playerId = null;
        }
      }
      position++;
      planets.push(planetJson);
    }
    return planets;
  }

  async closeAds(page) {
    console.log("entrando a closeAds");
    var page = page || this.page;
    // try {
    //   await this.page.waitForResponse(
    //     response => {
    //       return (
    //         response.url() ===
    //           "https://ads-media.gameforge.com/53f75e5be1b5087082575d4181613f27.jpg" &&
    //         response.status() === 200
    //       );
    //     },
    //     { timeout: 5000 }
    //   );
    //   console.log("se termino de esperar la respuesta del ad");
    //   await timeout(500);
    // } catch (error) {
    //   console.log(error);
    // }
    await timeout(2700);
    let adState = await page.evaluate(() => {
      let ad = document.querySelector(".openX_int_closeButton > a");
      return ad;
    });
    console.log("se encontro este add: ", adState);
    if (adState) {
      console.log("cerrando add en goToPage");
      await this.page.waitForSelector(".openX_int_closeButton > a");
      await this.page.click(".openX_int_closeButton > a");
    }
    return 0;
  }

  async sendMessageToPlayer(nickname, msg) {
    try {
      await this.page.waitForSelector(
        "#headerbarcomponent > #bar > ul > li:nth-child(5) > .overlay"
      );
      await this.page.click(
        "#headerbarcomponent > #bar > ul > li:nth-child(5) > .overlay"
      );

      await this.page.waitForSelector("#searchText");
      await this.page.click("#searchText");

      await this.page.type("#searchText", nickname, {
        delay: this.typingDelay,
      });

      await this.page.waitForSelector(
        "tbody > tr > .ptb10 > #searchForm > .btn_blue"
      );
      await this.page.click("tbody > tr > .ptb10 > #searchForm > .btn_blue");
      await this.page.waitForSelector(
        "tbody > .alt > .action > .tooltip > .icon"
      );
      await this.page.click("tbody > .alt > .action > .tooltip > .icon");

      await this.navigationPromise;

      await this.page.waitForSelector(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea"
      );
      await this.page.click(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea"
      );

      await this.page.type(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .new_msg_textarea",
        msg,
        {
          delay: this.typingDelay / 2,
        }
      );

      await this.page.waitForSelector(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .btn_blue"
      );
      await this.page.click(
        "#contentWrapper > #chatContent > .content > .editor_wrap > .btn_blue"
      );

      console.log("mensaje enviado exitosamente al jugador: ", nickname);
    } catch (error) {
      console.log("algo salio mal enviando el mensaje...");
      console.log(error);
    }
  }

  async clickAndWaitForTarget(clickSelector, page, browser) {
    const pageTarget = page.target(); //save this to know that this was the opener
    await page.click(clickSelector); //click on a link
    const newTarget = await browser.waitForTarget(
      (target) => target.opener() === pageTarget
    ); //check that you opened this page, rather than just checking the url
    const newPage = await newTarget.page(); //get the page object
    // await newPage.once("load",()=>{}); //this doesn't work; wait till page is loaded
    await newPage.waitForSelector("body"); //wait for page to be loaded
    // newPage.on("console", consoleObj => console.log(consoleObj.text()));
    return newPage;
  }
  async refreshPage(page) {
    var page = page || this.page;
    console.log(
      "refrescando ogame a las : ",
      moment().format("MMMM Do YYYY, h:mm:ss a")
    );
    await page.waitForSelector(
      "#links > #menuTable > li:nth-child(1) > .menubutton > .textlabel"
    );
    await page.click(
      "#links > #menuTable > li:nth-child(1) > .menubutton > .textlabel"
    );
    // await this.navigationPromise;
  }

  async getFleets(page) {
    var page = page || this.page;
    let fleetDetails = {
      fleets: [],
      slots: {
        expTotal: null,
        expInUse: null,
        all: null,
        current: null,
      },
    };
    //go to fleet view
    await this.goToPage("fleet", page);
    // await timeout(5000);
    //Click to overview missions
    //check fleets
    let fleetOverviewButton = await page.$("p.event_list");
    if (fleetOverviewButton) {
      await page.waitForSelector(
        "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed",
        {
          visible: true,
        }
      );
      await page.click(
        "#notificationbarcomponent > #message-wrapper > #messages_collapsed #js_eventDetailsClosed"
      );
      await page.waitForSelector("table#eventContent");
    }

    //checking fleet details
    await timeout(1000);
    fleetDetails = await page.evaluate(() => {
      var fleets = [];
      var slots = {
        expTotal: null,
        expInUse: null,
        all: null,
        current: null,
      };
      var fleetEvents = document.querySelectorAll("tr.eventFleet");
      console.log("fleet events es de tamaño: ", fleetEvents.length);
      fleetEvents.forEach((fleetEvent) => {
        fleets.push({
          missionType: fleetEvent.getAttribute("data-mission-type"),
          return: fleetEvent.getAttribute("data-return-flight"),
          arrivalTime: fleetEvent.getAttribute("data-arrival-time"),
        });
      });

      slots.current = parseInt(
        document
          .querySelector("#slots>.fleft>span")
          .innerText.match(/([0-9])/)[0]
      );
      slots.all = parseInt(
        document
          .querySelector("#slots>.fleft>span")
          .innerText.match(/([^\/]+$)/)[0]
      );
      slots.expInUse = parseInt(
        document
          .querySelector("#slots>.fleft:nth-child(2)>span")
          .innerText.match(/([0-9])/)[0]
      );
      slots.expTotal = parseInt(
        document
          .querySelector("#slots>.fleft:nth-child(2)>span")
          .innerText.match(/([^\/]+$)/)[0]
      );
      return {
        fleets,
        slots,
      };
    });
    return fleetDetails;
  }

  async getOgameUsername(page) {
    var page = page || this.page;
    let username = "";
    await page.waitForSelector("li#playerName");
    username = await page.evaluate(() => {
      console.log("estoy en esta pagina");
      var username = document.querySelector("li#playerName>span>a").innerText;
      return username;
    });
    return username;
  }

  async hunter(playerInfo, page) {
    const pendingXHR = new PendingXHR(page);
    console.log("empezando hunter para...", playerInfo.nickname);
    for (const planet of playerInfo.planets) {
      let activity = await this.checkPlanetActivity(
        planet.coords,
        planet.planetType,
        playerInfo.nickname,
        page,
        pendingXHR
      );
      planet.activities.push(activity);
    }
    console.log("se termino de ejecutar hunter para..", playerInfo.nickname);
    console.log("info: ", JSON.stringify(playerInfo));
    return playerInfo;
  }
  async stop() {
    this.actions.forEach((action) => {
      clearInterval(action.action);
    });
    this.actions = [];
    await this.browser.close();
  }
  hasAction(actionType) {
    //expeditions - watchdog - hunter
    let actionIndex = this.actions.findIndex(
      (action) => action.type == actionType
    );
    return actionIndex > -1 ? true : false;
  }
  getActions() {
    let result = [];
    this.actions.forEach((action) => {
      result.push({
        actionId: action.actionId,
        type: action.type,
        payload: action.payload,
      });
    });
    return result;
  }
  addAction(type, payload = {}) {
    console.log("se recibio este action:", type);
    let actionId = uuidv1();
    this.actions.push({
      actionId,
      type,
      payload,
    });
    return actionId;
  }
  async stopAction(type) {
    try {
      let index = this.actions.findIndex((action) => action.type == type);
      this.actions.splice(this.actions[index], 1);
      console.log("ahora actions es: ", this.actions);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
};
