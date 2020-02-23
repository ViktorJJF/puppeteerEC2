const hbs = require("express-hbs");
const formatISO9075 = require("date-fns/formatISO9075");
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
  return formatISO9075(date, { representation: "time" });
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
