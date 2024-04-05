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
    요청.logout(function(err) {
    // if (err) { return next(err); }
        응답.redirect('/list/1');
    });
});

module.exports = router 
