process.on("uncaughtException", err => {
  console.log("un error brus: ", err);
});

var obj = {
  prop1: { nombre: "brus", apellido: "harper" },
  prop2: "se",
  prop3: "la",
  prop4: "come"
};

var infinite = 1 / 0;
process.nextTick(function() {
  throw new Error();
});

setTimeout(() => {
  console.log("brus!!!!!!!!!!!");
}, 3000);
// console.log(JSON.stringify(obj, null, "\t"));
