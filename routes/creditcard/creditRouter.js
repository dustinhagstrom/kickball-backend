const express = require("express");
const router = express.Router();
const passport = require("passport");

const { createCard } = require("./controller/creditController");

// const jwtMiddleware = require("../utils/jwtMiddleware");

router.post(
  "/save-credit-card",
  passport.authenticate("jwt-player", { session: false }),
  createCard
);

module.exports = router;
