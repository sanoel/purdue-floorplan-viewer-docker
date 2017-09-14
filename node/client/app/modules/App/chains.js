import { set, copy, when } from 'cerebral/operators'
import Promise from 'bluebird'
import csvjson from 'csvjson'
import fd from 'react-file-download'
import coeLib  from '../../../coeLib.js'
import { updateSearchBarInput } from '../Sidebar/chains'
import { validateLogin } from '../Login/chains'
import redirectToSignal from 'cerebral-module-router/redirectToSignal'
import fileDownload from 'react-file-download'

export let cancelRoomsDataImportation = [
  set('state:viewer.dropzone_hint', ''),
  set('state:app.importing_rooms', false)
]

export let initiateRoomsDataImportation = [
  when('state:viewer.dropzone_hint'), {
    true: [],
    false: [set('state:viewer.dropzone_hint', 'Drop a SMAS .csv file here or click to browse and select a file.')]
  },
  set('state:app.importing_rooms', true)
]

export let exportSmasData = [
  // set('state:app.exporting_rooms', true),
  exportSmasData,
  // set('state:app.exporting_rooms', false)
]

export let setSettingsPage = [
  set('viewer.state.current_page', 'settings')
]

export let setNotFoundPage = [
  set('viewer.state.current_page', 'notfoundpage')
]

export let exportRoomsData = [
  // set('state:app.exporting_rooms', true),
  exportRoomsMetaData,
  // set('state:app.exporting_rooms', false)
]

export let resetApp = [
  // Create the searchbar_input and viewer_state fields in the input.
  validateInputForResetApp,
  // Clear / update the search bar and the suggestion table.
  ...updateSearchBarInput,
  // Reset the viewer states.
  copy('input:viewer_state', 'state:viewer.state')
]

export let initiateApp = [
  checkInitializationState, {
    initialized: [
    ],
    uninitialized: [
      set('state:app.initialized', true),
      ...validateLogin,

      loadSvgFileNames, {
        success: [
          initiateSupportedFloorPlans,
        ],
        error: [
          displayErrorOnSidebar
        ]
      },

      set('state:app.ready', true)
    ]
  }
]

export let setFrontPage = [
  ...initiateApp,
  wait,
  ...resetApp,
  wait,
  // Also get rid of the error information in the sidebar if there is any.
  set('state:sidebar.error', ''),
]

export let importRoomsData = [
  set('state:app.exporting_rooms', false),
  readDropPanFile, {
    success: [
      getRoomsData, {
        success: [
          // The JSON file for the rooms was successfully loaded. We will need
          // to re-initiate the suggestion engine.
          set('app.ready', false),

          set('viewer.dropzone_hint', 'The JSON file is imported successfully. Initiating the app...'),

          //initiateRoomsData,
          // For convenience, we will just reload the floorplans.
          loadSvgFileNames, {
            success: [
              initiateSupportedFloorPlans,
              // Initiate the suggestion engine.
              // Done.
              set('app.ready', true),
              set('app.importing_rooms', false),
              set('viewer.dropzone_hint', ''),
              // Get rid of the error information if there is any.
              set('state:sidebar.error', ''),
              redirectToSignal('app.frontPageRequested')
            ],
            error: [
              displayErrorOnSidebar
            ]
          }
        ],
        error: [
          set('viewer.dropzone_hint', 'It seems the file imported is not a valid JSON file... Try again?')
        ]
      }
    ],
    error: [
      set('viewer.dropzone_hint', 'Error reading the file... Try again?')
    ]
  }
]

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
                  }
                  roomShares.push(dbShare)
                  return 
                })
            } else { 
              dbShare['Description'] = share.description;
              dbShare['Internal Note'] = share.note;
              if (dbShare['Description'].indexOf(',') > -1) {
                dbShare['Description'] = `"${dbShare['Description']}"`
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

function loadSvgFileNames({state, output, services}) {
  let PATH_TO_SVG = 'img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'
  return services.http.get(PATH_TO_SVG)
    .then(output.success)
    .catch( () => output.error(
      {'errorMsg': 'initiateApp: Unable to load svg floor plan file names!'}
    ))
}
loadSvgFileNames.async = true

function checkInitializationState({input, state, output}) {
  if(state.get('app.initialized')) {
    output.initialized()
  } else {
    output.uninitialized()
  }
}
checkInitializationState.outputs = ['initialized','uninitialized']

// Save the floor plan names to the state tree.
function initiateSupportedFloorPlans({input, state}) {
  input.result.forEach((filename) => {
    // Note that the .svg files on the server are named like GRIS_1.svg and
    // GRIS_b.svg, so we can get the capitalized building names (and lower case
    // floors, if there is any letter in them) directly from the file names.
    var floorplan = {
      filename: filename,
      building: filename.match('^(.+)_.+.svg$')[1],
      floor: filename.match('^.+_(.+).svg$')[1],
      svg: undefined,
    }
    state.set(`app.floorplans.${floorplan.building}.${floorplan.floor}`, floorplan)
  })
}

function getRoomsData({input, output}) {
  let roomsFileContent = input.droppan_file_content
  try {
    let rooms = JSON.parse(roomsFileContent)
    output.success({result: rooms})
  } catch(error) {
    output.error()
  }
}

function readDropPanFile({input, output}) {
  let roomsFile = input.dropzone_file[0]
  let reader = new FileReader()

  reader.onload = function(event) {
    output.success({droppan_file_content: event.target.result})
  };
  reader.onerror = output.error

  reader.readAsText(roomsFile)
}
// Use default outputs:  success and error.
readDropPanFile.async = true

// Save the floor plan names to the state tree.
function initiateSupportedFloorPlans({input, state}) {
  input.result.forEach((filename) => {
    // Note that the .svg files on the server are named like GRIS_1.svg and
    // GRIS_b.svg, so we can get the capitalized building names (and lower case
    // floors, if there is any letter in them) directly from the file names.
    var floorplan = {
      filename: filename,
      building: filename.match('^(.+)_.+.svg$')[1],
      floor: filename.match('^.+_(.+).svg$')[1],
      svg: undefined,
    }
    state.set(`app.floorplans.${floorplan.building}.${floorplan.floor}`, floorplan)
  })
}

function wait() {

}

// Create the searchbar_input and viewer_state fields in the input.
function validateInputForResetApp({input, output}) {
  // The searchbar text can be out of sych with the URL query state. We will
  // update it as long as the query field is set in the input, i.e. in the URL.
  let searchbar_input = input.query || ''

  // Update the viewer.state according to the in put, too.
  let viewer_state = {
    // Set the new state of the viewer. Essentially, we also change the main
    // content of the viewer if the current_page is set in the input, no matter
    // what other states have been updated to the viewer component.
    current_page: input.current_page || 'campusmap',
    // Note, if any of the fields below isn't set, we will get undefined from
    // the input, and that's exactly what we want to set, so a default value
    // isn't provided.
    building: input.building,
    floor: input.floor,
    id: input.id, // Room id.
    person: input.person,
    query: input.query,
    idx: input.idx
  }

  output({
    searchbar_input: searchbar_input,
    viewer_state: viewer_state
  })
}

function exportRoomsMetaData({input, state, output, services}) {
  debugger
  fileDownload(JSON.stringify(state.get('app.rooms_meta_data.rooms')), 'rooms.json')
}

function exportSmasData({input, state, output, services}) {
  var options = {
    delimiter: ",",
    wrap: false
  }
  console.log(state.get('app.rooms_meta_data.rooms'));
  var smasData = csvjson.toCSV(state.get('app.rooms_meta_data.rooms'), options);
  console.log(smasData);
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//  fileDownload(smasData, 'Room_List_View-'+ date + '.csv')
}

// Display input.errorMsg on both the UI and the console.
function displayErrorOnSidebar({input, state}) {
  state.set('sidebar.error', input.errorMsg)
  console.error(input.errorMsg)
}
