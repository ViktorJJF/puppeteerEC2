const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let botsSchema = new Schema({});

module.exports = mongoose.model("Bots", botsSchema);
