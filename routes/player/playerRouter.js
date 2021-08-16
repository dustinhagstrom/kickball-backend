const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

const jwtMiddleware = require("../utils/jwtMiddleware");

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

router.get("/get-player", jwtMiddleware, getPlayer);

module.exports = router;
