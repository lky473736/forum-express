const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const setupApp = (app) => {
  app.set('view engine', 'ejs');
  app.use('/public', express.static('public'));
  app.use(methodOverride('_method'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    secret: '_',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: Number(process.env.SESSION_TERM) },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      dbName: process.env.DB_NAME
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = setupApp;
