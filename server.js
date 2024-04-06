const express = require('express');
const app = express();

// .env 파일 사용 세팅
require('dotenv').config() 

// template engine인 ejs 세팅
app.set('view engine', 'ejs');

// /public 등록
app.use('/public', express.static('public'));

// server랑 db의 통신 세팅
let connectDB = require('./db.js');

connectDB.then((client)=>{ 
  console.log('MongoDB 연결 성공');
  db = client.db('forum'); // forum DB에 접속

  app.listen(process.env.PORT, () => {
    console.log("http://localhost:3000 에서 서버가 실행 중입니다.");
  });
}).catch((err)=>{
  console.log(err); // 에러가 발생한다면 에러를 출력
});

// 메소드 오버라이드를 위한 세팅 (form태그에 put, delete하기 위해)
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// 요청.body를 사용하기 위한 세팅
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ObjectId를 사용하기 위한 세팅
const ObjectId = require('mongodb').ObjectId;

// bcrypt 해싱 알고리즘을 사용하기 위한 세팅
const bcrypt = require('bcrypt');

// session, passport을 사용하기 위한 세팅
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// mongoDB에 session 저장하기 위한 세팅
const MongoStore = require('connect-mongo');

app.use(passport.initialize());
app.use(session({
    secret: '_',
    resave : false,
    saveUninitialized : false,
    // session 기간 변경 : 2주 (기본값) -> 1시간
    cookie : {maxAge : process.env.SESSION_TERM},
    store: MongoStore.create({
      mongoUrl : process.env.DB_URL,
      dbName : process.env.DB_NAME
    })
}));
app.use(passport.session());

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



////////////////////////////////////////////////////

// 아래는 라우팅 구현

app.get('/', (요청, 응답) => {
  console.log(요청.user)
  응답.redirect('/list/1');
});

// /register : 회원가입
app.use('/register', require('./routes/register.js'));

// /login : 로그인
app.use('/login', require('./routes/login.js'));

// /list 페이지 : 글 목록을 보여준다. (page 파라미터에 따라 게시물을 5개씩 보여줌)
app.use('/list', require('./routes/list.js'));

// /detail 페이지 : 제목과 글, 삭제와 수정 기능 
app.use('/detail', require('./routes/detail.js'));

// /write 페이지 : 글 작성
app.use('/write', require('./routes/write.js'));

// /edit : 글 수정 페이지 
app.use('/edit', require('./routes/edit.js'));

// /delete : 글 삭제
app.use('/delete', require('./routes/delete.js'));

// /logout : 로그아웃 페이지
app.use('/logout', require('./routes/logout.js'));

// /mypage : 마이페이지
app.use('/mypage', require('./routes/mypage.js'));