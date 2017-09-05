'use strict'
var fs = require("fs");
const path = require('path');
var Promise = require("promise");
var concat = require("concat-stream");
var isDeveloping = process.env.NODE_ENV !== 'production';
var thePort = isDeveloping ? 3000 : process.env.PORT;
var contentBase = path.resolve(__dirname, './build');
var server_addr = process.env.ARANGODB_SERVER ? process.env.ARANGODB_SERVER : "http://localhost:8529";
var ignore = console.log("Using DB-Server " + server_addr);
var Database = require("arangojs");
var aql = require("arangojs").aql;
var database_name = 'floorplan-viewer'
if (server_addr !== "none") {
  var db = new Database(server_addr);
  db.useDatabase(database_name)
}
var express = require('express');
var app = express();

var nodes = db.collection('nodes');
var edges = db.collection('edges');
var putRoute = '';

app.use(express.static(contentBase));

/////////////////////////////////////////////////////////////
const relativePathToFloorplans = '/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/';

app.get(relativePathToFloorplans, (req, res) => {
  let floorplanNames = fs.readdirSync(path.join(contentBase, relativePathToFloorplans));
  res.send(floorplanNames);
})

app.get('/edges/', (req, res) => {
  let edgeCollection = db.collection('edges')
  let bnd, key;
  let type = req.query.type
  if (req.query.from)  { 
    db.query(aql`
      FOR v, e, p IN 0..1 
        OUTBOUND ${req.query.from}
        edges
        FILTER v._type == ${type}
      RETURN v`
    ).then(function(cursor) {
      res.json(cursor._result)
    }).catch((err) => {
      console.log(err);
      res.json(err);
    })
  }
  if (req.query.to) {
    db.query(aql`
      FOR v, e, p IN 0..1 
        INBOUND ${req.query.to}
        edges
        FILTER v._type == ${type}
      RETURN v`
    ).then(function(cursor) {
      res.json(cursor._result)
    }).catch((err) => {
      console.log(err);
      res.json(err);
    })
  }
})

app.get('/search', (req, res) => {
  let collection = db.collection('nodes')
  collection.fulltext("fulltext", 'prefix:'+req.query.text.split(' ').join(',prefix:'))
  .then((cursor) => {
    res.json(cursor._result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/nodes', (req, res) => {
  let collection = db.collection('nodes')
  collection.byExample({ _type: req.query.type, name: decodeURI(req.query.name) })
  .then((cursor) => {
    res.json(cursor._result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.delete('/edges', (req, res) => {
  let collection = db.collection('nodes')
  let example = {}
  if (req.query.to) example._to = req.query.to
  if (req.query.from) example._from = req.query.from
  if (req.query.type) example.type = req.query.type
  collection.removeByExample(example).then((result) => {
    console.log('DELETED: something of type ,', example.type, result._result)
    res.json(result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.delete('/nodes', (req, res) => {
  let collection = db.collection('nodes')
  let example = {}
  if (req.query.type) example._type = req.query.type
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

app.post('/nodes', (req, res) => {
  let collection = db.collection('nodes')
  req.pipe(concat(function(body) {
    var body = JSON.parse(body)
    collection.save(body).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.send(err)
    })
  }))
})

app.put('/nodes', (req, res) => {
  let collection = db.collection('nodes')
  req.pipe(concat(function(body) {
    var body = JSON.parse(body)
    collection.updateByExample({_id: req.query.id}, body).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.send(err)
    })
  }))
})

app.post('/edges', (req, res) => {
  let collection = db.collection('edges')
  collection.save({_to:req.query.to, _from: req.query.from, type:req.query.type}).then((result) => {
    res.json(result)
  }).catch((err)=>{
    console.log(err)
    res.send(err)
  })
})

app.get('/collectionById/:collection/:key', (req, res) => {
  let collection = db.collection(req.params.collection)
  collection.byExample({_key: req.params.key}).then((cursor) => {
    res.json(cursor._result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})



///////////////////////////////////////////////////////
//////////////////////////////////////////////////////
/*

app.get('/personsFromPerson/:key', function(req, res) {
  var key = 'person/' + req.params['key'];
  var supervisors = [];
  var subordinates = []
  db.query(aql`
    FOR v IN 1..1 
      OUTBOUND ${key}
      supervisorPersonEdges
    RETURN v`
  ).then(function(cursor) {
    supervisors = cursor._result;
    db.query(aql`
      FOR v IN 1..1 
        INBOUND ${key}
        supervisorPersonEdges
      RETURN v`
    ).then(function(cursor) {
      subordinates = cursor._result;
      res.json({subordinates, supervisors})
    })
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/person/:key', function(req, res) {
  var example = {name: req.params['key']}
  personCollection.byExample(example).then((cursor) => {
    if (cursor.count === 0 ) {
      console.log('PERSON NOT FOUND:', req.params['key']);
      res.json(cursor._result)
    } else if (cursor.count > 1) {
      console.log('MULTIPLE PERSONS FOUND: ', cursor._result);
      res.json(cursor._result);
    }
    res.json(cursor._result);
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/floorplan/:key', function(req, res) {
  var example = {name: req.params['key']}
  floorplanCollection.byExample(example).then((cursor) => {
    if (cursor.count === 0 ) {
      console.log('FLOORPLAN NOT FOUND:', req.params['key']);
      res.json(undefined)
    } else if (cursor.count > 1) {
      console.log('MULTIPLE FLOORPLANS FOUND: ', cursor._result);
    }
    res.json(cursor._result[0]);
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/building/:key', function(req, res) {
  var example = {name: req.params['key']}
  buildingCollection.byExample(example).then((cursor) => {
    if (cursor.count === 0 ) {
      console.log('BUILDING NOT FOUND:', req.params['key']);
      res.json(undefined)
    } else if (cursor.count > 1) {
      console.log('MULTIPLE BUILDINGS FOUND: ', cursor._result);
    }
    res.json(cursor._result[0]);
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

////////////////////////////////////////////////

app.put('/person/', function(req, res) {
  req.pipe(concat(function(body) {
    personCollection.save(JSON.parse(body)).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.json(err)
    })
  }))
})

app.put('/roomPersonEdges/', function(req, res) {
  req.pipe(concat(function(body) {
    roomPersonEdges.save(JSON.parse(body)).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.send(err)
    })
  }))
})

app.put('/updatePerson/', function(req, res) {
  req.pipe(concat(function(body) {
    var body = JSON.parse(body)
    personCollection.updateByExample(body.example, body.newValue).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.send(err)
    })
  }))
})

app.put('/updateRoom/', function(req, res) {
  req.pipe(concat(function(body) {
    var body = JSON.parse(body)
    roomCollection.updateByExample(body.example, body.newValue).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      console.log(err)
      res.send(err)
    })
  }))
})

app.delete('/roomPersonEdges?', function(req, res) {
  let example = {_from:'room/'+req.query.from, _to: 'person/'+req.query.to}
  console.log(example)
  roomPersonEdges.removeByExample(example).then((result)=>{
    res.json(result)
  }).catch((err)=>{
    console.log(err)
    res.send(err)
  })
})

//TODO; duplicate this for keyholders
app.delete('/deleteRoomPersonEdge?', function(req, res) {
  let example = {_from:'room/'+req.query.room, _to: 'person/'+req.query.person}
  roomPersonEdges.removeByExample(example).then((result)=>{
    res.json(result)
  }).catch((err)=>{
    console.log(err)
    res.send(err)
  })
})

app.get('/searchPersons/:key', function(req, res) {
  var key = 'prefix:'+req.params['key'].split(' ').join(',prefix:');
  personCollection.fulltext('fulltext', key).then((cursor) => {
    res.json(cursor._result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})

app.get('/searchRooms/:key', function(req, res) {
  var key = 'prefix:'+req.params['key'].split(' ').join(',prefix:');
  roomCollection.fulltext('fulltext', key).then((cursor) => {
    res.json(cursor._result)
  }).catch((err) => {
    console.log(err);
    res.json(err);
  })
})
*/

var server = app.listen(thePort, function () {
  var host = server.address().address
  var p = server.address().port
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', host, p);
});
