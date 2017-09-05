import { set, copy } from 'cerebral/operators'
import Promise from 'bluebird'
import csvjson from 'csvjson'
import fd from 'react-file-download'
import coeLib  from '../../../../coeLib.js'

export var computeSmasDiffs = [
  set('state:app.generating_smas_report', true),
  parseSmasFile, {
    success: [
      forewardConvert, 
      getDbShares, 
      forewardConvertDiff, {
        success: [
          compareShares, {
            success: [
              set('state:app.generating_smas_report', false),
            ],
            error: [],
          },
        ],
        error: [],
      },
    ],
    error: [],
  },
]

function forewardConvert({input, state, output, services}) {
  let newShares = _.clone(input.data)
  return Promise.each(newShares, (row, i) => {
    if (row['Description'].indexOf('On Loan') !== -1) {
      newShares[i]['Description'] = row['Internal Note']
      newShares[i]['Internal Note'] = row['Description']
    }
    newShares[i]['Room Type'].trim()
    if (coeLib.smasRoomTypesWithPeople.indexOf(row['Room Type']) !== -1) {
      let persons = coeLib.parsePersonsFromSmasDescription(row['Description'])
      newShares[i].Description = persons.map(name => name.trim()).sort().join(';')
    }
    return false
  }).then(()=>{
    let options = {
      delimiter: ',',
      wrap: false,
    }
    fd(csvjson.toCSV(newShares, options), 'SMAS-forward-converted.csv')
  })
}

function forewardConvertDiff({input, state, output, services}) {
  let rooms = {}
  let newShares = _.clone(input.data)
  return Promise.each(newShares, (row, i) => {
    if (row['Description'].indexOf('On Loan') !== -1) {
      newShares[i]['Description'] = row['Internal Note']
      newShares[i]['Internal Note'] = row['Description']
    }
    newShares[i]['Room Type'].trim()
    if (coeLib.smasRoomTypesWithPeople.indexOf(row['Room Type']) !== -1) {
      let persons = coeLib.parsePersonsFromSmasDescription(row['Description'])
      newShares[i].Description = persons.map(name => name.trim()).sort().join(';')
    } 
    return false
  }).then(() => {
    return Promise.each(newShares, (row, i) => {
      let name = row['Bldg']+' '+row['Room'];
      rooms[name] = rooms[name] || [];
      return rooms[name].push(row)
    }).then(() => {
      return output.success({rooms});
    })
  })
}
forewardConvertDiff.async = true;
forewardConvertDiff.outputs = ['success', 'error']

function getDbShares({input, state, output, services}) {
  let shares = []
  // Loop through generate the rooms and shares to be compared
  // This assumes that shares are numbered consistently
  return Promise.each(input.data, (row) => {
    let name = row['Bldg']+' '+row['Room'];
    if (parseInt(row['Share Number']) > 0) return false
    return services.http.get('/nodes?name='+name+'&type=room').then((response) => {
      if (response.result.length > 0) {
        // Loop through shares, create CSV row, and push them onto our array of rows.
        return services.http.get('/edges?from='+response.result[0]._id+'&type=share').then((result) => {
          let roomShares = []
          return Promise.map(result.result, (share) => {
            let dbShare = {
              'Bldg': share.building,
              'Room': share.room.split(' ')[1],
              'Share Number': share.share || share.name.split('-')[1].trim(),
              '%':share.percent,
              'Area': share.area,
              'Department Using': share.using,
              'Department Assigned':share.assigned,
              'Sta': share.stations,
              'Room Type': share.type,
            }
            // Get associated people from the db, concatenate them in alphabetical order into the Description column
            if (coeLib.smasRoomTypesWithPeople.indexOf(dbShare['Room Type']) !== -1) {
              return services.http.get('/edges?from='+share._id+'&type=person').then((res) => { 
                return Promise.map(res.result, person => person.name).then(x => x.sort().join(';'))
                }).then((desc) => {
                  dbShare.Description = desc;
                  dbShare['Internal Note'] = share.note;
                  if (dbShare['Description'].indexOf(',') > -1) {
                    dbShare['Description'] = `"${dbShare['Description']}"`
                    console.log('111111111', dbShare['Description'])
                  }
                  roomShares.push(dbShare)
                  return 
                })
            } else { 
              dbShare['Description'] = share.description;
              dbShare['Internal Note'] = share.note;
              if (dbShare['Description'].indexOf(',') > -1) {
                dbShare['Description'] = `"${dbShare['Description']}"`
                console.log('111111111', dbShare['Description'])
              }
              roomShares.push(dbShare)
              return
            }
          }).then(() => {
            let sorted = _.sortBy(roomShares, 'Share Number')
            sorted.forEach(share => shares.push(share))
          })
        })
      } else return null
    })
  }).then(()=>{
    let diff = _.differenceWith([input.data, shares], input.data, _.isEqual)
    let options = {
      delimiter: ',',
      wrap: false,
    }
    fd(csvjson.toCSV(shares, options), 'CurrentCoEFpvShares.csv')
  })
}

function parseSmasFile({input, state, output, services}) {
  var reader = new FileReader();
  var file = input.filelist[0];
  if (!file) return false;
  reader.onload = (upload) => {
    let data = null;
    try { data = csvjson.toObject(upload.target.result, {delimiter: ',', quote: '"' })}
    catch(err) {
      output.error({err})
    }
    if (!data) {
      let err = new Error('Couldnt parse file into json. Is the data a csv file?')
      output.error({err})
    } else output.success({data})
  }
  reader.readAsText(file);
}
parseSmasFile.async = true;
parseSmasFile.outputs = ["success", "error"]

function compareShares({input, state, output, services}) {
  //1. Loop through SMAS rooms; forward convert them to a comparable state!
  //2. Get DB shares for that room (already done)
  //3. Check whether they're all the same, else add them all to the change log.
  let diffs = [];
  let shares = [];
  let dbShares = [];
  return Promise.each(Object.keys(input.rooms), (key) => {
    // Gather up database entries for this room. Order them based on share number
    return services.http.get('/nodes?name='+key+'&type=room').then((response) => {
      if (response.result.length > 0) {
        // Loop through shares, create CSV row, and push them onto our array of rows.
        return services.http.get('/edges?from='+response.result[0]._id+'&type=share').then((result) => {
          let roomShares = [];
          return Promise.map(result.result, (share) => {
            let dbShare = {
              'Bldg': share.building,
              'Room': share.room.split(' ')[1],
              'Share Number': share.share || share.name.split('-')[1].trim(),
              '%':share.percent,
              'Area': share.area,
              'Department Using': share.using,
              'Department Assigned':share.assigned,
              'Sta': share.stations,
              'Room Type': share.type,
            }
            // Get associated people from the db, concatenate them in alphabetical order into the Description column
            if (coeLib.smasRoomTypesWithPeople.indexOf(dbShare['Room Type']) !== -1) {
              return services.http.get('/edges?from='+share._id+'&type=person').then((res) => { 
                return Promise.map(res.result, person => person.name).then(x => x.sort().join(';'))
                }).then((desc) => {
                  dbShare.Description = desc;
                  dbShare['Internal Note'] = share.note;
                  if (dbShare['Description'].indexOf(',') > -1) {
                    dbShare['Description'] = `"${dbShare['Description']}"`
                    console.log('111111111', dbShare['Description'])
                  }
                  roomShares.push(dbShare)
                  return 
                })
            } else { 
              dbShare['Description'] = share.description;
              dbShare['Internal Note'] = share.note;
              if (dbShare['Description'].indexOf(',') > -1) {
                dbShare['Description'] = `"${dbShare['Description']}"`
                console.log('111111111', dbShare['Description'])
              }
              roomShares.push(dbShare)
              return
            }
          }).then(() => {
            let sorted = _.sortBy(roomShares, 'Share Number')
            sorted.forEach((share, i) => {
              share['Share Number'] = i.toString();
              sorted[i]['Share Number'] = i.toString();
              shares.push(share);
            })
// Now compare
            if (!_.isEqual(sorted, input.rooms[key])) {
              diffs.push(sorted)
            }
          })
        })
      } else return null
    })
  }).then(()=>{
    let options = {
      delimiter: ',',
      wrap: false,
    }
    fd(csvjson.toCSV(diffs, options), 'SMAS-diffs.csv')
    return output.success({})
  })
}
compareShares.async = true;
compareShares.outputs = ['success', 'error']

// See changes for the case of generating a report
function compareRoomShares(smas, db) {
  let diffs = []
  db.forEach((dbShare, i) => {
    console.log(smas[i])
    console.log(_.isEqual(smas[i], dbShare))
    if (!smas[i]) {
      let diff = _.clone(dbShare)
      diff['CHANGE TYPE'] = 'ADD';
      diffs.push(diff)
    } else if (!_.isEqual(smas[i], dbShare)) {
      diff['CHANGE TYPE'] = 'UPDATE';
      diffs.push(diff)
    }
  })
  return diffs
}

/*
function diffCheck({input, state, output, services}) {
// Steps
// 1. Parse a SMAS csv file
// 2. Loop through the SMAS room entries
// 3. Convert rooms to room documents 
// 4. Parse out people from the description and convert to person documents
// 4a. Do a GET on the room document byExample
// 4b. Do a GET on all links involving the rooms of interest.
// 4c. Loop through the rooms of interest and determine whether all of the parsed people 
//     names exist as links. Perform a byExample search on roomPeopleEdges.

  let smasRooms;
  let smasPeople;
  let diffs = []
  let shareRoomIndex = 0;
  return coeLib.getSmasRooms(input.data).then((smasRooms)=>{
    return Promise.each(Object.keys(smasRooms), (key) => {
      let smasRoom = smasRooms[key]
      return services.http.get('/nodes?name='+smasRoom.name+'&type=room').then((response) => {
        let dbRoom;
        if (results.result.length > 0) {
          dbRoom = results.result[0]
          smasRoom.shares.forEach((smasShare, i) => {
// If the share exists in the database, include it in the change log
// This handles cases where more shares exist in the new SMAS file as compared
// to whats currently in the database.
            if (!_.isEqual(smasShare, dbRoom.shares[i])) {
              console.log('~~~~~~~~~~~~', smasShare, dbRoom.shares[i])
              if (dbRoom.shares[i]) {
                let currentRow = {
                  Bldg: dbRoom.building,
                  Room: dbRoom.room,
//                  'Share Number': i,
                  '%': dbRoom.shares[i].percent,
                  Area: dbRoom.shares[i].area,
                  'Department Assigned': dbRoom.shares[i].assigned,
                  'Department Using': dbRoom.shares[i].using,
                  'Sta': dbRoom.shares[i].stations,
                  'Room Type': dbRoom.shares[i].type,
                  'Description': dbRoom.shares[i].description,
                  'Internal Note': dbRoom.shares[i].note,
                  'UPDATE TYPE': 'Changed - Current Share Entry',
                }
                diffs.push(currentRow)
              } 
              let newRow = {
                Bldg: smasRoom.building,
                Room: smasRoom.room,
 //               'Share Number': i,
                '%': smasShare.percent,
                Area: smasShare.area,
                'Department Assigned': smasShare.assigned,
                'Department Using': smasShare.using,
                'Sta': smasShare.stations,
                'Room Type': smasShare.type,
                'Description': smasShare.description,
                'Internal Note': smasShare.note,
                'UPDATE TYPE': (dbRoom.shares[i]) ? 'Change - New Share Entry' : 'Addition - New Share Entry',
              }
              diffs.push(newRow)
            }
// This handles situations where the database has more shares than the new SMAS
// file.
          })
          console.log(smasRoom.shares.length)
          console.log(dbRoom.shares.length)
          for (var i = smasRoom.shares.length; i < dbRoom.shares.length-1; i++) {
            console.log(i)
            console.log(dbRoom)
            let dbShare = dbRoom.shares[i]
            let currentRow = {
              Bldg: dbRoom.building,
              Room: dbRoom.room,
//              'Share Number': i,
              '%': dbShare.percent,
              Area: dbShare.area,
              'Department Assigned': dbShare.assigned,
              'Department Using': dbShare.using,
              'Sta': dbShare.stations,
              'Room Type': dbShare.type,
              'Description': dbShare.description,
              'Internal Note': dbShare.note,
              'UPDATE TYPE': 'Deleted - Current Share Entry',
            }
            diffs.push(currentRow)
          }
// No Room exists in the DB.  Mark it as an addition
        } else {
          dbRoom = {}
          let obj = {
            Bldg: smasRoom.building,
            Room: smasRoom.room,
            'Share Number': i,
            '%': smasShare.percent,
            Area: smasShare.area,
            'Department Assigned': smasShare.assigned,
            'Department Using': smasShare.using,
            'Sta': smasShare.stations,
            'Room Type': smasShare.type,
            'Description': smasShare.description,
            'Internal Note': smasShare.note,
            'UPDATE TYPE': 'Addition - New Room Entry',
          }
          diffs.push(obj)
        }
        return shareRoomIndex++;
      })
    })
  }).then(()=>{
    let options = {
      delimiter: ',',
      wrap: false,
    }
    fd(csvjson.toCSV(diffs, options), 'SMAS-diff.csv')
  })
}
*/
