const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passport = require('passport'); // passport 가져오기

const passportSetup = (passport, db) => {
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      let result = await db.collection('user').findOne({ username: username });

      if (!result) {
        return done(null, false, { message: 'DB에 account가 없음' });
      }

      let isPassword = await bcrypt.compare(password, result.password);
      console.log(isPassword);

      if (isPassword) {
        return done(null, result);
      } else {
        return done(null, false, { message: '비밀번호 불일치' });
      }
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    process.nextTick(() => {
      done(null, { id: user._id, username: user.username });
    });
  });

  passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({ _id: user.id });
    delete result.password;
    process.nextTick(() => {
      return done(null, result);
    });
  });
};

module.exports = passportSetup;
