/*
    /logout : 현재 사용자의 로그인 정보를 세션에서 지운다.
*/

const router = require('express').Router()
let connectDB = require('../utils/db.js')
const { ObjectId } = require('mongodb');
require('dotenv').config({path : "./../.env"}) 
let checkLogin = require('../utils/checkLogin.js');

// session, passport을 사용하기 위한 세팅
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local'); 

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

/////////////////////

function deleteCookie(user) {
	document.cookie = 'user=' + user + '; max-age=0;';
}

router.get('/logout', checkLogin, function(요청, 응답){
  요청.logout(() => {
    deleteCookie("connect.sid");
    응답.redirect("/");
  })
});

module.exports = router 
