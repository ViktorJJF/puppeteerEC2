const axios = require("axios");

let sendTelegramMessage = message => {
  axios
    .post(
      "http://ec2-52-90-106-105.compute-1.amazonaws.com:3000/api/telegram/message",
      { message }
    )
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
