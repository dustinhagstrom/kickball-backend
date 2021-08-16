const Card = require("../model/Card");
const Player = require("../../player/model/Player");

async function createCard(req, res, next) {
  const { decodedJwt } = res.locals;

  const { cardNumber, firstName, lastName, expDate, code } = req.body;
  try {
    let foundPlayer = await Player.findOne({
      email: decodedJwt.email,
    });
    const newCard = new Card({
      cardNumber,
      firstName,
      lastName,
      expDate,
      code,
    });
    const savedNewCard = await newCard.save();

    foundPlayer.card.push(savedNewCard._id);

    await foundPlayer.save();
    res.json({ newCard });
  } catch (e) {
    next(e);
  }
}

module.exports = { createCard };
