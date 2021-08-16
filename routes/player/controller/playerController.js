const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const Player = require("../model/Player");
const Team = require("../../team/model/Team");
const Pics = require("../../profilePics/model/Pics");
const Card = require("../../creditcard/model/Card");

const signup = async function (req, res, next) {
  let teamNames = [
    "Ball Sharks",
    // "Nice Kicks",
    // "The Trolls",
    // "The Wizards",
    // "Unicorn Kickers",
    // "The Bunters",
    // "The Karens",
    // "The Fireballs",
  ];

  const { firstName, lastName, username, email, password } = req.body;
  // const { errorObj } = res.locals;
  try {
    let salt = await bcrypt.genSalt(12);
    let hashedPassword = await bcrypt.hash(password, salt);

    let profileImagePath = path.join(__dirname, "./new_user.png");

    const createPicData = new Pics({
      img: {
        data: fs.readFileSync(profileImagePath),
        contentType: "image/png",
      },
    });

    const createdPlayer = new Player({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });
    let myRando = Math.floor(Math.random() * 1);
    let foundTeam = await Team.findOne({
      teamName: teamNames[myRando],
    });
    foundTeam.teamPlayers.push(createdPlayer._id);
    createdPlayer.team.push(foundTeam._id);
    createdPlayer.pics.push(createPicData._id);
    let savedPlayer = await createdPlayer.save();
    await createPicData.save();
    await foundTeam.save();
    res.json({ message: "success - user created", payload: savedPlayer });
  } catch (e) {
    next(e);
  }
};
const login = async function (req, res, next) {
  // const { errorObj } = res.locals;
  const { email, password } = req.body;
  try {
    let foundPlayer = await Player.findOne({ email: email });

    if (!foundPlayer) {
      res.status(400).json({
        message: "failure",
        payload: "Please check your email and password.",
      });
    } else {
      let comparedPassword = await bcrypt.compare(
        password,
        foundPlayer.password
      );

      if (!comparedPassword) {
        res.status(400).json({
          message: "failure",
          payload: "Please check your email and password.",
        });
      } else {
        let jwtToken = jwt.sign(
          {
            email: foundPlayer.email,
            username: foundPlayer.username,
          },
          process.env.PRIVATE_JWT_KEY,
          {
            expiresIn: "1d",
          }
        );

        res.json({
          message: "success",
          payload: jwtToken,
        });
      }
    }
  } catch (e) {
    next(e);
  }
};

const addProfileImage = async function (req, res, next) {
  const imgObj = {
    profileImage: {
      data: fs.readFileSync(
        path.join(__dirname, "../../../uploads/" + req.file.filename)
      ),
      contentType: "image/jpg",
    },
  };
  try {
    let addedPicToPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      imgObj,
      {
        new: true,
      }
    ).select("-__v");
    res.json({ message: "success", payload: addedPicToPlayer });
  } catch (e) {
    next(e);
  }
};

const deletePlayer = async function (req, res, next) {
  try {
    let { id } = req.params;
    let deletedPlayer = await Player.findByIdAndRemove(id);
    let deletedCard = await Card.findByIdAndRemove({
      _id: deletedPlayer.card[0],
    });
    let foundTeam = await Team.findById({ _id: deletedPlayer.team[0] });
    let filteredTeam = foundTeam.teamPlayers.filter(
      (teamMember) => teamMember.toString() !== deletedPlayer._id.toString() //the .toString() is needed here or else does not work!!!
    );
    console.log(filteredTeam);
    foundTeam.teamPlayers = filteredTeam;
    await foundTeam.save();
    await Pics.findByIdAndRemove({
      _id: deletedPlayer.pics[0],
    }); //delete the profile image
    res.json({
      message: "success",
      payload: [deletedPlayer, deletedCard, foundTeam, filteredTeam],
    });
  } catch (e) {
    next(e);
  }
};

const getPlayer = async function (req, res, next) {
  try {
    const { decodedJwt } = res.locals;
    const foundPlayer = await Player.findOne({ email: decodedJwt.email });
    res.json({ message: "success", payload: foundPlayer });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  signup,
  login,
  addProfileImage,
  deletePlayer,
  getPlayer,
};
