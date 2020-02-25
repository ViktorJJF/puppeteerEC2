const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let galaxiesSchema = new Schema({
  number: {
    unique: true,
    type: String,
    required: [true, "el numero de galaxia es requerida"]
  },
  solarSystem: []
});

module.exports = mongoose.model("Galaxies", galaxiesSchema);
