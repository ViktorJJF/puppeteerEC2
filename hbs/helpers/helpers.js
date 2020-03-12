const hbs = require("express-hbs");
const formatISO9075 = require("date-fns/formatISO9075");
const { format, utcToZonedTime } = require("date-fns-tz");
const getMonth = require("date-fns/getMonth");

hbs.registerHelper("getAnio", () => {
  return new Date().getFullYear();
});
hbs.registerHelper("capitalizar", texto => {
  let palabras = texto.split(" ");
  palabras.forEach((palabra, idx) => {
    palabras[idx] =
      palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
  });
  return palabras.join(" ");
});
hbs.registerHelper("capitalizar", texto => {
  let palabras = texto.split(" ");
  palabras.forEach((palabra, idx) => {
    palabras[idx] =
      palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
  });
  return palabras.join(" ");
});

hbs.registerHelper("getHours", (dates, day) => {
  // console.log("el dia: ", day);
  // console.log("se retornara: ", dates[day]);
  return dates[day];
});

hbs.registerHelper("formatIso", date => {
  const parisTimeZone = "America/Lima";
  var date = utcToZonedTime(date, parisTimeZone);
  return format(date, "HH:mm:ss", {
    timeZone: parisTimeZone
  });
});

hbs.registerHelper("if_eq", function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper("getDateByDay", day => {
  let currentMonth = getMonth(new Date());
  let date = new Date(2020, currentMonth, parseInt(day));
  return formatISO9075(date, { representation: "date" });
});

hbs.registerHelper("index", i => {
  return i + 1;
});

hbs.registerHelper("complement", (totalDays, i) => {
  console.log("se enviara: ", totalDays, i, totalDays - i);
  return totalDays - i;
});

hbs.registerHelper("planetExist", planet => {
  return planet.hasOwnProperty("playerName");
});

hbs.registerHelper("state", state => {
  switch (state) {
    case "vacation":
      break;
    case "inactive":
      break;
    case "green":
      break;
    case "bandit":
      break;
    case "normal":
      break;

    default:
      break;
  }
});

hbs.registerHelper("times", function(n, block) {
  var accum = "";
  for (var i = 0; i < n; ++i) accum += block.fn(i);
  return accum;
});

hbs.registerHelper("sum", function(num1, num2) {
  return parseInt(num1) + parseInt(num2);
});

hbs.registerHelper("diff", function(num1, num2) {
  let diff = parseInt(num1) - parseInt(num2);
  return diff > 0 ? diff : 1;
});

hbs.registerHelper("for", function(from, to, incr, block) {
  var accum = "";
  for (var i = from; i <= to; i += incr) accum += block.fn(i);
  return accum;
});

hbs.registerHelper("paginatedTableIndex", function(index, pageNumber, perPage) {
  return parseInt(index) + parseInt(pageNumber - 1) * parseInt(perPage);
});
