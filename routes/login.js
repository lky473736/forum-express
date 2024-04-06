/*
    /login : 로그인을 하는 페이지다.
*/

const router = require('express').Router()
let connectDB = require('../utils/db.js')
const { ObjectId } = require('mongodb');
require('dotenv').config({path : "./../.env"}) 

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

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
    cookie : {cookie : process.env.SESSION_TERM},
    store: MongoStore.create({
      mongoUrl : process.env.DB_URL,
      dbName : process.env.DB_NAME
    })
}));
router.use(passport.session());

// /login 페이지에 사용할 DB 탐색 함수 (passport)
passport.use(new LocalStrategy(async (입력아이디, 입력비밀번호, cb) => {
    try {
        let result = await db.collection('user').findOne({ username : 입력아이디});

        if (!result) {
            return cb(null, false, { message: 'DB에 account가 없음' });
        }

        // 해싱된 비밀번호와 입력한 비밀번호를 비교
        let isPassword = await bcrypt.compare(입력비밀번호, result.password);

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
passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username });
    });
});

// deserializeUser : 유저가 보낸 쿠키 분석 & session과 비교 (요청.user == 유저의 정보)
passport.deserializeUser(async(user, done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    console.log (result)
    delete result.password

    process.nextTick(() => {
        console.log(result)
        return done(null, result)
    })
});

/////////////////////

router.get ('/', (요청, 응답) => {
    if (요청.user === undefined) {
        응답.render("login.ejs", {로그인상태 : 요청.user});
    }
    
    else {
        응답.send("<script>alert('이미 다른 계정으로 로그인되어 있습니다. 로그아웃 한 후 다시 로그인해주세요.'); window.location.replace('/');</script>");
    }
});

router.post ('/', async(요청, 응답, next)=> {
    // 제출한 아이디와 비번 쌍이 DB에 있는 건지 확인
    // -> session 생성

    passport.authenticate('local', {sessions: true}, (error, user, info) => {
        if (error) { // 서버 에러남
            console.log ("ERROR")
            return 응답.status(500).send ("server error occured");
        }

        if (!user) { // 유저가 없음 or 비밀번호 불일치
            console.log ("유저가 없거나 비밀번호가 불일치함")
            return 응답.status(401).json (info.message);
        }

        요청.logIn(user, (err) => { // logIn함수가 session을 만들어 준다
            if (err) { // 에러나면
                console.log("로그인 에러")
                return next(err);
            }

            console.log("로그인 완료")
            응답.redirect("/");
        });
    })(요청, 응답, next);
});

module.exports = router 
