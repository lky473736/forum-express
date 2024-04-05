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

router.get ("/", checkLogin, async(요청, 응답) => {
    console.log(요청.user);
    응답.render("mypage.ejs", {로그인상태 : 요청.user});
});

module.exports = router 
