/*
    /search : keyword로 글을 검색하고 검색한 글 리스트를 불러온다
*/

const router = require('express').Router()
let connectDB = require('./../utils/db.js')
const { ObjectId } = require('mongodb');

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.get('/:page', async (요청, 응답) => {
    // 현재 페이지에 해당되는 5개 이하의 게시물을 postlist에 저장
    console.log (요청.query.keyword)
    let option = 요청.query.sort;
    let findByOption;

    if (option === "title") {
      findByOption = {"title" : {'$regex' : 요청.query.keyword}};
    }
    else if (option === "content") {
      findByOption = {"content" : {'$regex' : 요청.query.keyword}};
    }
    else {
      findByOption = {"name" : {'$regex' : 요청.query.keyword}};
    }
    console.log (findByOption);

    try {
        let postlist = await db.collection('post').find(findByOption).skip((요청.params.page-1) * 5).limit(5).toArray();
        let allPostlist = await db.collection('post').find(findByOption).toArray();
    
        응답.render('result.ejs', {글목록 : postlist, 페이지 : 요청.params.page, 글수 : allPostlist.length, 로그인상태 : 요청.user, 검색키워드 : 요청.query.keyword});
        console.log ("keyword를 search -> list up한 게시물을 보여줌 / 게시물 수 : ", allPostlist.length)
    } catch (err) {
        console.log (err);
    }
});

module.exports = router 
