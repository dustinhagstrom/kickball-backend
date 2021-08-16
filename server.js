require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./app");
const port = 8080;

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server connected on ${port}`);
      console.log("MONGODB CONNECTED");
      console.log(__dirname);
    });
  })
  .catch((e) => {
    console.log(e);
  });
