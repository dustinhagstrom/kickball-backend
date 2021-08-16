const express = require("express");
const jwtMiddleware = require("../utils/jwtMiddleware");
const router = express.Router();

const { loadTeam, createNewTeam } = require("./controller/teamController");

router.get("/get-team/:id", jwtMiddleware, loadTeam);

router.post("/create-team", createNewTeam);
module.exports = router;
