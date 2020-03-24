const axios = require("axios");
const config = require("./config");

let sendTelegramMessage = message => {
  axios
    .post(config.PEPEBOTDOMAIN + "/api/telegram/message", {
      message
    })
    .then(res => {
      console.log("mensaje de telegram enviado con éxito!");
      //   console.log(res.data);
    })
    .catch(err => {
      console.log("un error enviando el mensaje de telegram...");
      console.error(err);
    });
};

module.exports = sendTelegramMessage;
