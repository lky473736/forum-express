/*
    /edit : 글을 수정한다.
*/

const router = require('express').Router()
let connectDB = require('./../utils/db.js')
const { ObjectId } = require('mongodb'); 
let checkLogin = require('../utils/checkLogin.js');

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.get('/', checkLogin, async(요청, 응답) => {
    let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
      console.log(요청.query.id); 
  
    if (요청.user.name === posting.name) {
      응답.render('edit.ejs', {글 : posting, 로그인상태 : 요청.user});
      console.log ("edit 창을 불러옴")
    }
    else {
      응답.send("<script>alert('다른 사용자의 글을 수정할 수 없습니다.'); window.location.replace('/list/1');</script>");
      console.log ("다른 사용자의 글을 수정하려고 시도")
    }
});

router.put('/', checkLogin, async(요청, 응답) => {
    console.log (요청.body);
    try {
      if (요청.body.title == '' || 요청.body.content == '') {
        응답.send("<script>alert('제목이나 내용이 존재하지 않습니다.');</script>");
        console.log ("edit 창에서 제목이나 내용이 작성되지 않음")
      } 
      else {
        await db.collection('post').updateOne({_id : new ObjectId(요청.body.id) }, {$set : {title : 요청.body.title, content : 요청.body.content}});
        응답.redirect('/');
        console.log ("게시물 수정 완료")
      }
    } catch (err) {
      응답.status(500).send('server error occurred');
      console.log ("ERROR")
      console.log (err)
    }
  });

module.exports = router 
