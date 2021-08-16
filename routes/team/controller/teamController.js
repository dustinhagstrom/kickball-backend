const Player = require("../../player/model/Player");
const Team = require("../model/Team");

const loadTeam = async function (req, res, next) {
  try {
    const { id } = req.params;

    let payload = await Team.findById({ _id: id }).select(
      "-_id -__v -teamPlayers"
    );
    console.log(payload);
    res.json({ payload });
  } catch (e) {
    next(e);
  }
};

const createNewTeam = async function (req, res, next) {
  const { teamName } = req.body;

  try {
    const newTeam = new Team({
      teamName,
    });
    const savedNewTeam = await newTeam.save();
    res.json({ newTeam });
  } catch (e) {
    next(e);
  }
};
module.exports = { loadTeam, createNewTeam };
