const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const Player = require("../../player/model/Player");

const keys = process.env.PRIVATE_JWT_KEY;

//the setup that follows is from passport-jwt documentation for example req with auth headers
const jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = keys; //can be buffer or string

//jwt auth strategy constructed by:
// new JwtStrategy(options, verify);
const playerJWTLoginStrategy = new JwtStrategy(
  jwtOptions,
  async (payload, done) => {
    const playerEmail = payload.email;

    try {
      if (playerEmail) {
        const player = await Player.findOne({ email: playerEmail }).select(
          "-password"
        );

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
