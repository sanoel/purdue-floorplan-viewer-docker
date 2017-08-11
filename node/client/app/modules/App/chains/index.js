import { set, copy } from 'cerebral/operators'
import Promise from 'bluebird'
import csvjson from 'csvjson'
import fd from 'react-file-download'
import coeLib  from '../../../../coeLib.js'

export var computeSmasDiffs = [
  parseSmasFile, {
    success: [forewardConversion],
    error: [],
  },
  
]

// Foreward conversion means I can only go from a SMAS csv file to arangodb 
// entries, and compare those potential entries to what is currently in the 
// database, not vice versa. 
function forewardConversion({input, state, output, services}) {
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
      return services.http.get('room/'+smasRoom.name).then((results) => {
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
// Now identify people that've changed and may affect SMAS
/*
  }).then(() => coeLib.getSmasPeople(input.data).then((smasPeople) => {
    smasPeople.forEach((smasPerson) => {
      services.http.get('person/'+smasPerson.name).then((dbPerson) => {
        let diff = _.reduce(dbPerson, function(result, value, key) {
          return _.isEqual(value, smasPerson[key]) ?
            result : result.concat(key);
        }, []);
      })
    })
  }))).then(()=>{
*/
  }).then(()=>{
    let options = {
      delimiter: ',',
      wrap: false,
    }
    fd(csvjson.toCSV(diffs, options), 'SMAS-diff.csv')
  })
}

function parseSmasFile({input, state, output, services}) {
  var reader = new FileReader();
  var file = input.filelist[0];
  if (!file) return false;
  reader.onload = (upload) => {
    let data = null;
    try { data = csvjson.toObject(upload.target.result, {delimiter: ',' })}
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


