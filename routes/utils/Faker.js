const faker = require("faker"); //faker npm
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); //bcryptjs npm
const fs = require("fs"); //built into node already
const axios = require("axios"); //axios npm
const path = require("path"); //built into node already
const multer = require("multer"); //file handling middleware module

const storage = multer.diskStorage({
  //this is from multer docs
  destination: function (req, file, cb) {
    cb(null, "uploads/fakerpics");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //docs says "file.filename", but can change to fit
    //app and the data we have
  },
});
const upload = multer({ storage }); //this is from multer docs

///////////////////Schemas///////////////////////////////////
const Team = require("../team/model/Team");
const Player = require("../player/model/Player");
const Card = require("../creditcard/model/Card");
const Pics = require("../profilePics/model/Pics");

//middleware function to make api call to faker for image &&
//it writes a file in the defined path that contains data
//from the response object
const myPhotoMiddleware = async function (req, res, next) {
  try {
    const fakeFirstName = faker.name.firstName();
    const fakeLastName = faker.name.lastName();
    const fakeProfileImage = faker.image.avatar();
    res.locals.fakeFirstName = fakeFirstName;
    res.locals.fakeLastName = fakeLastName;
    let ourPng = `${fakeFirstName}${fakeLastName}.png`;
    let profileImagePath = path.join(
      __dirname,
      `../../uploads/fakerpics/${ourPng}`
    );

    await axios({
      method: "get",
      url: fakeProfileImage,
      responseType: "stream",
    }).then(function (response) {
      //the following bit of code is from axios docs to handle
      //responses for images/other large data responses
      response.data.pipe(fs.createWriteStream(profileImagePath));
      //at this point the call was made and data stored in local
      //directory defined in profileImagePath variable
      next();
    });
  } catch (e) {
    next(e);
  }
};
// this is where we generate the rest of the fake player data
router.post(
  "/make-player-and-cc-data",
  myPhotoMiddleware,
  async function (req, res, next) {
    let teamNames = [
      //make this a dynamic get req for teams from db in future
      "Ball Sharks",
      // "Nice Kicks",
      // "The Trolls",
      // "The Wizards",
      // "Unicorn Kickers",
      // "The Bunters",
      // "The Karens",
      // "The Fireballs",
    ];
    const { fakeFirstName, fakeLastName } = res.locals;

    const fakeCardNumber = faker.finance.creditCardNumber();
    const fakeCode = faker.finance.creditCardCVV();
    const fakeExpDate = faker.date.future();
    const fakeUsername = faker.internet.userName();
    const fakeEmail = faker.internet.email();
    const fakePassword = faker.internet.password();

    try {
      let createPicData; //initialize variable here to hold data
      //from nested function in following code.
      let salt = await bcrypt.genSalt(12);
      let hashedPassword = await bcrypt.hash(fakePassword, salt);
      let ourPng = `${fakeFirstName}${fakeLastName}.png`; //rename the faker url to fake username.jpg

      let profileImagePath = path.join(
        __dirname,
        `../../uploads/fakerpics/${ourPng}`
      ); // this is the location in my files where the pic will go
      console.log(profileImagePath);
      //the following reads the data in local directory of the fake
      //profile image and the uses Pics schema to make new instance
      //of an image for storage to db
      fs.readFile(profileImagePath, async function (err, data) {
        if (err) {
          res.status(500).json(err);
        } else {
          createPicData = new Pics({
            img: {
              data: data,
              contentType: "image/png",
            },
          });
        }
      }); //this makes new pics data by going to file location and getting the data that is stored there. the data is already a buffer.

      const createPlayerData = new Player({
        firstName: fakeFirstName,
        lastName: fakeLastName,
        username: fakeUsername,
        email: fakeEmail,
        password: hashedPassword,
      });

      const createCCData = new Card({
        cardNumber: fakeCardNumber,
        firstName: createPlayerData.firstName,
        lastName: createPlayerData.lastName,
        expDate: fakeExpDate,
        code: fakeCode,
      });

      let myRando = Math.floor(Math.random() * 1);

      let foundTeam = await Team.findOne({ teamName: teamNames[myRando] });

      createPlayerData.team.push(foundTeam._id);
      createPlayerData.card.push(createCCData._id);
      createPlayerData.pics.unshift(createPicData._id);
      foundTeam.teamPlayers.push(createPlayerData._id);
      createCCData.player.push(createPlayerData._id);

      await createPlayerData.save();
      await createCCData.save();
      await createPicData.save();
      await foundTeam.save();
      res.json({
        payload: [createPlayerData, createCCData, foundTeam, createPicData],
      });
    } catch (e) {
      console.log(e);
    }
  }
);

module.exports = router;
