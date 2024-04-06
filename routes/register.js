/*
    /register : 회원가입을 하여 user collection에 저장한다. 
*/

const router = require('express').Router()
let connectDB = require('../utils/db.js')
const { ObjectId } = require('mongodb');
let checkLogin = require('../utils/checkLogin.js');
const express = require('express');

router.use(express.json())
router.use(express.urlencoded({extended:true}))

let db
connectDB.then((client)=>{
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
}) 

// bcrypt 해싱 알고리즘을 사용하기 위한 세팅
const bcrypt = require('bcrypt');

// session, passport을 사용하기 위한 세팅
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

///////////

router.get ('/', async(요청, 응답) => {
    console.log ("회원가입 페이지 접근")
    응답.render ("register.ejs", {로그인상태 : 요청.user});
});
  
router.post ('/', async(요청, 응답) => {
    if (요청.body.username == '' || 요청.body.password == '') {
      console.log ("사용자가 아이디나 비밀번호를 작성하지 않음.")
      응답.send("<script>alert('아이디나 비밀번호가 작성되지 않았습니다. 다시 작성해주십시오.'); window.location.replace('/auth');</script>");
    }
  
    else {
      try {
        // 비밀번호를 hashing해서 저장하기
        let hashingPassword = await bcrypt.hash(요청.body.password, 10);
  
        await db.collection('user').insertOne({
          username : 요청.body.username, // 아이디 넣기
          password : hashingPassword, // 비밀번호 넣기 (해싱된)
          name : 요청.body.name // 이름 넣기
        });
  
        console.log ("회원가입 완료")
        응답.redirect ('/');
      } catch (err) {
        console.log ("ERROR");
        console.log(err);
        return 응답.status(500).send('server error occurred');
      }
    }
});

module.exports = router 
