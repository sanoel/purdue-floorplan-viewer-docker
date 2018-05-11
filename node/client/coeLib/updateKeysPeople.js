'use strict'
let arangojs = require('arangojs');
let Database = arangojs.Database;
const isDeveloping = process.env.NODE_ENV !== 'production';
const thePort = isDeveloping ? 3000 : process.env.PORT;
const path = require('path');
const contentBase = path.resolve(__dirname, '../build');
const server_addr = process.env.ARANGODB_SERVER ? process.env.ARANGODB_SERVER : "http://localhost:8529";
const db = new Database(server_addr);
const database_name = 'floorplan-viewer';
const Promise = require('bluebird').Promise;
const coeLib = require('./index.js');
const csvjson = require('csvjson');

let aql = arangojs.aql; 
//keysData - DATE,DEPARTMENT,LAST NAME,FIRST,PUID,STATUS,SUPERVISOR,BUILDING,ROOM NUMBER,KEY NUMBER,KEY IDENTIFIER
let keysData = require('./keys-data.json')
//roomsData - Bldg,Room,ShareNumber,%,Area,Department Using,Department Assigned,Sta,Room Type,Description,Internal Note
//let smasData = require('./smas-data/json/smas-data.json')
let smasFilesPath = './smas-data/csv/'
let smasRoomTypesWithPeople = ['MEDIA PROD', 'NONCLAS LAB', 'OFFICE'];
let _ = require('lodash')
let fs = require("fs");

var dbPromise = db.listDatabases()
.then((names) => {
  if (names.indexOf(database_name) > -1){
    return db.useDatabase(database_name);
  } else {
    return db.createDatabase(database_name).then(() => {
      return db.useDatabase(database_name);
    })
  }
});


const nodes = db.collection('nodes');
const edges = db.collection('edges');

dbPromise
/* WARNING: THIS WILL DELETE THE NODES COLLECTION (ALL OF THE DATA) IN ALL LIKELIHOOD
.then(() => { console.log('Creating database collections...'); return nodes.create() })
.catch(() => { return nodes.drop()}).then(() => {return nodes.create() }) 
*/
.then(() => { console.log('Generating edges from keyholders to rooms...'); return coeLib.findKeysDataRoomPersonEdges(nodes, edges, keysData)})
.catch((err) => { console.error(err)})
//Create fulltext indexes
.then(() => { console.log('creating fulltext index...'); return nodes.createFulltextIndex('fulltext')})
.catch((err)=>{console.error(err)})
