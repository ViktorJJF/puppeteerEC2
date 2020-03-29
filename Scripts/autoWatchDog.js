const axios = require("axios");
const telegramService = require("../telegramService");
const config = require("../config");
const Bot = require("../models/Bots");
const getHours = require("date-fns/getHours");

let autoWatchDog = async playerId => {
  console.log("empezando autoWatchdog...");
  let playersToProtect = ["101049", "101182"];
  let isProtected =
    playersToProtect.findIndex(
      playerToProtect => playerToProtect === playerId
    ) > -1
      ? true
      : false;
  if (!isProtected) return;

  let ogameEmail;
  if (playerId === "101049") ogameEmail = "juancarlosjf@outlook.com";
  if (playerId === "101182") ogameEmail = "cs.nma18@gmail.com";
  let playerInfo, botId;
  console.log("email a buscar: ", ogameEmail);
  botId = (
    await Bot.findOne({ server: config.SERVER, ogameEmail }, "_id ogameEmail")
  )._id;
  // if (!checkAllowedTime()) return;
  axios
    .post(config.PEPEBOTDOMAIN + "/api/bots/" + botId + "/actions", {
      action: "watchDog",
      payload: { milliseconds: 5 * 1000 }
    })
    .then(async res => {
      await telegramService(
        "<b>" +
          ogameEmail +
          "</b> el <b>watchDog</b> fue activado porque estuviste off en mi ultimo escaneo"
      );
      console.log("watchDog activado con exito!");
      //   console.log(res.data);
    })
    .catch(err => {
      console.log("un error enviando el mensaje de telegram...");
      console.error(err);
    });
};

let checkAllowedTime = () => {
  let hour = new Date().getHours();
  if (0 <= hour && hour <= 5) return false;
  return true;
};

module.exports = autoWatchDog;
