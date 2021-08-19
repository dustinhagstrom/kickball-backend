const express = require("express");
// const jwtMiddleware = require("../utils/jwtMiddleware");
const router = express.Router();
const passport = require("passport");

const { loadTeam, createNewTeam } = require("./controller/teamController");

router.get(
  "/get-team/:id",
  passport.authenticate("jwt-player", { session: false }),
  loadTeam
);

router.post("/create-team", createNewTeam);
module.exports = router;
