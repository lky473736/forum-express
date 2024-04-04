// /login : 로그인
const router = require('express').Router()
let connectDB = require('./../db.js')
const { ObjectId } = require('mongodb');
require('dotenv').config() 


let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

// bcrypt 해싱 알고리즘을 사용하기 위한 세팅
const bcrypt = require('bcrypt');

// session, passport을 사용하기 위한 세팅
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// mongoDB에 session 저장하기 위한 세팅
const MongoStore = require('connect-mongo');

router.use(passport.initialize());
router.use(session({
    secret: '_',
    resave : false,
    saveUninitialized : false,
    // session 기간 변경 : 2주 (기본값) -> 1시간
    cookie : {maxAge : Number(process.env.SESSION_TERM)},
    store: MongoStore.create({
      mongoUrl : process.env.DB_URL,
      dbName : process.env.DB_NAME
    })
  }));
router.use(passport.session());

// /login 페이지에 사용할 DB 탐색 함수 (passport)
// 사용 방식 : passport.authenticate('local')(~~~~~~~~)
passport.use(new LocalStrategy(async (입력아이디, 입력비밀번호, cb) => {
    try {
        let result = await db.collection('user').findOne({ username : 입력아이디});

        if (!result) {
        return cb(null, false, { message: 'DB에 account가 없음' });
        }

        // 해싱된 비밀번호와 입력한 비밀번호를 비교
        let isPassword = await bcrypt.compare(입력비밀번호, result.password);
        console.log(isPassword);

        if (isPassword) {
        return cb(null, result);
        } 
        
        else {
        return cb(null, false, { message: '비밀번호 불일치' });
    } } catch (err) {
        console.log(err);
    }
}));

// login 완료 후 session 발행
// 요청.logIn 사용할 때 자동 실행된다
// done 안에 두번째 인자 : session document, 쿠키에 담아서 유저에게 보내줌
passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username });
    });
});

// deserializeUser : 유저가 보낸 쿠키 분석 & session과 비교 (요청.user == 유저의 정보)
// 회원가입과 로그인 페이지 API를 맨 위로 보내기
passport.deserializeUser(async(user, done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    delete result.password
    process.nextTick(() => {
        return done(null, result)
    })
});

// /login : 로그인 페이지
router.get ('/', (요청, 응답) => {
    응답.render("login.ejs", {로그인상태 : 요청.user});
});

router.post ('/', async(요청, 응답, next)=> {
    // 제출한 아이디와 비번 쌍이 DB에 있는 건지 확인
    // -> session 생성

    // 아래 과정은 base. passport 문법으로 구현
    // const user = await db.collection('user').findOne({
    //   username : 요청.body.username,
    //   password : 요청.body.password
    // });
    // if (user == null) {
    //   console.log("이런 회원 없음");
    // }
    // else {
    //   console.log("회원가입 성공");
    // }

    passport.authenticate('local', {sessions: true}, (error, user, info) => {
        if (error) { // 서버 에러남
            return 응답.status(500).send ("server error occured");
        }

        if (!user) { // 유저가 없음 or 비밀번호 불일치
            return 응답.status(401).json (info.message);
        }

        요청.logIn(user, (err) => { // logIn함수가 session을 만들어 준다
            if (err) { // 에러나면
                return next(err);
            }

            응답.redirect("/");
        });
    })(요청, 응답, next);
});

module.exports = router 
