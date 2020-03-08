const axios = require("axios");

let sendTelegramMessage = message => {
  axios
    .post("https://pepebotogame.herokuapp.com/api/telegram/message", {
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
