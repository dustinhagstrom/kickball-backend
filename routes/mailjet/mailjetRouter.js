const express = require("express");
const router = express.Router();

const mailjet = require("node-mailjet").connect(
  process.env.MAILJET_API_ID,
  process.env.MAILJET_API_KEY
);

router.post("/send-practice-email", function (req, res) {
  let userEmail = req.body.emailInput;
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "dustin.hagstrom@codeimmersives.com",
          Name: "dustin",
        },
        To: [
          {
            Email: userEmail,
            Name: "dustin",
          },
        ],
        Subject: "Greetings from Kickballers!",
        TextPart: "My first Kickballers email",
        HTMLPart:
          "<h3>Dear Kickballer, welcome to <a href='http://localhost:3000'>Kickballers</a>!</h3><br />Keep your eyes open for our weekly email! <br />Until then, we would like to initiate you to the game of kickball with some light reading material.<br /><a href='https://kickball.com/rules/'>Rules of the Field</a>",
        CustomID: "AppGettingStartedTest",
      },
    ],
  });
  request
    .then((result) => {
      console.log(result.body);
      res.json({ message: "email sent" });
    })
    .catch((err) => {
      console.log(err.statusCode);
    });
});

module.exports = router;
