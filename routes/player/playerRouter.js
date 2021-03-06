const express = require("express");
const router = express.Router();
const multer = require("multer");
const passport = require("passport");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

// const jwtMiddleware = require("../utils/jwtMiddleware");

const {
  signup,
  login,
  addProfileImage,
  deletePlayer,
  getPlayer,
} = require("./controller/playerController");

router.post("/signup", signup);

router.post("/login", login);

router.put("/add-profile-image", upload.single("image"), addProfileImage);

router.delete("/delete-player-by-id/:id", deletePlayer);

router.get(
  "/get-player",
  passport.authenticate("jwt-player", { session: false }),
  getPlayer
);

router.get("/logout", function (req, res) {
  res.clearCookie("jwt-cookie"); //i don't actually think I need this portion b/c of "js-cookie npm" that deletes cookie on front-end.
  res.send("Logged out!");
});

module.exports = router;
