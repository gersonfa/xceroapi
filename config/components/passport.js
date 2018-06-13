const passport = require("passport");
const User = require("../../models/user");
const config = require("../config");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local");
const boom = require("boom");

//  Setting username field to account rather than username
const localOptions = {
  usernameField: "account",
  passwordField: "password"
};

// Setting up local login Strategy
const localLogin = new LocalStrategy(
  localOptions, async (account, password, done) => {
    try {
      let user = await User.findOne({
        account: account
      });
      if (user) {
        user.comparePassword(password, (err, isMatch) => {
          if (err) boom.internal(err.message);
          if (!isMatch) boom.unauthorized("Nombre de usuario o contraseña incorrectos.");
          return done(null, user);
        });
      }
    } catch (e) {
      return done(e);
    }
  }
);

//  Setting JWT strategy options
const jwtOptions = {
  //  Telling Passport to check authorization headers for jwt
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //  Telling passport where to find the secret
  secretOrKey: config.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    let user = await User.findById(payload._id)
    if (!user) throw boom.notFound('user unauthorized')
    done(null, user)

  } catch (e) {
    return done(e)
  }
});

passport.use(jwtLogin);
passport.use(localLogin);
