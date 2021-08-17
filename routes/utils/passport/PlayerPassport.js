const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const Player = require("../../player/model/Player");

const keys = process.env.PRIVATE_JWT_KEY;

const jwtOptions = {};

jwtOptions.jwtFromRequest = Extract.Extract.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = keys;

const playerJWTLoginStrategy = new JwtStrategy(
  jwtOptions,
  async (payload, done) => {
    const playerEmail = payload.email;
    console.log(playerEmail);

    try {
      if (playerEmail) {
        const player = await Player.findOne({ email: playerEmail }).select(
          "-password"
        );

        console.log(player);

        if (!player) {
          return done(null, false);
        } else {
          return done(null, player);
        }
      } else {
        return done(null, false);
      }
    } catch (e) {
      return done(e, false);
    }
  }
);

module.exports = playerJWTLoginStrategy;
