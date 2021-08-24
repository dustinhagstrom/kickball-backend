const { deletePlayer } = require("../../player/controller/playerController");
const Player = require("../../player/model/Player");
const Team = require("../model/Team");

const loadTeam = async function (req, res, next) {
  try {
    const { id } = req.params;

    let payload = await Team.findById({ _id: id }).select(
      "-_id -__v -teamPlayers"
    );
    res.json({ payload });
  } catch (e) {
    next(e);
  }
};

const getAllTeams = async function (req, res, next) {
  try {
    let foundAllTeams = await Team.find({}).select("-__v -_id -teamPlayers");
    let allTheTeamNamesArray = [];
    foundAllTeams.forEach((team) => allTheTeamNamesArray.push(team.teamName));
    res.json({ payload: allTheTeamNamesArray });
  } catch (e) {
    next(e);
  }
};

const createNewTeam = async function (req, res, next) {
  const { teamName } = req.body;
  try {
    let teamAlreadyExists = await Team.findOne({ teamName: teamName });
    if (teamAlreadyExists) {
      res.json({ message: "This team already exists!!" });
    } else {
      const newTeam = new Team({
        teamName,
      });
      await newTeam.save();
      res.json({ message: "Your team has been created!", payload: newTeam });
    }
  } catch (e) {
    next(e);
  }
};

const joinATeam = async function (req, res, next) {
  const { teamName, email } = req.body;

  try {
    let foundTeam = await Team.findOne({ teamName: teamName });
    let foundPlayer = await Player.findOne({ email: email });
    console.log(foundTeam);
    console.log(foundPlayer);
    foundPlayer.team.push(foundTeam._id);
    foundTeam.teamPlayers.push(foundPlayer._id);
    await foundPlayer.save();
    await foundTeam.save();
    res.json({ isOnATeam: true });
    console.log(foundPlayer.team);
  } catch (e) {
    next(e);
  }
};

const quitATeam = async function (req, res, next) {
  const { teamName, email } = req.body;

  try {
    let foundTeam = await Team.findOne({ teamName: teamName });
    let foundPlayer = await Player.findOne({ email: email });
    foundPlayer.team.pop();
    let playerIndex = foundTeam.teamPlayers.indexOf(foundPlayer._id);
    foundTeam.teamPlayers.splice(playerIndex, 1);
    await foundPlayer.save();
    await foundTeam.save();
    res.json({ message: "success", payload: [foundPlayer, foundTeam] });
  } catch (e) {
    next(e);
  }
};
module.exports = { loadTeam, getAllTeams, createNewTeam, joinATeam, quitATeam };
