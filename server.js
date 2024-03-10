const express = require('express');
const app = express();

// template engine인 ejs 세팅
app.set('view engine', 'ejs');

// /public 등록
app.use('/public', express.static('public'));

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

// session, passport을 사용하기 위한 세팅
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(passport.initialize());
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false
}));
app.use(passport.session());

// 아래는 라우팅 구현

app.get('/', (요청, 응답) => {
  응답.redirect('/list/1');
});


// /list 페이지 : 글 목록을 보여준다. (page 파라미터에 따라 게시물을 5개씩 보여줌)
app.get('/list/:page', async (요청, 응답) => {
  // 현재 페이지에 해당되는 5개 이하의 게시물을 postlist에 저장
  let postlist = await db.collection('post').find().skip((요청.params.page-1) * 5).limit(5).toArray();
  let allPostlist = await db.collection('post').find().toArray();
  console.log(postlist, Number(allPostlist.length));

  응답.render('list.ejs', {글목록 : postlist, 페이지 : 요청.params.page, 글수 : allPostlist.length});
});


// /write 페이지 : 글 작성
app.get('/write', async(요청, 응답) => {
  응답.render('write.ejs');
});

app.post('/add', async(요청, 응답) => {
  console.log(요청.body)

  if (요청.body.title == '' || 요청.body.content == '') {
    응답.send("<script>alert('제목이나 내용이 없습니다. 다시 작성해주십시오.'); window.location.replace('/write');</script>");
  }

  else {
    try {
      await db.collection('post').insertOne({
        title : 요청.body.title, // 제목 넣기
        content : 요청.body.content // 내용 넣기
      });
      응답.redirect ('/list');
    } catch (err) {
      console.log(err);
      return 응답.status(500).send('server error occurred');
    }
  }
});


// /detail 페이지 : 제목과 글, 삭제와 수정 기능 
app.get('/detail', async(요청, 응답) => {
  try {
    let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
    console.log(요청.query.id); 

    if (posting != null) { 
      응답.render('detail.ejs', {글 : posting});
    }

    else { 
      응답.send("<script>alert('존재하지 않는 게시물입니다.'); window.location.replace('/list');</script>");
    }
  } catch (err) {
    console.log('error occurred');
    return 응답.status(404).send('user error occurred');
  }
});


// /edit : 글 수정 페이지 
app.get('/edit', async(요청, 응답) => {
  let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
  console.log(요청.query.id); 
  
  응답.render('edit.ejs', {글 : posting});
});

app.put('/edit', async(요청, 응답) => {
  console.log (요청.body);
  try {
    if (요청.body.title == '' || 요청.body.content == '') {
      응답.send("<script>alert('제목이나 내용이 존재하지 않습니다.');</script>");
    } 
    else {
      await db.collection('post').updateOne({_id : new ObjectId(요청.body.id) }, {$set : {title : 요청.body.title, content : 요청.body.content}});
      응답.redirect('/list');
    }
  } catch (err) {
    응답.status(500).send('server error occurred');
  }
});

// /delete : 글 삭제
app.delete('/delete', async(요청, 응답) => {
  let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});

  console.log(posting)

  if (posting != null) {
    await db.collection('post').deleteOne({_id : new ObjectId(요청.query.id)});
  }

  else {
    응답.send("<script>alert('해당하는 게시물이 없습니다.'); window.location.replace('/list');</script>");
  }
});

// /auth : 회원가입
app.get ('/auth', async(요청, 응답) => {
  응답.render ("auth.ejs");
});

app.post ('/adduser', async(요청, 응답) => {
  if (요청.body.id == '' || 요청.body.pw == '') {
    응답.send("<script>alert('아이디나 비밀번호가 작성되지 않았습니다. 다시 작성해주십시오.'); window.location.replace('/auth');</script>");
  }

  else {
    try {
      await db.collection('user').insertOne({
        id : 요청.body.id, // 아이디 넣기
        pw : 요청.body.pw, // 비밀번호 넣기
        name : 요청.body.name // 이름 넣기
      });

      응답.redirect ('/');
    } catch (err) {
      console.log(err);
      return 응답.status(500).send('server error occurred');
    }
  }
})