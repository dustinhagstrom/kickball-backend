const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  expDate: {
    type: Date,
  },
  code: {
    type: String,
  },
  player: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Player",
    },
  ],
});

module.exports = mongoose.model("Card", CardSchema);
