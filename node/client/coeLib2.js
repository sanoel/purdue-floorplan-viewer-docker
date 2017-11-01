'use strict'
const smasRoomTypesWithPeople = ['MEDIA PROD', 'NONCLAS LAB', 'OFFICE'];
let _ = require('lodash')
let fs = require("fs");
let Promise = require('bluebird');

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


// This function looks up any existing items in the given collection. The 
// lookup is performed by example with the given example keys. If a match 
// is found, it is updated, otherwise it is saved as a new entry. 
function populateCollection(collection, data, exampleKeys) {
  return Promise.each(Object.keys(data), (key) => {
    let example = {}
    exampleKeys.forEach((k)=>{
      example[k] = data[key][k];
    })
    return Promise.resolve(collection.byExample(example)).call('next').then((node) => {
      if (!node) return collection.save(data[key]);
      console.log('node already exists. Updating', example,' with', node);
      return collection.update(cursor._result[0]._id, data[key]);
    })
  }).catch((err) => { console.log(err) })
}

///////// Handle SMAS Data /////////////
//Each row corresponds to a room share: 1 share, 1 row; 2 shares for one room, 2 rows in the file.
function getSmasRoomsShares(data) {
  let rooms = {};
  let shares = {};
  return Promise.map(data, function(row, i) {
/*
		let isLetter = /[a-z]/i.test(row['Room'].charAt(row['Room'].length-1));
		// Handle ground floor's ambiguous room numbering
		if (row['Room'].length === 1) {
	    roomname = '00'+row['Room'];
		}	else if (row['Room'].length === 2) {
	    roomname = isLetter ? '00'+row['Room'] : '0'+row['Room'];
		}	else if (row['Room'].length === 3) {
	    roomname = isLetter ? '0'+row['Room'] : row['Room'];
		}
*/
		let name = row['BUILDING_ABBREVIATION']+' '+row['ROOM_NUMBER'];
    rooms[name] = rooms[name] || {
			roomid: String(row['ROOM_ID']),
      building: row['BUILDING_ABBREVIATION'],
      room: row['ROOM_NUMBER'],
      floor: row['ROOM_NUMBER'].charAt(0) === '0' ? 'G' : row['ROOM_NUMBER'].charAt(0),//row['FLOOR_CODE'],
      name: name,
      area: row['TOTAL_AREA'].toString(),
      createdDate: row['date'] || Date.now(),
      _type: 'room',
      smas: {},
    }
    let share = String(row['SHARE_ID']);
    shares[share] = {
			share: String(row['SHARE_ID']),
			createdDate: Date.now(),
//      share: String(row['SHARE_NUMBER']),
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
			description: row['DESCRIPTION'],
      _type: 'share',
    }
    if (!row.DESCRIPTION) {
			shares[share]['DESCRIPTION'] = '';
		} else if (row.DESCRIPTION.indexOf('On Loan') > -1) {
      shares[share].description = '';// row['Internal Note']
      shares[share].loans = row['DESCRIPTION']
      shares[share].note = '';
    } 
		if (!shares[share].DESCRIPTION) {
      shares[share].description = '';
      shares[share].note = ''; //row['Internal Note']
    }
    rooms[name].fulltext = createFullText(rooms[name], searchableRoomAttributes);
    rooms[name].smas[share] = shares[share];
    return rooms[name];
  }).then(() => {
    return {rooms, shares};
  })
}

function parsePersonsFromSmasDescription(description) {return description.split(/[+-]+/);}

function getSmasPeople(smasShares, smasRoomTypesWithPeople) {
  let smasPersons = {}
  return Promise.map(Object.keys(smasShares), function(key) {
// People entries should only be found in specific types of rooms
    if (smasRoomTypesWithPeople.indexOf(smasShares[key].type) > -1) {
      let persons = parsePersonsFromSmasDescription(smasShares[key].description)
      return Promise.map(persons, function(person) {
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
  return Promise.map(smasData, (row, i) => {
    let smasRoom = { name: row['BUILDING_ABBREVIATION'] + ' ' + row['ROOM_NUMBER'] };
    let smasShare = { share: String(row['SHARE_ID']) };
    return Promise.resolve(nodes.byExample(smasRoom)).call('next').then((room) => {
      return Promise.resolve(nodes.byExample(smasShare)).call('next').then((share) => {
				if (share) {
		      let edge = {_from: room._id, _to: share._id, type: 'room-share'}
  	      return Promise.resolve(edges.byExample(edge)).call('next').then((ed) => {
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
function findSmasSharePersonEdges(nodes, edges, smasData) {
  return Promise.each(smasData, function(row, i) {
    let smasShare = { share: String(row['SHARE_ID'])};
    return Promise.resolve(nodes.byExample(smasShare)).call('next').then((share) => {
// use the actual share entry's description, not just row.DESCRIPTION
  	 	let smasPersons = parsePersonsFromSmasDescription(share.description);
   		return Promise.each(smasPersons, (person) => {
     		let smasPerson = { name: person.trim() }
     		return Promise.resolve(nodes.byExample(smasPerson)).call('next').then((person) => {
       	 	let edge = {_from: share._id, _to: person._id, type: 'share-person' }
       	 	return Promise.resolve(edges.byExample(edge)).call('next').then((ed) => {
						if (!ed) {
						 	return edges.save(edge)
						} else return null;
          })
        })
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
/*
function findKeysDataRoomPersonEdges(nodes, edges, keysData) {
  return Promise.each(keysData, function(row, i) {
    let room = { name: row['BUILDING'] + ' ' + row['ROOM NUMBER'] }
    let keyholder = { name: row['FIRST'] + ' ' + row['LAST NAME'] }
    return Promise.resolve(nodes.byExample(room)).call('next').then(function(room) {
      return Promise.resolve(nodes.byExample(keyholder)).then(function(keyholder) {
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
*/

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
//  findKeysDataRoomPersonEdges,
  findSmasRoomShareEdges,
  findSmasSharePersonEdges,
  parsePersonsFromSmasDescription,
  searchableFloorplanAttributes,
  searchableRoomAttributes,
  searchablePeopleAttributes,
  smasRoomTypesWithPeople,
}
