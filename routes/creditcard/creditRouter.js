const express = require("express");
const router = express.Router();

const { createCard } = require("./controller/creditController");

const jwtMiddleware = require("../utils/jwtMiddleware");

router.post("/save-credit-card", jwtMiddleware, createCard);

module.exports = router;
