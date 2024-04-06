const express = require('express');
const app = express();

// .env 파일 사용 세팅
require('dotenv').config() 

// template engine인 ejs 세팅
app.set('view engine', 'ejs');

// /public 등록
app.use('/public', express.static('public'));

// server랑 db의 통신 세팅
let connectDB = require('./utils/db.js');

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
  cookie : {maxAge : Number(process.env.SESSION_TERM)},
  store: MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : process.env.DB_NAME
  })
}));
app.use(passport.session());

// bcrypt 해싱 알고리즘을 사용하기 위한 세팅
const bcrypt = require('bcrypt');

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