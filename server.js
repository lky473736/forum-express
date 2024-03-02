const express = require('express');
const app = express();

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