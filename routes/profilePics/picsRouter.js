const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const passport = require("passport");

const Team = require("../team/model/Team");
const Pics = require("./model/Pics");
const Player = require("../player/model/Player");

// const jwtMiddleware = require("../utils/jwtMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/uploadedPics");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
}); //from multer documentation
const upload = multer({ storage: storage }); //from multer documentation

router.post(
  "/upload-player-image-to-db",
  passport.authenticate("jwt-player", { session: false }),
  upload.single("image"),
  async (req, res, next) => {
    const picPath = path.join(
      __dirname,
      `../../uploads/uploadedPics/${req.file.originalname}`
    ); //defining where the uploaded pic is for later use in reading data from location.

    try {
      const newPic = new Pics({
        img: {
          data: fs.readFileSync(picPath),
          contentType: "image/png",
        },
      }); //make a new pics by reading data from stored location

      let foundPlayer = await Player.findOne({ email: req.user.email });
      if (foundPlayer.pics.length > 1) {
        // foundPlayer.pics.splice(0, 1);
        let picToGetGone = foundPlayer.pics.shift(); //delete the old user photo from db and keep default img.
        await Pics.findByIdAndRemove({ _id: picToGetGone });
      }

      foundPlayer.pics.unshift(newPic._id); //push new id to player data
      await foundPlayer.save(); //save new player info
      await newPic.save(); //save new pic info
      res.json({ message: "success" });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/player-image",
  passport.authenticate("jwt-player", { session: false }),
  async (req, res, next) => {
    try {
      let imageToSend = await Player.findOne({ email: req.user.email });
      if (imageToSend.pics[0]) {
        foundPlayer = imageToSend._id; //serve up user id for use in front end
        console.log(foundPlayer);
        foundUserImage = await Pics.findById({ _id: imageToSend.pics[0] });
      } else {
        foundUserImage = undefined;
      }

      res.json({
        message: "success",
        payload: foundUserImage,
        foundPlayer: foundPlayer,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/team-images",
  passport.authenticate("jwt-player", { session: false }),
  async (req, res, next) => {
    try {
      let teamMemberArray = [];
      let teamMemberImagesArray = [];
      let teamPlayer = await Player.findOne({ email: req.user.email });
      let foundOurTeam = await Team.findById({
        _id: teamPlayer.team[0],
      });
      for (const id of foundOurTeam.teamPlayers) {
        let findPlayerForPicsData = await Player.findById({ _id: id }).select(
          "-email -password -__v -username -card"
        );
        if (findPlayerForPicsData.pics[0]) {
          let foundPics = await Pics.findById({
            _id: findPlayerForPicsData.pics[0],
          });
          teamMemberImagesArray.push(foundPics.img);
        }
        teamMemberArray.push(findPlayerForPicsData);
      }
      res.json({
        message: "success",
        payload: [
          teamMemberArray,
          teamMemberImagesArray,
          foundOurTeam.teamName,
        ],
      });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
