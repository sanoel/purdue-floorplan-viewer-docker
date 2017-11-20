import { set, copy, when } from 'cerebral/operators'
import Promise from 'bluebird'
import csvjson from 'csvjson'
import fd from 'react-file-download'
import coeLib  from '../../../coeLib.js'
import { updateSearchBarInput } from '../SearchBar/chains'
import redirectToSignal from 'cerebral-module-router/redirectToSignal'
import fileDownload from 'react-file-download'
import { failedAuth } from '../Login/chains'

export let cancelRoomsDataImportation = [
  set('state:viewer.dropzone_hint', ''),
  set('state:app.importing_rooms', false)
]

export let initiateRoomsDataImportation = [
  when('state:viewer.dropzone_hint'), {
    true: [],
    false: [set('state:viewer.dropzone_hint', 'Drop one or more SMAS .csv files (not a folder) here or click to browse and select a file. It may take several minutes to process.')]
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
//  ...updateSearchBarInput,
  // Reset the viewer states.
  copy('input:viewer_state', 'state:viewer.state')
]

export let initiateApp = [
  checkInitializationState, {
    initialized: [
    ],
    uninitialized: [
      set('state:app.initialized', true),

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
  getSmasData, {
//  parseSmasFiles, {
    success: [
      forwardConvertSmasFiles, {
        success: [
          getCurrentShares, {
            success: [
              set('state:app.generating_smas_report', false),
            ],
            error: [
              copy('input:error', 'state:settings.error'),
            ],
            unauthorized: [...failedAuth],
          },
        ],
        error: [
          copy('input:error', 'state:settings.error'),
        ],
      },
    ],
    error: [
      copy('input:error', 'state:settings.error'),
    ],
  },
]

// Convert the SQL results into the SMAS output format
function forwardConvertSmasFiles({input, state, output, services}) {
  let all_rows = [];
  let newShares = {} 
  return Promise.map(input.rows, (row) => {
    let room = row.BUILDING_ABBREVIATION+' '+row.ROOM_NUMBER;
//    let share = row.SHARE_NUMBER;
    let share = row.SHARE_ID;
    newShares[room] = newShares[room] || {};
    newShares[room][share] = {
      'Bldg': row.BUILDING_ABBREVIATION,
      'Room': row['ROOM_NUMBER'],
      '%': row['SHARE_PERCENT'].toString(),
      'Area': row['SHARE_AREA'].toString(),
      'Department Using': row.USING_DEPT_ABBREVIATION,
      'Department Assigned': row.ASSIGNED_DEPT_ABBREVIATION,
      'Sta': row['STATIONS'] ? row['STATIONS'].toString() : '0',
      'Room Type': row.ROOM_CLASSIFICATION.trim(),
      'Description': row.DESCRIPTION || '',
      'Internal Note': row.SHARE_INTERNAL_NOTE || '',
    };
    if (newShares[room][share]['Description'].indexOf('On Loan') > -1) {
      newShares[room][share]['Internal Note'] = newShares[room][share].Description;
      newShares[room][share]['Description'] = row['SHARE_INTERNAL_NOTE'] || '';
    }
    if (coeLib.smasRoomTypesWithPeople.indexOf(row['ROOM_CLASSIFICATION']) !== -1) {
      let persons = coeLib.parsePersonsFromSmasDescription(newShares[room][share]['Description'])
      newShares[room][share]['Description'] = persons.map(name => name.trim()).filter(name => name.split(' ').length < 3).sort().join(';')
    }
    all_rows.push(newShares[room][share])
     return false
  }).then(() => {
// Print out a CSV file for diff checker utility usage.
     let options = {
       delimiter: ',',
       wrap: false,
     }
    let date = new Date()
    let dateStr = (date.getMonth()+1).toString() +'-'+date.getDate().toString()+'-'+date.getFullYear().toString();
     fd(csvjson.toCSV(all_rows, options), 'SMAS-'+dateStr+'.csv')
// Now put it into an object for comparison using something like _.isEqual
  }).then(() => {
    return output.success({newShares});
  })
}
forwardConvertSmasFiles.async = true;
forwardConvertSmasFiles.outputs = ['success', 'error']


// Gets the corresponding shares in our DB to those provided in the "new" SMAS file.
// Spits out a csv file representing this "current" state of the DB as well as csv
// of the differences between new and current.
function getCurrentShares({input, state, output, services}) {
  let diffs = [];
  let currentShares = {};
  let all_rows = [];
  // Loop over rooms. Every existing room should occur once.
  return Promise.each(Object.keys(input.newShares), (room) => {
    currentShares[room] = {};
    return services.http.get('/nodes?name='+room+'&_type=room').then((response) => {
      return services.http.get('/edges?_from='+response.result[0]._id+'&_type=share').then((result) => {
        return Promise.map(result.result, (share) => {
          let dbShare = {
            'Bldg': share.building,
            'Room': share.room,
            '%':share.percent,
            'Area': share.area,
            'Department Using': share.using,
            'Department Assigned': share.assigned,
            'Sta': share.stations,
            'Room Type': share.type,
            'Description': share.description,
            'Internal Note': share.note,
          }
// TODO: This will ignore changes to share.note!!!! Probably need to resolve this!
          if (share.loans) { dbShare['Internal Note'] = share.loans; }
//TODO: This will ignore changes to share.description (but I think this is uneditable anyways);
// Get linked people from the db, concatenate them in alphabetical order into the Description column
          if (coeLib.smasRoomTypesWithPeople.indexOf(dbShare['Room Type']) > -1) {
            return services.http.get('/edges?_from='+share._id+'&_type=person').then((res) => {
              return dbShare['Description'] = res.result.map(person => person.name.trim()).sort().join(';')
            }).then((desc) => {
              dbShare.Description = desc;
              currentShares[room][share.share] = dbShare;
              all_rows.push(dbShare);
              return
            })
          } else {
            currentShares[room][share.share] = dbShare;
            all_rows.push(dbShare);
            return 
          }
        })
      })
    }).then(() => {
// Compare by room.  If the entire room doesn't match, add it to diffs; 
       if (!_.isEqual(currentShares[room], input.newShares[room])) {
        console.log(currentShares[room], input.newShares[room])
        Object.keys(currentShares[room]).forEach((key) => {
          diffs.push(currentShares[room][key])
        })
      }
      return;
    })
  }).then(()=>{
    let options = {
       delimiter: ',',
       wrap: false,
     }
    let date = new Date()
    let dateStr = (date.getMonth()+1).toString() +'-'+date.getDate().toString()+'-'+date.getFullYear().toString();
     fd(csvjson.toCSV(all_rows, options), 'FPV-'+dateStr+'.csv')
     fd(csvjson.toCSV(diffs, options), 'SmasChanges-'+dateStr+'.csv')
    return output.success({currentShares})
  }).catch((error) => {
    console.log(error)
    if (error.status === 401) {
      return output.unauthorized({})
    }
    return output.error({error})
  })
}
getCurrentShares.async = true
getCurrentShares.outputs = ['success', 'error', 'unauthorized']

function readFile(file){
  return new Promise((resolve, reject) => {
    var fr = new FileReader();  
    fr.onload = () => {
      resolve(fr.result )
    };
    fr.readAsText(file);
  });
}

function getSmasData({input, state, output, services}) {
  return services.http.get('/smas').then((result) => {
    return output.success({rows: result.result.rows})
  }).catch(() => output.error(
    {'errorMsg': 'initiateApp: Unable to load svg floor plan file names!'}
  )) 
}
getSmasData.async = true;
getSmasData.outputs = ['success', 'error'];

function parseSmasFiles({input, state, output, services}) {
  var files = {};
  return Promise.each(input.accepted, (file, i) => {
    return readFile(file).then((result) => {
      let data = null;
       try { data = csvjson.toObject(result, {delimiter: ',', quote: '"' })}
       catch(err) {
         let err = 'Couldn\'t parse '+file.name+' into json. Is the data a csv file?'
         return output.error({err})
       }
       if (!data) {
         let err = 'Couldn\'t parse '+file.name+' into json. Is the data a csv file?'
         return output.error({err})
       } else return files[file.name] = data
     })
  }).then(() => {
    return output.success({files})
  })
}
parseSmasFiles.async = true;
parseSmasFiles.outputs = ["success", "error"]

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
  //let searchbar_input = input.query || ''

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
//    searchbar_input: searchbar_input,
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
  var smasData = csvjson.toCSV(state.get('app.rooms_meta_data.rooms'), options);
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//  fileDownload(smasData, 'Room_List_View-'+ date + '.csv')
}

// Display input.errorMsg on both the UI and the console.
function displayErrorOnSidebar({input, state}) {
  state.set('sidebar.error', input.errorMsg)
  console.error(input.errorMsg)
}
