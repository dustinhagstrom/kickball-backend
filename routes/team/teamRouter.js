const express = require("express");
// const jwtMiddleware = require("../utils/jwtMiddleware");
const router = express.Router();
const passport = require("passport");

const {
  loadTeam,
  getAllTeams,
  createNewTeam,
  joinATeam,
  quitATeam,
} = require("./controller/teamController");

router.get(
  "/get-team-list",
  passport.authenticate("jwt-player", { session: false }),
  getAllTeams
);

router.get(
  "/get-team/:id",
  passport.authenticate("jwt-player", { session: false }),
  loadTeam
);

router.post("/create-team", createNewTeam);

router.put(
  "/join-team",
  passport.authenticate("jwt-player", { session: false }),
  joinATeam
);

router.put(
  "/quit-team",
  passport.authenticate("jwt-player", { session: false }),
  quitATeam
);
module.exports = router;
