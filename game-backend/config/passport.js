const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const prisma = require("../prisma");

let cache = {};
passport.cache = cache;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.GAME_PRIVATE_KEY,
};

passport.use(
  "game-jwt",
  new JwtStrategy(jwtOptions, async (payload, done) => {
    var expirationDate = new Date(payload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }
    
    let authProvider;
    if (payload.telegram_id) {
      authProvider = await prisma.auth_providers.findFirst({
        where: { telegram_id: payload.telegram_id }
      });
      if (!authProvider) {
        return done(null, {
          isNewUser: true,
          ...payload
        });
      }
    }
   
    let gameUser;
    if (authProvider) {
      gameUser = await prisma.game_users.findFirst({
        where: { id: authProvider.game_user_id }
      });
      if (gameUser) {
        return done(null, gameUser);
      }
    }
    return done(null, false);
  })
);

module.exports = passport;
