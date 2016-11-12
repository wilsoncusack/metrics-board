const express = require('express');
const fs = require('fs');
const Pool = require('pg').Pool;
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser')

// const filebuffer = fs.readFileSync('db/usda-nnd.sqlite3');

// const db = new sqlite.Database(filebuffer);

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser())

app.set('port', (process.env.PORT || 3001));
var dbURL = process.env.DATABASE_URL
var credentials = dbURL.split("//")[1]
var splitCredentials = credentials.split(":")
var user = splitCredentials[0]
var passAndHost = splitCredentials[1]
var splitPassAndHost = passAndHost.split("@")
var password = splitPassAndHost[0]
var host = splitPassAndHost[1]
var portAndDB = splitCredentials[2]
var splitPortAndDB = portAndDB.split("/")
var port = splitPortAndDB[0]
var database = splitPortAndDB[1]


var config = {
  host: host,
  user: user,
  password: password,
  database: database,
  ssl: true
};

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

var pool = new Pool(config)

pool.on('error', function(e, client) {
  // if a client is idle in the pool
  // and receives an error - for example when your PostgreSQL server restarts
  // the pool will catch the error & let you handle it here
});


var onError = function(err, res) {
    console.log(err.message, err.stack)
    res.json({
      error: "err.message"
    })
  };

var getToken = function(){
  const buf = crypto.randomBytes(256);
  return buf.toString('hex');
}

session = {}; // this should be improved

app.post('/api/account', upload.array(), (req, res) => {
  var accountName = req.body.accountName;
  var mixpanelAPISecret =  req.body.mixpanelAPISecret

  if(!accountName){
    res.json({
      error: "Missing required parameter 'name'"
    })
    return;
  } else if(!mixpanelAPISecret){
    res.json({
      error: "Missing require parameter mixpanel_api_secret"
    })
    return;
  }
  pool.query('INSERT INTO accounts (name, mixpanel_api_secret) VALUES ($1, $2) returning id', [accountName, mixpanelAPISecret], function(err, result) {
    if (err) return onError(err);
    res.json( 
      result.rows[0]
      )
  });
})

var usernameAvaliable = function(username){
  pool.query('SELECT COUNT(*) FROM users WHERE username=$1;', [username], function(err, result) {
    if (err) return onError(err);
    return (results.rows[0].count == 0)
  });
}

app.post('/api/user', upload.array(), (req, res) => {
  var username = req.body.username;
  var password =  req.body.password;
  var accountID =  req.body.accountID;
  var accountAdmin =  req.body.accountAdmin;
  console.log(session[req.cookies.token])


  if(!username || !password || !accountID || !accountAdmin){
    res.json({
      error: "Missing required parameter"
    })
    return;
  }

  if(!usernameAvaliable(username)){
    res.json({
      error: "Username taken"
    })
    return;
  }

  bcrypt.hash(password, 10, function(err, hash) {
    if(err){
      console.log(err.message)
      res.json({
        error: "Error" + err.message
      })
      return
    }

    pool.query('INSERT INTO users (username, password, account_id, account_admin) VALUES ($1, $2, $3, $4) returning id', [username, hash, accountID, accountAdmin], function(err, result) {
      if (err) return onError(err);
      var token = getToken()
      var userID = result.rows[0].id
      res.cookie("token", token, {maxAge: 1800000});
      userDict = {user_id: userID, account_id: accountID, account_admin: account_admin}
      session[token] = userDict
      res.json(userDict)

    });     
  });
})

app.post('/api/login', (req, res) => {
  var username = req.body.username;
  var password =  req.body.password;

  if(!username || !password){
    res.json({
      error: "Missing required parameter"
    })
    return;
  }

  pool.query('SELECT id, password, account_admin, account_id FROM users WHERE username = $1;', [username], function(err, result){
    if (err) return onError(err);
    dict = result.rows[0].password
    bcrypt.compare(password, dict.password, function(err, res) {
      if(res){
        userDict = {user_id: dict.user_id, account_id: dict.account_id, account_admin: dict.acount_admin}
        session[token] = userDict
        res.json(userDict)
      } else {
        res.json({
          error: "Incorrect password"
        })
      }
      return
    });
  });

});

app.post('/api/widget', (req, res) => {
  const board = req.query.boardID;

  if (!board) {
    res.json({
      error: 'Missing required parameter `board`',
    });
    return;
  }
  pool.query('SELECT * FROM widgets WHERE board_id = $1;' [board], function(err, result){
      if (err) return onError(err);
      res.json(result.rows)
  });
});

app.get('/api/widget', (req, res) => {
  const board = req.query.boardID;

  if (!board) {
    res.json({
      error: 'Missing required parameter `board`',
    });
    return;
  }
  pool.query('SELECT * FROM widgets WHERE board_id = $1;' [board], function(err, result){
      if (err) return onError(err);
      res.json(result.rows)
  });
});

app.post('/api/board', (req, res) => {
  const boardName = req.body.name;
  userSession = session[req.cookies.token]
  const owner = userSession.userID
  const visibleToAllAccount = (userSession.account_admin && req.body.visibleToAllAccount)

  if (!boardName) {
    res.json({
      error: 'Missing required parameter `name`',
    });
    return;
  }
  pool.query('INSERT INTO boards (name, owner, visible_to_all_account) VALUES ($1, $2, $3) RETURNING *;', [boardName, owner, visibleToAllAccount], function(err, result){
      if (err) return onError(err);
      res.json(result.rows)
  });
});

app.get('/api/board', (req, res) => {
  userSession = session[req.cookies.token]
  userID = userSession.user_id
  accountID = userSession.account_id

  pool.query('SELECT * FROM boards WHERE user_id = $1 or (account_id = $2 and visible_to_all_account = true);',
    [userID, accountID], function(err, result){
      if (err) return onError(err);
      res.json(result.rows)
    });
});

pool
  .query('CREATE TABLE IF NOT EXISTS accounts (id serial PRIMARY KEY, name varchar(20), mixpanel_api_secret text)')
  .then(function() {
    pool.query('CREATE TABLE IF NOT EXISTS users (id serial PRIMARY KEY, username varchar(20), password varchar(60), account_id integer references accounts(id), account_admin boolean default false)')
  })
  .then(function() {
    pool.query('CREATE TABLE IF NOT EXISTS boards (id serial PRIMARY KEY, name varchar(20), owner integer references users(id), visible_to_all_account boolean default false)')
  })
  .then(function() {
    pool.query("CREATE TABLE IF NOT EXISTS widgets (id serial PRIMARY KEY, board_id integer references boards(id), event varchar(100), name varchar(100), values varchar(100)[], type varchar(20), unit varchar(20), interval integer, limit_return integer)")
  })
  .then(app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
}));
