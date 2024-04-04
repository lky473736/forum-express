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

router.get('/', async(요청, 응답) => {
    let posting = await db.collection('post').findOne({_id : new ObjectId(요청.query.id)});
      console.log(요청.query.id); 
  
    if (응답.user.name === posting.name) {
      응답.render('edit.ejs', {글 : posting, 로그인상태 : 요청.user});
    }
    else {
      응답.send("<script>alert('다른 사용자의 글을 수정할 수 없습니다.'); window.location.replace('/list/1');</script>");
    }
});

router.put('/', async(요청, 응답) => {
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
  

module.exports = router 
