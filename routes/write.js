/*
    /write : 글을 작성한다
*/

const router = require('express').Router()
let connectDB = require('../utils/db.js')
const { ObjectId } = require('mongodb');
let checkLogin = require('../utils/checkLogin.js');
const express = require('express');

router.use(express.json())
router.use(express.urlencoded({extended:true}))

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.get('/', checkLogin, async(요청, 응답) => {
  console.log ("글 작성 페이지 접근")
  응답.render('write.ejs', {로그인상태 : 요청.user});
});

router.post('/', checkLogin, async(요청, 응답) => {
  if (요청.body.title == '' || 요청.body.content == '') {
    응답.send("<script>alert('제목이나 내용이 없습니다. 다시 작성해주십시오.'); window.location.replace('/write');</script>");
  }

  else {
    try {
      let today = new Date();
      
      await db.collection('post').insertOne({
        title : 요청.body.title, // 제목 넣기
        content : 요청.body.content, // 내용 넣기
        name : 요청.user.name, // 유저의 이름 넣기
        date : today.toLocaleDateString() // 작성한 날짜 넣기
      });
      
      console.log("글 발행 완료")
      응답.redirect ('/');
    } catch (err) {
      console.log ("ERROR")
      console.log(err);
      return 응답.status(500).send('server error occurred');
    }
  }
});

module.exports = router 
