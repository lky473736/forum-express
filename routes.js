const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const listRoute = require('./routes/list');
const detailRoute = require('./routes/detail');
const writeRoute = require('./routes/write');
const editRoute = require('./routes/edit');
const deleteRoute = require('./routes/delete');
const logoutRoute = require('./routes/logout');
const mypageRoute = require('./routes/mypage');

const routes = (app, db) => {
  app.get('/', (req, res) => {
    console.log(req.user);
    res.redirect('/list/1');
  });

  app.use('/register', registerRoute);
  app.use('/login', loginRoute);
  app.use('/list', listRoute);
  app.use('/detail', detailRoute);
  app.use('/write', writeRoute);
  app.use('/edit', editRoute);
  app.use('/delete', deleteRoute);
  app.use('/logout', logoutRoute);
  app.use('/mypage', mypageRoute);
};

module.exports = routes;
