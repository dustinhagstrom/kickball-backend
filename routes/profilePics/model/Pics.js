const mongoose = require("mongoose");

const PicsSchema = new mongoose.Schema({
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("Pics", PicsSchema);
