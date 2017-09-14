import Promise from 'bluebird'
import csvjson from 'csvjson'
import fd from 'react-file-download'
import coeLib  from './coeLib.js'

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

function forewardConvertDiff() {
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
