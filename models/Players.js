const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let playersSchema = new Schema({
  id: String,
  nickname: {
    unique: true,
    type: String,
    required: [true, "el nick del jugador es necesario!"]
  },
  planets: [
    {
      id: String,
      name: String,
      coords: String,
      planetType: String,
      activities: [
        {
          date: Date,
          lastActivity: String
        }
      ]
    }
  ],
  notes: String
});

module.exports = mongoose.model("Players", playersSchema);
