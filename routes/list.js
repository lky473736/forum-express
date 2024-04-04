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

router.get('/:page', async (요청, 응답) => {
    // 현재 페이지에 해당되는 5개 이하의 게시물을 postlist에 저장
    let postlist = await db.collection('post').find().skip((요청.params.page-1) * 5).limit(5).toArray();
    let allPostlist = await db.collection('post').find().toArray();
    console.log(postlist, Number(allPostlist.length));
  
    응답.render('list.ejs', {글목록 : postlist, 페이지 : 요청.params.page, 글수 : allPostlist.length, 로그인상태 : 요청.user});
});

module.exports = router 
