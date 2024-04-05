const router = require('express').Router()
let connectDB = require('./../db.js')
const { ObjectId } = require('mongodb');

let checkLogin = require('../utils/checkLogin.js');

let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.get('/', checkLogin, async(요청, 응답) => {
  응답.render('write.ejs', {로그인상태 : 요청.user});
});

router.post('/', checkLogin, async(요청, 응답) => {
  console.log(요청.body)

  if (요청.body.title == '' || 요청.body.content == '') {
    응답.send("<script>alert('제목이나 내용이 없습니다. 다시 작성해주십시오.'); window.location.replace('/write');</script>");
  }

  else {
    console.log(요청.user)
    try {
      let today = new Date();
      
      await db.collection('post').insertOne({
        title : 요청.body.title, // 제목 넣기
        content : 요청.body.content, // 내용 넣기
        name : 요청.user.name, // 유저의 이름 넣기
        date : today.toLocaleDateString() // 작성한 날짜 넣기
      });
      응답.redirect ('/list/1');
    } catch (err) {
      console.log(err);
      return 응답.status(500).send('server error occurred');
    }
  }
});

module.exports = router 
