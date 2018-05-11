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
const keysData = require('./keys-data.json')
const smasConnectionConfig = require('./smasConnectionConfig.js')
const _ = require('lodash')
const fs = require("fs");

let aql = arangojs.aql; 
//keysData - DATE,DEPARTMENT,LAST NAME,FIRST,PUID,STATUS,SUPERVISOR,BUILDING,ROOM NUMBER,KEY NUMBER,KEY IDENTIFIER
//roomsData - Bldg,Room,ShareNumber,%,Area,Department Using,Department Assigned,Sta,Room Type,Description,Internal Note
let smasRoomTypesWithPeople = ['MEDIA PROD', 'NONCLAS LAB', 'OFFICE'];

/////////////////////////////////////////////////////////////
// Purdue SMAS SQL information
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.maxRows = 100000;


function addUsers() {
  let path = '../passwords.csv';
  let users = {};
  let content = csvjson.toObject(fs.readFileSync(path, 'utf8'), {delimiter: ',', quote: '"'});
  return Promise.map(content, (row) => {
    users[row.username] = {
      name: row.name,
      password: row.hash,
      email: row.email,
      username: row.username,
      createdDate: Date.now(),
    }
    return
  }).then(() => { return users; })
}

//TODO: rework into populateCollection output, then fix edge lookup
function addBuildingsFloorplans(nodes, edges) {
  let path = '../public/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/';
  let files = fs.readdirSync(path);
  let buildings = {};
  return Promise.each(files, function(file) {
    let building = file.match('^(.+)_.+.svg$')[1];
    let floor = file.match('^.+_(.+).svg$')[1];
    let floorplan = {
      name: building + ' ' + floor, 
      building,
      floor,
      filename: file,
      createdDate: Date.now(),
      _type: 'floorplan',
    }
    floorplan.fulltext = coeLib.createFullText(floorplan, coeLib.searchableFloorplanAttributes);
    if (!buildings[building]) {
      buildings[building] = {
        name: building,
        floors: [floor],
        fulltext: building,
        createdDate: Date.now(),
        _type: 'building',
      }
    } else buildings[building].floors.push(floor)
    return nodes.save(floorplan)
  }).then(function() {
    return Promise.each(Object.keys(buildings), function(building) {
      console.log('saving', buildings[building])
      return nodes.save(buildings[building]).then(function(data) {
        return Promise.each(buildings[building].floors, function(floor) {
          return nodes.byExample({name: building + ' ' + floor, _type: 'floorplan'}).then(function(cursor) {
            if (cursor.count === 0 ) {
              console.log('FLOORPLAN NOT FOUND:', building + ' ' + floor);
              return null;
            } else if (cursor.count > 1) {
              console.log('MULTIPLE FLOORPLANS: ', cursor._result); 
              return null;
            }
            let edge = {_from: data._id, _to: cursor._result[0]._id, type: 'building-floorplan'}
            return edges.save(edge);
          })
        })
      })
    })
  })
}

// Combine all of the smas data files
/*
let smasFilesPath = './smas-data/csv/'
let smasData = []
let files = fs.readdirSync(smasFilesPath);
files.forEach((file) => {
  var path = smasFilesPath + file;
  var stats = fs.statSync(path)
  var content = csvjson.toObject(fs.readFileSync(path, 'utf8'), {delimiter: ',', quote: '"'});
  if (stats.birthtime) {
    content.forEach((item, i) => {
      content[i].date = stats.birthtime;
    })
  }
  smasData = smasData.concat(content);
})
*/
var smasData = [];
// Setup the database
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
const edges = db.edgeCollection('edges');
const users = db.collection('users');
const authorizations = db.collection('authorizations');

let shares;

dbPromise
/* WARNING: THIS WILL DELETE EACH OF THE COLLECTIONS IN ALL LIKELYHOOD
.then(() => { console.log('Creating database collections...'); 
return nodes.create() })
.catch(() => { return nodes.drop()}).then(() => {return nodes.create() }) 
.then(() => { return edges.create() })
.catch(() => { return edges.drop()}).then(() => {return edges.create() })
.then(() => { return users.create() })
.catch(() => { return users.drop()}).then(() => {return users.create() })
.then(() => { return authorizations.create() })
.catch(() => { return authorizations.drop()}).then(() => {return authorizations.create() })
*/

.then(() => { console.log('Adding users from passwords.csv...'); return addUsers() })
.then((fpvUsers) => { return coeLib.populateCollection(users, fpvUsers, ['email']) })
.then(() => { console.log('Creating SMAS shares from purdue oracledb connection...'); return oracledb.getConnection(smasConnectionConfig) })
.then((conn) => {
  console.log('Connection was successful!');  return conn.execute(
    `SELECT SHARE_INTERNAL_NOTE,TOTAL_AREA,BUILDING_ABBREVIATION,ROOM_ID,ROOM_NUMBER,SHARE_NUMBER,SHARE_ID,SHARE_PERCENT,SHARE_AREA,STATIONS,DESCRIPTION,ROOM_CLASSIFICATION,ASSIGNED_DEPT_ABBREVIATION,USING_DEPT_ABBREVIATION from OSIRIS.ROOM_CURRENT WHERE BUILDING_ABBREVIATION IN ('ARMS', 'GRIS', 'HAMP', 'ME', 'MSEE', 'WANG', 'EE')`
  );
}).then((result) => { smasData = result.rows; return; })
.then(() => { console.log('Creating SMAS share nodes...'); return coeLib.getSmasRoomsShares(smasData)})
.then((smasRoomsShares) => {
  shares = smasRoomsShares.shares;
  let rooms = smasRoomsShares.rooms;
  let departments = [];
  Object.keys(shares).forEach((key) => {
    let share = shares[key] 
    if (departments.indexOf(share.using) === -1) departments.push(share.using)
    if (departments.indexOf(share.assigned) === -1) departments.push(share.assigned)
  })
  fs.writeFileSync('departments.json', JSON.stringify(departments), 'utf8')
  return Promise.join([
    coeLib.populateCollection(nodes, rooms, ['building', 'room', 'name']),
    coeLib.populateCollection(nodes, shares, ['name', 'using'])
  ])
})
.then(() => { console.log('Creating people from SMAS data...'); return coeLib.getSmasPeople(shares)})
.then((smasPersons) => { return coeLib.populateCollection(nodes, smasPersons, ['name'])})
.then(() => { console.log('Creating people from keys data...'); return coeLib.getKeysDataPeople(keysData)})
.then((keysPersons) => { return coeLib.populateCollection(nodes, keysPersons, ['given_name', 'family_name'])})
.then((keysDataPeopleMetadata) => { console.log('Finding edges from supervisors to subordinate people...'); return coeLib.findSupervisorEdges(nodes, edges, keysData, keysDataPeopleMetadata)})
.then(() => { console.log('Generating edges from keyholders to rooms...'); return coeLib.findKeysDataRoomPersonEdges(nodes, edges, keysData)})
.then(() => { console.log('Generating edges from rooms to shares...'); return coeLib.findSmasRoomShareEdges(nodes, edges, smasData)})
.then(() => { console.log('Generating edges from shares to people...'); return coeLib.findSmasSharePersonEdges(nodes, edges, shares)})
.then(() => { console.log('Creating building/floorplan nodes from SVG files...'); return addBuildingsFloorplans(nodes, edges)})
.then(() => { console.log('Generating edges from rooms to floorplans...'); return coeLib.findFloorplanRoomEdges(nodes, edges, smasData)})
.catch((err) => { console.log(err)})
//Create fulltext indexes
.then(() => { console.log('creating fulltext index...'); return nodes.createFulltextIndex('fulltext')})
.catch((err)=>{console.log('errored')})
