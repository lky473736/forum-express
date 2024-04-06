function checkLogin(요청, 응답, next) {
    if (요청.user === undefined) {
        응답.send("<script>alert('로그인이 필요합니다.'); window.location.replace('/login');</script>");
    }
    else {
        console.log(요청.user)
        next();
    }
}

module.exports = checkLogin;