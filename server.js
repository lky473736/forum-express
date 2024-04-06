const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// setupApp : 세팅 파일들 실행
const setupApp = require('./setupApp');

// startApp : api 시작
const startApp = require('./startApp');

setupApp(app);
startApp(app);
