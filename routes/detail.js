const router = require('express').Router()
let connectDB = require('./../db.js')
const { ObjectId } = require('mongodb'); 

let db

connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')

  // /detail 페이지 : 제목과 글, 삭제와 수정 기능 
  router.get('/', async(요청, 응답) => {
    try {
      let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
      console.log(요청.query.id); 

      if (posting != null) { 
        응답.render('detail.ejs', {글 : posting, 로그인상태 : 요청.user});
      }

      else { 
        응답.send("<script>alert('존재하지 않는 게시물입니다.'); window.location.replace('/list');</script>");
      }
    } catch (err) {
      console.log('error occurred');
      console.log(err);
      return 응답.status(404).send('user error occurred');
    }
  });
}) 

module.exports = router 