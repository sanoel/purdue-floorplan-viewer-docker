'use strict'
const smasRoomTypesWithPeople = ['MEDIA PROD', 'NONCLAS LAB', 'OFFICE'];
let _ = require('lodash')
let fs = require("fs");
let Promise = require('bluebird').Promise;

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
let searchablePeopleAttributes = ['name', 'id', 'department', 'status']

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
let searchableRoomAttributes = ['building', 'room', 'name']

/* ////// Floorplan Object Example ////////////////
{
  _id: 'floorplan/94305',
  name: 'EE 1'
  building: 'EE',
  floor: '1',
  filename: 'EE_1.svg',
  _type: 'floorplan'
*/
let searchableFloorplanAttributes = ['building', 'floor', 'name']

function populateCollection(collection, data, exampleKeys) {
  return Promise.each(Object.keys(data), (obj) => {
    let example = {}
    exampleKeys.forEach((key)=>{
      example[key] = data[obj][key];
    })
    return collection.byExample(example).then(function(cursor) {
      if (cursor.count === 0 ) {
        return collection.save(data[obj]);
      } else if (cursor.count === 1) {
        console.log('cursor found!', cursor._result[0])
        return collection.update(cursor._result[0]._id, data[obj]);
      } else {
        console.log('several found!')
        return null
      }
    })
  })
}

///////// Handle SMAS Data /////////////
//Each row corresponds to a room share: 1 share, 1 row; 2 shares for one room, 2 rows in the file.
function getSmasRoomsShares(data) {
  let rooms = {};
  let shares = {};
  return Promise.each(data, function(row, i) {
    let roomname;
		let isLetter = /[a-z]/i.test(row['Room'].charAt(row['Room'].length-1));
		// Handle ground floor's ambiguous room numbering
		if (row['Room'].length === 1) {
	    roomname = '00'+row['Room'];
		}	else if (row['Room'].length === 2) {
	    roomname = isLetter ? '00'+row['Room'] : '0'+row['Room'];
		}	else if (row['Room'].length === 3) {
	    roomname = isLetter ? '0'+row['Room'] : row['Room'];
		}
		let name = row['Bldg']+' '+roomname;
    rooms[name] = rooms[name] || {
      building: row['Bldg'],
      room: roomname,
      floor: roomname.charAt(0) === '0' ? 'G' : roomname.charAt(0),
      name: name,
      area: '0',
      createdDate: row['date'] || Date.now(),
      _type: 'room',
      smas: {},
    }
    rooms[name].area = (parseInt(rooms[name].area) + parseInt(row['Area'])).toString()
    let share = name + '-'+row['Share Number']
    shares[share] = {
			createdDate: Date.now(),
      share: row['Share Number'],
      building: rooms[name].building,
      floor: rooms[name].floor,
      room: roomname,
      name: share,
      assigned: row['Department Assigned'],
      using: row['Department Using'],
      stations: row['Sta'],
      area: row['Area'],
      percent: row['%'],
      type: row['Room Type'],
      _type: 'share',
    }
    if (row['Description'].indexOf('On Loan') !== -1) {
      shares[share].description = row['Internal Note']
      shares[share].loans = row['Description']
//      shares[share].note = ''.split(';');
      shares[share].note = '';
    } else {
      shares[share].description = row['Description']
      shares[share].note = row['Internal Note']
//      shares[share].note = row['Internal Note'].split(';')
    }
    rooms[name].fulltext = createFullText(rooms[name], searchableRoomAttributes);
//    rooms[name].originalShares = shares
    rooms[name].smas[share] = shares[share];
    return rooms[name];
  }).then(() => {
    return {rooms, shares};
  })
}

function parsePersonsFromSmasDescription(description) {return description.split(/[+-]+/);}

function getSmasPeople(smasData, smasRoomTypesWithPeople) {
  let smasPersons = {}
  return Promise.each(smasData, function(row, i) {
    // People entries should only be found in specific types of rooms
    if (smasRoomTypesWithPeople.indexOf(row['Room Type']) !== -1) {
      let persons = parsePersonsFromSmasDescription(row['Description'])
      return Promise.each(persons, function(person) {
        let name = person.trim();
        smasPersons[name] = {
          name,
    //      dept: row['Department Using'],
					createdDate: Date.now(),
          _type: 'person',
        }
        smasPersons[name].fulltext = createFullText(smasPersons[name], searchablePeopleAttributes)
        return smasPersons[name];
      })
    } else return null;
  }).then(()=>{
    return smasPersons;
  })
}

// Create edges linking rooms to people based on the SMAS data
function findSmasRoomShareEdges(nodes, edges, smasData) {
  return Promise.each(smasData, function(row, i) {
    let smasRoom = { name: row['Bldg'] + ' ' + row['Room'] };
    let smasShare = { name: row['Bldg'] + ' ' + row['Room'] + '-'+row['Share Number'] };
    return nodes.byExample(smasRoom).then(function(roomCursor) {
      if (roomCursor.count === 0 ) {
        console.log('ROOM NOT FOUND:', smasRoom);
        return null;
      } else if (roomCursor.count > 1) {
        console.log('MULTIPLE ROOMS FOUND: ', roomCursor._result); 
        return null;
      } else {
        return nodes.byExample(smasShare).then(function(shareCursor) {
          if (shareCursor.count === 0 ) {
            console.log('SHARE NOT FOUND:', smasShare);
            return null;
          } else if (shareCursor.count > 1) {
            console.log('MULTIPLE PEOPLE FOUND: ', shareCursor._result); 
          return null;
          } else {
            let edge = {_from: roomCursor._result[0]._id, _to: shareCursor._result[0]._id, type: 'room-share'}
            return edges.byExample(edge).then(function(edgeCursor) {
              if (edgeCursor.count === 0 ) {
                return edges.save(edge)
              } else  {
                return null;
              }
            })
          }
        })
      }
    })
  })
}

// Create edges linking rooms to people based on the SMAS data
function findSmasSharePersonEdges(nodes, edges, smasData) {
  return Promise.each(smasData, function(row, i) {
    let smasShare = { name: row['Bldg'] + ' ' + row['Room'] + '-'+row['Share Number']};
    let smasPersons = parsePersonsFromSmasDescription(row['Description']);
    return Promise.each(smasPersons, function(person) {
      let smasPerson = { name: person.trim() }
      return nodes.byExample(smasShare).then(function(shareCursor) {
        if (shareCursor.count === 0 ) {
          console.log('SHARE NOT FOUND:', smasShare);
          return null;
        } else if (shareCursor.count > 1) {
          console.log('MULTIPLE SHARES FOUND: ', shareCursor._result); 
          return null;
        } else {
          return nodes.byExample(smasPerson).then(function(peopleCursor) {
            if (peopleCursor.count === 0 ) {
              return null;
            } else if (peopleCursor.count > 1) {
              console.log('MULTIPLE PEOPLE FOUND: ', peopleCursor._result); 
              return null;
            } else {
              let edge = {_from: shareCursor._result[0]._id, _to: peopleCursor._result[0]._id, type: 'share-person', }
              return edges.byExample(edge).then(function(edgeCursor) {
                if (edgeCursor.count === 0 ) {
                  return edges.save(edge)
                } else  {
                  return null;
                }
              })
            }
          })
        }
      })
    })
  })
}

// Use the keys data to find and add people to the database (each row has a keyholder and possibly their supervisor);
 function getKeysDataPeople(keysData) {
  let keysPeople = {}
  return Promise.each(keysData, function(row, i) {
//Parse out the keyholder as a person
    let keyholder = (row['FIRST'].trim() + ' ' + row['LAST NAME'].trim()).trim();
    keysPeople[keyholder] = keysPeople[keyholder] || {
      name: keyholder, 
      keys: [],
      puid: row['PUID'],
      status: row['STATUS'],
      department: row['DEPARTMENT'],
      _type: 'person',
    }
    keysPeople[keyholder].keys.push(row['KEY NUMBER']);
    keysPeople[keyholder].fulltext = createFullText(keysPeople[keyholder], searchablePeopleAttributes);

//Parse out the supervisor as a person
    if (row['SUPERVISOR'] && (row['SUPERVISOR'].trim().length > 0)) {
      let supervisor = row['SUPERVISOR'].trim();
      let name = supervisor[0] + supervisor.substring(1, supervisor.length).toLowerCase();
      keysPeople[name] = {
        name: name,
        _type: 'person',
      }
      keysPeople[name].fulltext = createFullText(keysPeople[name], searchablePeopleAttributes);
    }
    return null
  }).then(()=>{
    return keysPeople
  })
}
// Find Room->Person in the keys data
// This will only add edges for those rooms that are already in the database. No new rooms were 
//introduced from the keysData due to presence of non-room values in the ROOM column (due to 
// master keys, etc); 
function findKeysDataRoomPersonEdges(nodes, edges, keysData) {
  return Promise.each(keysData, function(row, i) {
    let room = { name: row['BUILDING'] + ' ' + row['ROOM NUMBER'] }
    let keyholder = { name: row['FIRST'] + ' ' + row['LAST NAME'] }
    return nodes.byExample(room).then(function(roomCursor) {
      if (roomCursor.count === 0 ) {
// Not finding rooms in the keys dataset is likely okay. The ROOM column may contain
// some values that aren't strictly room numbers (e.g., master or building keys). These should
// be the only ones that are caught in this part of the logic.
//          console.log('ROOM NOT FOUND:', room.name);
        return null;
      } else if (roomCursor.count > 1) {
        console.log('MULTIPLE ROOMS FOUND: ', roomCursor._result); 
        return null;
      } else {
        return nodes.byExample(keyholder).then(function(keyholderCursor) {
          if (keyholderCursor.count === 0) {
            console.log('KEYHOLDER NOT FOUND:', keyholder.name);
            return null;
          } else if (keyholderCursor.count > 1) {
            console.log('MULTIPLE PEOPLE FOUND FOR KEYHOLDER: ', keyholderCursor._result); 
            return null;
          } else {
//              console.log('LINKED ROOM', room.name, ' TO PERSON ', keyholder.name); 
            let edge = {_from: roomCursor._result[0]._id, _to: keyholderCursor._result[0]._id, type: 'share-person-keyholder'}
            return edges.save(edge)
          }
        }).then(function() {
          if (row['SUPERVISOR'] && (row['SUPERVISOR'].trim().length > 0)) {
            let supervisor = row['SUPERVISOR'].trim();
            supervisor = { name: supervisor[0] + supervisor.substring(1, supervisor.length).toLowerCase() }
            return nodes.byExample(supervisor).then(function(supervisorCursor) {
              if (supervisorCursor.count === 0) {
                console.log('SUPERVISOR NOT FOUND:', supervisor.name);
                return null;
              } else if (supervisorCursor.count > 1) {
                console.log('MULTIPLE PEOPLE FOUND FOR SUPERVISOR: ', supervisorCursor._result); 
                return null;
              } else {
//                  console.log('LINKED ROOM', room.name, ' TO PERSON ', supervisor.name); 
                let edge = {_from: roomCursor._result[0]._id, _to: supervisorCursor._result[0]._id, type: 'share-person-supervisor'}
                return edges.save(edge)
              }
            })
          }
        })
      }
    }) 
  })
}

function findFloorplanRoomEdges(nodes, edges, smasData) {
  return Promise.each(smasData, function(row, i) {
    let smasRoom = { name: row['Bldg'] + ' ' + row['Room'], _type: 'room' };
    let smasFloorplan = { name: row['Bldg'] + ' ' + row['Room'].charAt(0), _type: 'floorplan' };
    return nodes.byExample(smasRoom).then(function(roomCursor) {
      if (roomCursor.count === 0 ) {
        console.log('ROOM NOT FOUND:', smasRoom);
        return null;
      } else if (roomCursor.count > 1) {
        console.log('MULTIPLE ROOMS FOUND: ', roomCursor._result);
        return null;
      } else {
        return nodes.byExample(smasFloorplan).then(function(floorplanCursor) {
          if (floorplanCursor.count === 0 ) {
            return null;
          } else if (floorplanCursor.count > 1) {
            console.log('MULTIPLE FLOORPLANS FOUND: ', floorplanCursor._result);
            return null;
          } else {
            let edge = {_from: floorplanCursor._result[0]._id, _to: roomCursor._result[0]._id, type: 'floorplan-room'}
            return edges.byExample(edge).then(function(edgeCursor) {
              if (edgeCursor.count === 0 ) {
//                console.log('LINKED ROOM', smasRoom.name, ' TO PERSON ', sma
                return edges.save(edge)
              } else {
                // This scenario occurs because rooms with multiple shares get multiple row entries.
//                console.log('EDGE ALREADY FOUND: ', smasFloorplan.name, smasRoom.name)
                return null;
              }
            })
          }
        })
      }
    })
  })
}

// Only the keys data contains person -> person relationships (supervisor -> keyholder)
function findSupervisorEdges(nodes, edges, keysData) {
  return Promise.each(keysData, function(row, i) {
    let keyholder = { name: row['FIRST'] + ' ' + row['LAST NAME'] }
    if (row['SUPERVISOR'] && (row['SUPERVISOR'].trim().length > 0)) {
      let supervisor = row['SUPERVISOR'].trim();
      supervisor = { name: supervisor[0] + supervisor.substring(1, supervisor.length).toLowerCase() }
      return nodes.byExample(keyholder).then(function(keyholderCursor) {
        if (keyholderCursor.count === 0 ) {
          console.log('KEYHOLDER NOT FOUND:', keyholder);
          return null;
        } else if (keyholderCursor.count > 1) {
          console.log('MULTIPLE PEOPLE FOUND FOR KEYHOLDER: ', keyholderCursor._result); 
          return null;
        } else {
          return nodes.byExample(supervisor).then(function(supervisorCursor) {
            if (supervisorCursor.count === 0) {
              console.log('SUPERVISOR NOT FOUND:', supervisor);
              return null;
            } else if (supervisorCursor.count > 1) {
              console.log('MULTIPLE PEOPLE FOUND FOR SUPERVISOR: ', supervisorCursor._result); 
              return null;
            } else {
//              console.log('LINKED SUPERVISOR', supervisor.name, ' TO PERSON ', keyholder.name); 
              let edge = {_from: supervisorCursor._result[0]._id, _to: keyholderCursor._result[0]._id, type: 'supervisor'}
              return edges.save(edge)
            }
          })
        }
      })
    } else return null;
  })
}

// Create a fulltext searchable string of an row, given an array of keys to use
// Currently a dumb operation where row[key] should be of type string 
function createFullText(row, keys) {
  let fulltext = '';
  keys.forEach(function(key) {
    if (row[key]) fulltext += (' ' + row[key]);
  })
  return fulltext;
}

module.exports = {
  getSmasRoomsShares,
  getSmasPeople,
  getKeysDataPeople,
  populateCollection,
  createFullText,
  findSupervisorEdges,
  findFloorplanRoomEdges,
  findKeysDataRoomPersonEdges,
  findSmasRoomShareEdges,
  findSmasSharePersonEdges,
  parsePersonsFromSmasDescription,
  searchableFloorplanAttributes,
  searchableRoomAttributes,
  searchablePeopleAttributes,
  smasRoomTypesWithPeople,
}
