function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let msToTime = duration => {
  console.log("llego esta duracion: ", duration);
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return (
    (hours != 1 ? hours + " horas " : hours + " hora ") +
    minutes +
    " minutos " +
    seconds +
    " segundos"
  );
};

function Random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  timeout,
  msToTime,
  Random
};
