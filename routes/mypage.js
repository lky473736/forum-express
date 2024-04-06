/*
    /mypage : 현재 내 이름, 아이디를 보여준다.
*/

const router = require('express').Router()
let connectDB = require('../utils/db.js')
const { ObjectId } = require('mongodb');
let checkLogin = require('../utils/checkLogin.js');

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

router.get ("/", checkLogin, async(요청, 응답) => {
    console.log('마이페이지 들어감, 현재 로그인 상태 : ', 요청.user);
    응답.render("mypage.ejs", {로그인상태 : 요청.user});
});

module.exports = router 
