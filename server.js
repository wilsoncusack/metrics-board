const express = require('express');
const fs = require('fs');
const Pool = require('pg').Pool;
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser')
var redis = require("redis")

// const filebuffer = fs.readFileSync('db/usda-nnd.sqlite3');

// const db = new sqlite.Database(filebuffer);

const app = express();
app.set('port', (process.env.PORT || 3001));

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}
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

var rClient = redis.createClient(process.env.REDIS_URL);


var onError = function(err, res) {
  console.log(err.message, err.stack)
  res.json({
    error: "err.message"
  })
};

var getToken = function(callback){
  const buf = crypto.randomBytes(30);
  var strToken = buf.toString('hex');
  rClient.hgetall(strToken, function(err, obj){
    if(obj == null){
      callback(strToken);
      return;
    }
    getToken(callback)
  });
}


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
    if (err) return onError(err, res);
    res.json( 
      result.rows[0]
      )
  });
})

var usernameAvaliable = function(username, callback){
  pool.query('SELECT COUNT(*) FROM users WHERE username=$1;', [username], function(err, result) {
    if (err) return onError(err, res);
    console.log(result.rows)
    console.log(result.rows[0].count === "0")
    callback(result.rows[0].count === "0")
  });
}

var login = function(userID, accountID, accountAdmin, res){
  pool.query('SELECT mixpanel_api_secret FROM accounts WHERE id = $1;', [accountID], function(err, result){
    if (err) return onError(err, res);
    var mixpanelAPISecret = result.rows[0].mixpanel_api_secret;
    getToken(function(token){
      rClient.multi([
        ["hmset", token, "user_id", userID, "account_id", accountID, "account_admin", accountAdmin, "mixpanel_api_secret", mixpanelAPISecret],
        ["expire", token, 86400000]
        ]).exec(function (err, replies) {
          if (err) return onError(err, res);
        });
        res.cookie("token", token, {maxAge: 86400000});
        res.json({
          userID: userID,
          accountID: accountID,
          accountAdmin: accountAdmin,
          mixpanelAPISecret: mixpanelAPISecret
        })
        res.send()
      });
  });
}

app.post('/api/user', upload.array(), (req, res) => {
  var username = req.body.username;
  var password =  req.body.password;
  var accountID =  req.body.accountID;
  var accountAdmin =  req.body.accountAdmin;

  if(!username || !password || !accountID || !accountAdmin){
    res.json({
      error: "Missing required parameter"
    })
    return;
  }
  usernameAvaliable(username, available => {
    console.log(available)
    if(!available){
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
        if (err) return onError(err, res);
        var userID = result.rows[0].id
        login(userID, accountID, accountAdmin, res)

      });     
    });
  })
})

var getUser = function(token, callback){
  rClient.hgetall(token, function (err, obj) {
    if(err){
      callback(null);
      return;
    } else if (obj == null){
      callback(null);
      return;
    }
    callback({
      user_id: parseInt(obj.user_id),
      account_id: parseInt(obj.account_id),
      account_admin: Boolean(obj.account_admin),
      mixpanel_api_secret: obj.mixpanel_api_secret
    })
  });
}

var loginFromSession = function(user, res){
  res.json({
    userID: user.user_id,
    accountID: user.account_id,
    accountAdmin: user.account_admin,
    mixpanelAPISecret: user.mixpanel_api_secret
  })
}

var loginFromUserPass = function(username, password, res){
  if(!username || !password) {
    res.json({
      error: "Missing required parameter"
    })
    return;
  }
  pool.query('SELECT id, password, account_admin, account_id FROM users WHERE username = $1;', [username], function(err, result){
    if (err) return onError(err, res);
    var dict = result.rows[0]
    bcrypt.compare(password, dict.password, function(err, bres) {
      if(bres){
        login(dict.id, dict.account_id, dict.account_admin, res)
        return;
      } else {
        res.json({
          error: "Incorrect password"
        })
      }
      return
    });
  });
}

app.post('/api/login', (req, res) => {
  const username = req.body.username;
  const password =  req.body.password;

  if(req.cookies.token){
    getUser(req.cookies.token, user => {
      if(user){
        loginFromSession(user, res)
        return;
      } else {
        loginFromUserPass(username, password, res);
        return;
      } 
    });
  } else {
    loginFromUserPass(username, password, res);
  }
});



var canAccessBoard = function(user, board, res, callback){
  if(user.account_admin){
    pool.query('SELECT count(*) FROM boards WHERE account_id = $1 and id = $2;', [user.account_id, board], function(err, result){
      if (err) return onError(err, res);
      callback(result.rows[0].count == 1)
    });
  } else {
    pool.query('SELECT count(*) FROM boards WHERE owner = $1 or visible_to_all_account = true and id = $2;', [user.user_id, board], function(err, result){
      if (err) return onError(err, res);
      callback(result.rows[0].count == 1)
    });
  }
}

app.post('/api/widget', (req, res) => {
  const board = parseInt(req.body.boardID);
  const user = getUser(req.cookies.token, user => {
    if(!user) {res.json({"Error": "unauthorized"}); return}

    if (!board) {
      res.json({
        error: 'Missing required parameter `boardID`',
      });
      return;
    }

    canAccessBoard(user, board, res, canAccess => {
      if(!canAccess){
        res.json({
          error: "Access denied"
        })
        return
      }
      
      pool.query('INSERT INTO WIDGETS (title, board_id, event, name, values, type, unit, interval, limit_return) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *;', [req.body.title, req.body.boardID, req.body.event, req.body.name, req.body.values, req.body.type, req.body.unit, req.body.interval, req.body.limitReturn], function(err, result){
        if (err) return onError(err, res);
        res.json(result.rows[0])
      });
    });
  });
});


app.get('/api/widget', (req, res) => {
  const board = parseInt(req.query.boardID);
  const user = getUser(req.cookies.token, user => {
    if(!user) {res.json({"Error": "unauthorized"}); return}

    if (!board) {
      res.json({
        error: 'Missing required parameter `boardID`',
      });
      return;
    }

    canAccessBoard(user, board, res, canAccess => {
      if(!canAccess){
        res.json({
          error: "Access denied"
        })
        return
      }
      pool.query('SELECT * FROM widgets WHERE board_id = $1;', [board], function(err, result){
        if (err) return onError(err, res);
        res.json(result.rows)
      });
    });


  });
});

app.post('/api/board', (req, res) => {
  // check if board name is taken
  const boardName = req.body.name;
  getUser(req.cookies.token, (user) => {
    if(!user) {res.json({"Error": "unauthorized"}); return}
    const owner = user.user_id
    const visibleToAllAccount = (user.account_admin && req.body.visibleToAllAccount)

    if (!boardName) {
      res.json({
        error: 'Missing required parameter `name`',
      });
      return;
    }
    pool.query('INSERT INTO boards (name, owner, account_id, visible_to_all_account) VALUES ($1, $2, $3, $4) RETURNING *;', [boardName, user.user_id, user.account_id, visibleToAllAccount], function(err, result){
      if (err) return onError(err, res);
      res.json(result.rows[0])
    });
  });
});

app.get('/api/board', (req, res) => {
  getUser(req.cookies.token, (user) => {
    if(!user) {res.json({"Error": "unauthorized"}); return}

    const userID = user.user_id
    const accountID = user.account_id

    pool.query('SELECT * FROM boards WHERE owner = $1 or (account_id = $2 and visible_to_all_account = true);',
      [userID, accountID], function(err, result){
        if (err) return onError(err,res);
        res.json(result.rows)
      });
  });
});

pool
.query('CREATE TABLE IF NOT EXISTS accounts (id serial PRIMARY KEY, name varchar(20), mixpanel_api_secret text)')
.then(function() {
  pool.query('CREATE TABLE IF NOT EXISTS users (id serial PRIMARY KEY, username varchar(20), password varchar(60), account_id integer references accounts(id), account_admin boolean default false)')
})
.then(function() {
  pool.query('CREATE TABLE IF NOT EXISTS boards (id serial PRIMARY KEY, name varchar(20), owner integer references users(id), account_id integer references accounts(id), visible_to_all_account boolean default false)')
})
.then(function() {
  pool.query("CREATE TABLE IF NOT EXISTS widgets (id serial PRIMARY KEY, title varchar(100), board_id integer references boards(id), event varchar(100), name varchar(100), values varchar(100)[], type varchar(20), unit varchar(20), interval integer, limit_return integer)")
})
.then(app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
}));
