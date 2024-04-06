const connectDB = require('./utils/db');
const passportSetup = require('./passportSetup');
const routes = require('./routes');
const passport = require('passport'); // passport 가져오기


const startApp = (app) => {
  connectDB.then((client) => {
    console.log('MongoDB 연결 성공');
    const db = client.db('forum');
    passportSetup(passport, db);
    routes(app, db);
    app.listen(process.env.PORT, () => {
      console.log("http://localhost:3000 에서 서버가 실행 중입니다.");
    });
  }).catch((err) => {
    console.log(err);
  });
};

module.exports = startApp;