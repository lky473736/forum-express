/*
    /delete : 삭제 기능
    사용자의 게시물을 삭제한다.
*/

const router = require('express').Router();
let connectDB = require('./../utils/db.js')
const { ObjectId } = require('mongodb'); 
let checkLogin = require('../utils/checkLogin.js');

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.delete('/', checkLogin, async(요청, 응답) => {
    let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
  
    if (posting != null) {
      if (요청.user.name === posting.name) {
        await db.collection('post').deleteOne({_id : new ObjectId(요청.query.id)});
        응답.redirect('/')
        console.log ("게시물 삭제 완료")
      }
  
      else {
        if (요청.user.name !== posting.name) {
          응답.send("<script>alert('다른 사용자의 글을 삭제할 수 없습니다.'); history.back()</script>");
          console.log ("다른 사용자의 글에 삭제 접근")
        }
      }
    }
  
    else {
      응답.send("<script>alert('해당하는 게시물이 없습니다.'); window.location.replace('/');</script>");
      console.log ("해당되는 게시물이 존재하지 않음")
    }
  });

module.exports = router 
