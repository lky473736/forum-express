/*
    /detail : 게시물의 내용, 작성자, 작성 날짜를 보여준다.
*/

const router = require('express').Router()
let connectDB = require('./../utils/db.js')
const { ObjectId } = require('mongodb'); 
let checkLogin = require('../utils/checkLogin.js');

let db
connectDB.then((client)=>{
  db = client.db('forum')

  router.get('/', async(요청, 응답) => {
    try {
      let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
      console.log(요청.query.id); 

      if (posting != null) { 
        응답.render('detail.ejs', {글 : posting, 로그인상태 : 요청.user});
        console.log("글을 정상적으로 불러옴")
      }

      else { 
        응답.send("<script>alert('존재하지 않는 게시물입니다.'); window.location.replace('/');</script>");
        console.log("존재하지 않은 게시물에 접근")
      }
    } catch (err) {
      console.log('ERROR');
      console.log(err);
      return 응답.status(404).send('error occurred');
    }
  });
}) 

module.exports = router 