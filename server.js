const express = require('express');
const app = express();

// template engine인 ejs 세팅
app.set('view engine', 'ejs');

// server랑 db의 통신 세팅
const { MongoClient } = require('mongodb');

let db;
const url = 'mongodb+srv://admin:admin@forum-express.ukasdrz.mongodb.net/?retryWrites=true&w=majority&appName=forum-express';

new MongoClient(url).connect().then((client)=>{ 
  console.log('MongoDB 연결 성공');
  db = client.db('forum'); // forum DB에 접속

  // 서버 port 오픈 (8080)
  app.listen(8080, () => {
    console.log("http://localhost:8080 에서 서버가 실행 중입니다.");
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

// 아래는 라우팅 구현

app.get('/', (요청, 응답) => {
  응답.redirect('/list');
});

// /list 페이지 : 글 목록을 보여준다.
app.get('/list', async (요청, 응답) => {
  let postlist = await db.collection('post').find().toArray();
  console.log(postlist);

  응답.render('list.ejs', {글목록 : postlist});
});


