const router = require('express').Router()
let connectDB = require('./../db.js')
const { ObjectId } = require('mongodb'); 

let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.delete('/', async(요청, 응답) => {
    let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
  
    if (posting != null) {
      if (응답.user.name === posting.name) {
        await db.collection('post').deleteOne({_id : new ObjectId(요청.query.id)});
      }
  
      else {
        if (응답.user.name !== posting.name) {
          응답.send("<script>alert('다른 사용자의 글을 삭제할 수 없습니다.'); window.location.replace('/list/1');</script>");
        }
      }
    }
  
    else {
      응답.send("<script>alert('해당하는 게시물이 없습니다.'); window.location.replace('/list/1');</script>");
    }
  });

module.exports = router 
