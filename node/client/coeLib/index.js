'use strict'
var _ = require('lodash')
var Promise = require('bluebird');
const smasRoomTypesWithPeople = ['MEDIA PROD', 'NONCLAS LAB', 'OFFICE'];

// The query used to get all of the SMAS data from SMAS SQL database.
//var oracleQuery = `SELECT SHARE_INTERNAL_NOTE,TOTAL_AREA,BUILDING_ABBREVIATION,ROOM_ID,ROOM_NUMBER,SHARE_NUMBER,SHARE_ID,SHARE_PERCENT,SHARE_AREA,STATIONS,DESCRIPTION,ROOM_CLASSIFICATION,ASSIGNED_DEPT_ABBREVIATION,USING_DEPT_ABBREVIATION from OSIRIS.ROOM_CURRENT WHERE BUILDING_ABBREVIATION IN ('ARMS', 'GRIS', 'HAMP', 'ME', 'MSEE', 'WANG', 'EE')`;

/* ////// Person Object Example ////////////////
{
  _id: 'people/54083', 
  name: 'Jim Krogmeier' // or 'Krogmeier', 'J. Krogmeier', Currently duplicates are created for each variant
  department: 'ECE'
  keys: ['134t55'],
  status: 'F', //F for Faculty
  puid: '00000-00000',
  _type: 'person',
}
*/
var searchablePeopleAttributes = ['name', 'id', 'department', 'status']

/* ////// Room Object Example ////////////////
{
  _id: 'room/12847',
  name: 'EE 135',
  building: 'EE',
  room: '135',
  floor: '1',
  area: '430',
  share: '0',
  note: '',
  type: 'OFFICE',
  percent: '100',
  assigned: 'Elec&CptEngr',
  using: 'Elec&CptEngr',
  stations: '3',
  description: 'ECE Graduate Office-M. Golden + L. Siefers + D. ',
  date: '2017-02-07T12:33:34.000Z',
  _type: 'room',
}
*/
var searchableRoomAttributes = ['building', 'room', 'name']

/* ////// Floorplan Object Example ////////////////
{
  _id: 'floorplan/94305',
  name: 'EE 1'
  building: 'EE',
  floor: '1',
  filename: 'EE_1.svg',
  _type: 'floorplan'
*/
var searchableFloorplanAttributes = ['building', 'floor', 'name']

// If the example person has a defined first name and only one "longer" match
// beginning with that letter, use it to update it.
function handleMultiplePersonMatches(example, matches) {
  if (!example.given_name) return;
  var update = example;
  var temp = true;
  var give;
  matches.forEach(function(match, i)  {
    if (match.given_name) {
      if (match.given_name.indexOf(update.given_name)) {
        give = match.given_name.length > update.given_name.length ? match.given_name : update.given_name;
        update = match;
        update.given_name = give;
      }
    }
  })
  return update;
}

function handleUpdatePersonMatches(example, match) {
  if (example.given_name) {
    if (!match.given_name) {
      var update = match;
      update.given_name = example.given_name;
      return example
    }
    if (example.given_name.length > match.given_name.length && example.given_name.indexOf(match.given_name)) {
      var update = match;
      update.given_name = example.given_name;
      return update
    }
  }
  return match
}


// This function looks up any existing items in the given collection. The 
// lookup is performed by example with the given example keys. If a match 
// is found, it is updated, otherwise it is saved as a new entry. 
function populateCollection(collection, data, exampleKeys) {
  var metadata = {}
  return Promise.each(Object.keys(data), function(key)  {
    console.log('~~~', data[key])
    var example = {}
    exampleKeys.forEach(function(k){
      example[k] = data[key][k];
    })
    example._type = data[key]._type;
    return Promise.resolve(collection.byExample(example)).call('all').then(function(matches)  {
      if (matches.length === 0) {
        return collection.save(data[key]).then(function(res)  {
          return metadata[key] = res;
        })
      }
// If a single match is found, update it; apply extra handling for person matches
      if (matches.length === 1) {
        var update = data[key];
        if (example._type === 'person') update = handleUpdatePersonMatches(example, matches[0]);
//        console.log('node already exists. Updating', example,' with', update);
        return collection.update(matches[0]._id, update).then(function(res)  {
          return metadata[key] = res;
        });
      }
// Do not attempt to update when multiple matching nodes are found, except make an attempt for persons (disabled at the moment);
      if (matches.length > 1) {
/*
        if (example._type === 'person') {
          var update = handleMultiplePersonMatches(example, matches);
          if (update) {
            console.log('multiple matches found for example. updating: ', example, 'with', update, matches)
            return collection.update(update._id, update);
          }
        }
*/
        console.log('multiple matches found for example. Creating a unique node: ', example, matches)
        return collection.save(data[key]).then(function(res)  {
          return metadata[key] = res
        })
      }
    })
  }).catch(function(err)  { console.log(err)
  }).then(function(result)  {
    return metadata
  })
}

///////// Handle SMAS Data /////////////
//Each row corresponds to a room share: 1 share, 1 row; 2 shares for one room, 2 rows in the file.
function getSmasRoomsShares(data) {
  var rooms = {};
  var shares = {};
  return Promise.map(data, function(row, i) {
/*
    var isLetter = /[a-z]/i.test(row['Room'].charAt(row['Room'].length-1));
    // Handle ground floor's ambiguous room numbering
    if (row['Room'].length === 1) {
      roomname = '00'+row['Room'];
    }  else if (row['Room'].length === 2) {
      roomname = isLetter ? '00'+row['Room'] : '0'+row['Room'];
    }  else if (row['Room'].length === 3) {
      roomname = isLetter ? '0'+row['Room'] : row['Room'];
    }
*/
    var name = String(row['BUILDING_ABBREVIATION'].trim()+' '+row['ROOM_NUMBER']);
    rooms[name] = rooms[name] || {
      roomid: String(row['ROOM_ID']),
      building: row['BUILDING_ABBREVIATION'],
      room: row['ROOM_NUMBER'],
      floor: row['ROOM_NUMBER'].charAt(0) === '0' ? 'G' : row['ROOM_NUMBER'].charAt(0),//row['FLOOR_CODE'],
      name: name,
      area: row['TOTAL_AREA'].toString(),
      _createdDate: row['date'] || Date.now(),
      _type: 'room',
      smas: {},
    }
    var share = String(row['SHARE_ID']);
    shares[share] = {
      share: share,
      _createdDate: Date.now(),
      building: rooms[name].building,
      floor: rooms[name].floor,
      room: row['ROOM_NUMBER'],
      name: name + '-'+share,
      assigned: row['ASSIGNED_DEPT_ABBREVIATION'],
      using: row['USING_DEPT_ABBREVIATION'],
      stations: !row['STATIONS'] ? '0' : String(row['STATIONS']),
      area: String(row['SHARE_AREA']),
      percent: String(row['SHARE_PERCENT']),
      type: row['ROOM_CLASSIFICATION'],
      description: row['DESCRIPTION'] || '',
      note: row['SHARE_INTERNAL_NOTE'] || '',
      _type: 'share',
    }
    if (shares[share].description.indexOf('On Loan') > -1) {
      shares[share].loans = shares[share].description; 
      shares[share].description = shares[share].note;
      shares[share].note = '';
    } 
    if (smasRoomTypesWithPeople.indexOf(shares[share].type) > -1) {
      var persons = parsePersonsFromSmasDescription(shares[share].description)
      shares[share].description = persons.map(function(name) { return name.trim()}).sort().join(';')
    }
    rooms[name].fulltext = createFullText(rooms[name], searchableRoomAttributes);
    rooms[name].smas[share] = shares[share];
    return rooms[name];
  }).then(function()  {
    return {rooms: rooms, shares: shares};
  }).catch(function(err)  {
    console.log(err);
    return err;
  })
}

function parsePersonsFromSmasDescription(text) {return text.split(/[+-]+/);}
//function parsePersonsFromSmasDescription(text) {return text.split(';');}

function getSmasPeople(smasShares) {
  var smasPersons = {}
  return Promise.each(Object.keys(smasShares), function(key)  {
// People entries should only be found in specific types of rooms
    if (smasRoomTypesWithPeople.indexOf(smasShares[key].type) > -1) {
      var persons = smasShares[key].description.split(';');
      return Promise.map(persons, function(person)  {
        var name = person.trim();
        if (name.split(' ').length > 2) return;
        smasPersons[name] = {
          name: name,
    //      dept: row['Department Using'],
          _createdDate: Date.now(),
          _type: 'person',
        }
        if (name.split(' ')[1]){
          smasPersons[name].family_name = name.split(' ')[1].trim();
          smasPersons[name].given_name = name.split(' ')[0].trim().replace('.', '');
        }
        smasPersons[name].fulltext = createFullText(smasPersons[name], searchablePeopleAttributes)
        return smasPersons[name];
      })
    } else return null;
  }).then(function(){
    return smasPersons;
  })
}

// Create edges linking rooms to people based on the SMAS data
function findSmasRoomShareEdges(nodes, edges, smasData) {
  return Promise.each(smasData, function(row)  {
    var smasRoom = { 
      name: row['BUILDING_ABBREVIATION'] + ' ' + row['ROOM_NUMBER'],
      roomid: String(row['ROOM_ID']),
    };
    var smasShare = { share: String(row['SHARE_ID']) };
    return Promise.resolve(nodes.byExample(smasRoom)).call('next').then(function(room)  {
      return Promise.resolve(nodes.byExample(smasShare)).call('next').then(function(share)  {
        if (share) {
          if (!room) console.log('ROOM NOT FOUND', smasRoom)
          var edge = {_from: room._id, _to: share._id, _type: 'room-share'}
          return Promise.resolve(edges.byExample(edge)).call('next').then(function(ed)  {
            if (!ed) {
               return edges.save(edge)
            } else return null;
            })
        } else return null;
      })
    })
  })
}

// Create edges linking rooms to people based on the SMAS data
function findSmasSharePersonEdges(nodes, edges, smasShares) {
  return Promise.each(Object.keys(smasShares), function(key)  {
    var smasShare = { share: key };
    return Promise.resolve(nodes.byExample(smasShare)).call('next').then(function(share)  {
      if (smasRoomTypesWithPeople.indexOf(share.type) <= -1) return;
       var smasPersons = share.description.split(';');
       return Promise.each(smasPersons, function(name)  {
         if (name === '') return;
         if (name.split(' ').length > 2) return;
         var smasPerson = { name: name.trim() }
         return Promise.resolve(nodes.byExample(smasPerson)).call('next').then(function(person)  {
           if (!share) console.log('SHARE DOESNT EXIST', smasShare)
           if (!person) {
             console.log('PERSON DOESNT EXIST', smasPerson, share)
           }
           var edge = {_from: share._id, _to: person._id, _type: 'share-person' }
           return Promise.resolve(edges.byExample(edge)).call('next').then(function(ed)  {
             if (!ed) {
               return edges.save(edge)
             }
             return;
          })
        })
      })
    })
  })
}

// Use the keys data to find and add people to the database (each row has a keyholder and possibly their supervisor);
 function getKeysDataPeople(keysData) {
  var keysPeople = {}
  return Promise.map(keysData, function(row, i) {
//Parse out the keyholder as a person
    var keyholder = (row['FIRST'].trim() + ' ' + row['LAST NAME'].trim()).trim();
    keysPeople[keyholder] = keysPeople[keyholder] || {
      name: keyholder, 
      given_name: row['FIRST'].trim().replace('.', ''),
      family_name: row['LAST NAME'].trim(),
      keys: {},
      puid: row['PUID'],
      status: row['STATUS'],
      department: row['DEPARTMENT'],
      _type: 'person',
    }
		keysPeople[keyholder].keys[row['KEY NUMBER']] = {
			identifier: row['KEY IDENTIFIER'] || '',
			buildings: row['BUILDING'],
			room: row['ROOM NUMBER'],
			number: row['KEY NUMBER'],
			date: row['DATE'],
		};
    console.log(keysPeople[keyholder])
    keysPeople[keyholder].fulltext = createFullText(keysPeople[keyholder], searchablePeopleAttributes);

//Parse out the supervisor as a person
    if (row['SUPERVISOR'] && (row['SUPERVISOR'].trim().length > 0)) {
      var supervisor = row['SUPERVISOR'].trim();
      var name = supervisor[0] + supervisor.substring(1, supervisor.length).toLowerCase();
      keysPeople[name] = {
        name: name,
        family_name: name,
        department: row['DEPARTMENT'],
        _type: 'person',
      }
      keysPeople[name].fulltext = createFullText(keysPeople[name], searchablePeopleAttributes);
    }
    return null
  }).then(function(){
    return keysPeople
  })
}
// Find Room->Person in the keys data
// This will only add edges for those rooms that are already in the database. No new rooms were 
//introduced from the keysData due to presence of non-room values in the ROOM column (due to 
// master keys, etc); 
function findKeysDataRoomPersonEdges(nodes, edges, keysData) {
  return Promise.each(keysData, function(row, i) {
    var room = { name: row['BUILDING'] + ' ' + row['ROOM NUMBER'] }
    var keyholder = { name: row['FIRST'] + ' ' + row['LAST NAME'] }
    return Promise.resolve(nodes.byExample(room)).call('next').then(function(room)  {
      return Promise.resolve(nodes.byExample(keyholder)).call('next').then(function(keyholder)  {
        if (room && keyholder) {
          var edge = {_from: room._id, _to: keyholder._id, _type: 'share-person-keyholder'}
          return Promise.resolve(edges.byExample(edge)).call('next').then(function(ed)  {
            if (!ed) return edges.save(edge)
            return;
          })
        } else return;
      }).then(function()  {
        if (row['SUPERVISOR'] && (row['SUPERVISOR'].trim().length > 0)) {
          var supervisor = row['SUPERVISOR'].trim();
          supervisor = { name: supervisor[0] + supervisor.substring(1, supervisor.length).toLowerCase() }
          return Promise.resolve(nodes.byExample(supervisor)).call('next').then(function(supervisor)  {
            if (room && supervisor) {
              var edge = {_from: room._id, _to: supervisor._id, _type: 'share-person-supervisor'}
              return Promise.resolve(edges.byExample(edge)).call('next').then(function(ed)  {
                if (!ed) return edges.save(edge);
                return;
              })
            } else return;
          })
        }
      })
    }) 
  })
}

function findFloorplanRoomEdges(nodes, edges, smasData) {
  return Promise.each(smasData, function(row, i) {
    var smasRoom = { name: String(row['BUILDING_ABBREVIATION'].trim()+' '+row['ROOM_NUMBER']), _type: 'room' };
    var floorCode = row['ROOM_NUMBER'].charAt(0) === '0' ? 'G' : row.ROOM_NUMBER.charAt(0);
    var smasFloorplan = { name: row['BUILDING_ABBREVIATION'].trim()+' '+floorCode, _type: 'floorplan' };
    return Promise.resolve(nodes.byExample(smasRoom)).call('next').then(function(room)  {
      return Promise.resolve(nodes.byExample(smasFloorplan)).call('next').then(function(floorplan)  {
        if (!room) console.log('ROOM NOT FOUND', smasRoom)
        if (!floorplan) console.log('FP NOT FOUND', smasFloorplan, row)
        if (room && floorplan) {
          var edge = {_from: floorplan._id, _to: room._id, _type: 'floorplan-room'}
          return Promise.resolve(edges.byExample(edge)).call('next').then(function(ed)  {
            if (!ed) return edges.save(edge)
            return null;
          })
        }
      })
    })
  })
}

// Only the keys data contains person -> person relationships (supervisor -> keyholder)
function findSupervisorEdges(nodes, edges, keysData, keysDataPeopleMetadata) {
  return Promise.each(keysData, function(row, i)  {
    var keyholder = (row['FIRST'].trim() + ' ' + row['LAST NAME'].trim()).trim();
    var supervisor = row['SUPERVISOR'].trim();
    var name = supervisor[0] + supervisor.substring(1, supervisor.length).toLowerCase();
    console.log(name, keyholder)
    if (!keysDataPeopleMetadata[name]) { 
      console.log(supervisor); 
      return; 
    }
    var edge = {_from: keysDataPeopleMetadata[name]._id, _to: keysDataPeopleMetadata[keyholder]._id, _type:'supervisor-keyholder'};
    return Promise.resolve(edges.byExample(edge)).call('all').then(function(edgeMatches)  {
      if (edgeMatches.length === 0 ) {
        return edges.save(edge);
      } else if (edgeMatches.length === 1) {
        console.log('EDGE ALREADY EXISTS:', edge, edgeMatches[0]); 
        return;
      } else if (edgeMatches.length > 1) {
        console.log('MULTIPLE MATCHING EDGES EXISTS!!!!!!!!!!!!!!!!!!!!!!!!!!:', edge, edgeMatches); 
        return;
      }
    })
  })
}

// Create a fulltext searchable string of an row, given an array of keys to use
// Currently a dumb operation where row[key] should be of type string 
function createFullText(row, keys) {
  var fulltext = '';
  keys.forEach(function(key) {
    if (row[key]) fulltext += (' ' + row[key]);
  })
  return fulltext;
}

module.exports = {
  getSmasRoomsShares: getSmasRoomsShares,
  getSmasPeople: getSmasPeople,
  getKeysDataPeople: getKeysDataPeople,
  populateCollection: populateCollection,
  createFullText: createFullText,
  findSupervisorEdges: findSupervisorEdges,
  findFloorplanRoomEdges: findFloorplanRoomEdges,
  findKeysDataRoomPersonEdges: findKeysDataRoomPersonEdges,
  findSmasRoomShareEdges: findSmasRoomShareEdges,
  findSmasSharePersonEdges: findSmasSharePersonEdges,
  parsePersonsFromSmasDescription: parsePersonsFromSmasDescription,
  searchableFloorplanAttributes: searchableFloorplanAttributes,
  searchableRoomAttributes: searchableRoomAttributes,
  searchablePeopleAttributes: searchablePeopleAttributes,
  smasRoomTypesWithPeople: smasRoomTypesWithPeople,
//	oracleQuery,
}
