'use strict'
var fs = require("fs");
const path = require('path');
var Promise = require("promise");
var concat = require("concat-stream");
var isDeveloping = process.env.NODE_ENV !== 'production';
var thePort = isDeveloping ? 3000 : process.env.PORT;
var contentBase = path.resolve(__dirname, './build');
var server_addr = process.env.ARANGO_SERVER ? process.env.ARANGO_SERVER : "http://localhost:8529";
var ignore = console.log("Using DB-Server " + server_addr);
var oracledb = require('oracledb');
var Database = require("arangojs");
var aql = require("arangojs").aql;
var database_name = 'floorplan-viewer'
if (server_addr !== "none") {
  var db = new Database(server_addr);
  db.useDatabase(database_name)
}
var express = require('express');
var app = express();
var helmet = require('helmet');
var bodyParser = require('body-parser');

const relativePathToFloorplans = '/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/';

var nodes = db.collection('nodes');
var edges = db.collection('edges');
var putRoute = '';

app.use(express.static(contentBase));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(helmet());

/////////////////////////////////////////////////////////////
// Purdue SMAS SQL information
var config = {
  user: 'collengr',
  password: 'F30_r4P{pRf6',
  connectString: 'lpvdbaopr07.itap.purdue.edu:1522/smas.itap.purdue.edu',
//    externalAuth: false,                                                         
}
oracledb.outFormat = oracledb.OBJECT;
oracledb.maxRows = 100000;
let connection;
oracledb.getConnection(config, (err, conn) => {
  if (err) {
    console.log(err.message);
    return;
  }
  connection = conn;
  console.log('Connection was successful!');
})


/////////////////////////////////////////////////////////////
// Token lookup
function checkToken (token) {
  return db.query(aql`
    FOR a IN authorizations
    RETURN {token: ${token}} 
  `).then(cursor => cursor.next())
  .then((result) => {
    return true
  }).catch((err) => {
    return false
  })
}

function getUserFromToken (token) {
  return db.query(aql`
    FOR a IN authorizations
    FILTER a.token == ${token}
    RETURN a.username 
  `).then(cursor => cursor.next())
  .then((result) => {
    return result 
  }).catch((err) => {
    return false
  })
}

/////////////////////////////////////////////////////////////
// Authentication middleware
function ensureAuthenticated () {
  return function (req, res, next) {
    let token = req.get('access_token')
    if (token && checkToken(token)) {
      return next()
    }
    return res.sendStatus(401)
  }
}

/////////////////////////////////////////////////////////////
// SAML strategy
/*
passport.use(new SamlStrategy({
  path: 'http://localhost',
  entryPoint: 'https://www.purdue.edu/apps/account/cas/login?service=http://localhost',
  issuer: 'passport-saml',
}, (profile, done) => {
  console.log(profile)
  return done(null, profile)
}))
*/

/////////////////////////////////////////////////////////////
// Local strategy
/*
passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log('username:', username, 'password:', password)
    db.query(aql`
        FOR doc IN users
        FILTER doc.password == ${password}
        FILTER doc.username == ${username}
        RETURN doc
    `).then(result => result.next())
    .then((res) => {
      console.log(res)
      if (res) {
        delete res.password
        return done(null, res)
      } 
      return done(null, false)
    }).catch((err) => {
      console.log(err)
      return done(null, false)
    })
  // Always use hashed passwords and fixed time comparison
    bcrypt.compare(password, user.passwordHash, (err, isValid) => {
      if (err) {
        return done(err)
      }
      if (!isValid) {
        return done(null, false)
      }
      return done(null, user)
    })
  }
))
*/

//app.use(session({secret: "super secret floorplan stuff"}));
//app.use(passport.initialize());
//app.use(passport.session());

/////////////////////////////////////////////////////////////
// Serialize and Deserialize
/*
passport.serializeUser(function(user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user._id);
});
    
passport.deserializeUser(function(id, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  db.query(aql`
    RETURN DOCUMENT('users', id)
  `).then(result => result.next())
  .then((res) => {
    console.log('~~~~~~~~~~', res)
    done(null, profile)
  }).catch((err) => {
    console.log(err);
    done(null, err)
  })
});
*/



/////////////////////////////////////////////////////////////
// Login and logout routes
app.post('/login', (req, res) => {
  return db.query(aql`
    FOR doc IN users
    FILTER doc.password == ${req.query.password}
    FILTER doc.username == ${req.query.username}
    RETURN doc
  `).then(result => result.next())
  .then((user) => {
    // generate a token and create a new authorization for the user
    if (user.username && user.password) {
      return db.query(aql`
        INSERT {
          token: RANDOM_TOKEN(21),
          username: ${user.username},
          scopes: '' //TODO: consider specifying levels of permission
        }  IN authorizations
        RETURN NEW
      `).then(cursor => cursor.next())
      .then((auth) => {
        return res.json({token:auth.token})
      }).catch((err) => {
        return res.sendStatus(401)
      })
    }
    return res.sendStatus(401)
  }).catch((error) => {
    return res.sendStatus(401)
  })
})

app.get('/logout', (req, res) => {
  console.log('logging out');
})

/////////////////////////////////////////////////////////////
// Other routes, ensuring authentication
app.get(relativePathToFloorplans, (req, res) => {
  let floorplanNames = fs.readdirSync(path.join(contentBase, relativePathToFloorplans));
  res.send(floorplanNames);
})

app.get('/edges/', ensureAuthenticated(), (req, res) => {
  if (!req.query._from && req.query._to) return res.send('either _to or _from must be specified in an edge query');
  let edgeCollection = db.collection('edges')
  let bnd, key;
  db.query(aql`
    FOR v, e, p IN 0..1 
      OUTBOUND ${req.query._from ? req.query._from : req.query._to}
      edges
      FILTER v._type == ${req.query._type}
    RETURN v`
  ).then((cursor) => {
    cursor.all().then((result) => {
       res.json(result)
    })
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/search', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('nodes')
  collection.fulltext("fulltext", 'prefix:'+req.query.text.split(' ').join(',prefix:')).then((cursor) => {
    cursor.all().then((results)=> {
      res.json(results)
    })
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/nodes', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('nodes')
  collection.byExample({ _type: req.query._type, name: decodeURIComponent(req.query.name) })
  .then((cursor) => {
    cursor.all().then((result) => {
      return res.json(result)
    })
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.delete('/edges', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('nodes')
  let example = {}
  if (req.query._to) example._to = req.query._to
  if (req.query._from) example._from = req.query._from
  if (req.query._type) example._type = req.query._type
  collection.removeByExample(example).then((result) => {
    console.log('DELETED: something of type ,', example._type, result._result)
    res.json(result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.delete('/nodes', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('nodes')
  let example = {}
  if (req.query._type) example._type = req.query._type
  if (req.query.name) example.name = req.query.name
  if (req.query.id) example._id = req.query.id
  if (req.query.key) example._key = req.query._key
  collection.removeByExample(example).then((result)=>{
    console.log('DELETED:', result)
    res.json(result)
  }).catch((err)=>{
    console.log(err)
    res.json(err)
  })
})

app.post('/nodes', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('nodes')
  var body = req.body;
  getUserFromToken(req.get('access_token')).then((username) => {
    body._createdDate = Date.now();
    body._modifiedBy = username;
    collection.save(body).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.send(err)
     })
  })
})

app.put('/nodes', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('nodes')
  getUserFromToken(req.get('access_token')).then((username) => {
    console.log('2', username, body)
    var body = req.body;
    body._modifiedDate = Date.now();
    body._modifiedBy = username;
    collection.updateByExample({_id: req.query.id}, body).then((result) => {
      console.log('RES', result)
      res.json(result)
    }).catch((err) => {
      console.log(err)
      res.send(err)
    })
  })
})

app.post('/edges', ensureAuthenticated(), (req, res) => {
  let collection = db.collection('edges')
  console.log(req.query)
  collection.save({
    _to: decodeURIComponent(req.query._to), 
    _from: decodeURIComponent(req.query._from),
    _type:req.query._type
  }).then((result) => {
    res.json(result)
  }).catch((err)=>{
    console.log(err)
    res.send(err)
  })
})

app.get('/collectionById/:collection/:key', ensureAuthenticated(), (req, res) => {
  let collection = db.collection(req.params.collection)
  collection.byExample({_key: req.params.key}).then((cursor) => {
    res.json(cursor._result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

// QUERY for s
app.get('/stuff', ensureAuthenticated(), (req, res) => {
  let node = 'nodes/'+req.query.name
  let filters = Object.keys(req.query).map((key) => {
    return `FILTER v.${key} === '${req.query[key]}'`
  })
  console.log('FILTERS: ', filters)
  db.query(aql`
    FOR v,e,p IN 0..5 
    OUTBOUND ${node}
    edges
    ${filters}
    RETURN DISTINCT p.vertices[1]
  `).then((result) => {
    res.json(result)
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get('/smas', ensureAuthenticated(), (req, res) => {
  connection.execute(
    `SELECT SHARE_INTERNAL_NOTE,TOTAL_AREA,BUILDING_ABBREVIATION,ROOM_ID,ROOM_NUMBER,SHARE_NUMBER,SHARE_ID,SHARE_PERCENT,SHARE_AREA,STATIONS,DESCRIPTION,ROOM_CLASSIFICATION,ASSIGNED_DEPT_ABBREVIATION,USING_DEPT_ABBREVIATION from OSIRIS.ROOM_CURRENT WHERE BUILDING_ABBREVIATION IN ('ARMS', 'GRIS', 'HAMP', 'ME', 'MSEE', 'WANG', 'EE') ORDER BY BUILDING_ABBREVIATION `,
    (err, result) => {
      if (err) { console.error(err.message); return; }                         
    res.json(result);
    }
  );
})

var server = app.listen(thePort, function () {
  var host = server.address().address
  var p = server.address().port
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', host, p);
});
