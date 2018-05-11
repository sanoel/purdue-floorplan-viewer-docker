import { set, when } from 'cerebral/operators'
import { state, props } from 'cerebral/tags'
import Promise from 'bluebird'
import fd from 'react-file-download'
import { failedAuth } from '../Login/chains'
import _ from 'lodash'
import { redirectToSignal } from '@cerebral/router/operators'
import { addAccessToken } from '../Login/chains'

export let cancelRoomsDataImportation = [
  set(state`viewer.dropzone_hint`, ''),
  set(state`app.importing_rooms`, false)
]

export let initiateRoomsDataImportation = [
  when(state`viewer.dropzone_hint`), {
    true: [],
    false: [set(state`viewer.dropzone_hint`, 'Drop one or more SMAS .csv files (not a folder) here or click to browse and select a file. It may take several minutes to process.')]
  },
  set(state`app.importing_rooms`, true)
]

	/*export let exportSmas = [
  // set(state`app.exporting_rooms`, true),
  exportSmasData,
  // set(state`app.exporting_rooms`, false)
]*/

export let setSettingsPage = [
  set(state`viewer.state.current_page`, 'settings')
]

export let setNotFoundPage = [
  set(state`viewer.state.current_page`, 'notfoundpage')
]

export let exportRoomsData = [
  // set(state`app.exporting_rooms`, true),
  exportRoomsMetaData,
  // set(state`app.exporting_rooms`, false)
]

export let resetApp = [
	validateInputForResetApp,
	set(state`viewer.state`, props`viewer_state`),
]

// loads supported floorplans
export let initiateFloorplans = [
  when (state`app.initialized`), {
    true: [],
    false: [
      set(state`app.initialized`, true),
      loadSvgFileNames, {
        success: [
          initiateSupportedFloorPlans,
        ],
        error: [
          displayErrorOnSidebar
        ]
      },
      set(state`app.ready`, true)
    ]
  }
]

export let setFrontPage = [
  ...initiateFloorplans,
  ...resetApp,
  // Also get rid of the error information in the sidebar if there is any.
  set(state`sidebar.error`, ''),
]

export let importRoomsData = [
  set(state`app.exporting_rooms`, false),
  readDropPanFile, {
    success: [
      getRoomsData, {
        success: [
          // The JSON file for the rooms was successfully loaded. We will need
          // to re-initiate the suggestion engine.
          set(state`app.ready`, false),

          set(state`viewer.dropzone_hint`, 'The JSON file is imported successfully. Initiating the app...'),
          //initiateRoomsData,
          // For convenience, we will just reload the floorplans.
          loadSvgFileNames, {
            success: [
              initiateSupportedFloorPlans,
              // Initiate the suggestion engine.
              // Done.
              set(state`app.ready`, true),
              set(state`app.importing_rooms`, false),
              set(state`viewer.dropzone_hint`, ''),
              // Get rid of the error information if there is any.
              set(state`sidebar.error`, ''),
							redirectToSignal('app.frontPageRequested')
            ],
            error: [
              displayErrorOnSidebar
            ]
          }
        ],
        error: [
          set(state`viewer.dropzone_hint`, 'It seems the file imported is not a valid JSON file... Try again?')
        ]
      }
    ],
    error: [
      set(state`viewer.dropzone_hint`, 'Error reading the file... Try again?')
    ]
  }
]

function loadSvgFileNames({state, path, http}) {
	let PATH_TO_SVG = '/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'
  return http.get(PATH_TO_SVG)
    .then(path.success)
    .catch( () => path.error(
      {'errorMsg': 'initiateFloorplans: Unable to load svg floor plan file names!'}
    ))
}

// Save the floor plan names to the state tree.
function initiateSupportedFloorPlans({props, state}) {
  props.result.forEach((filename) => {
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

function getRoomsData({props, path}) {
  let roomsFileContent = props.droppan_file_content
  try {
    let rooms = JSON.parse(roomsFileContent)
    return path.success({result: rooms})
  } catch(error) {
    return path.error()
  }
}

function readDropPanFile({props, path}) {
  let roomsFile = props.dropzone_file[0]
  let reader = new FileReader()

  reader.onload = function(event) {
    return path.success({droppan_file_content: event.target.result})
  };
  reader.onerror = path.error

  reader.readAsText(roomsFile)
}

// Save the floor plan names to the state tree.
	/*function initiateSupportedFloorPlans({props, state}) {
  props.result.forEach((filename) => {
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
}*/

//Setup the 
function validateInputForResetApp({props}) {
  return props.viewer_state = {
    current_page: props.current_page || 'campusmap',
    building: props.building,
    floor: props.floor,
    id: props.id, // Room id.
    person: props.person,
		idx: props.idx
	}
}

function exportRoomsMetaData({props, state, path, http}) {
  debugger
  fd(JSON.stringify(state.get('app.rooms_meta_data.rooms')), 'rooms.json')
}

	/*function exportSmasData({props, state, path, http}) {
  var options = {
    delimiter: ",",
    wrap: false
  }
  var smasData = csvjson.toCSV(state.get('app.rooms_meta_data.rooms'), options);
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//  fileDownload(smasData, 'Room_List_View-'+ date + '.csv')
}*/

// Display props.errorMsg on both the UI and the console.
function displayErrorOnSidebar({props, state}) {
  state.set('sidebar.error', props.errorMsg)
  console.error(props.errorMsg)
}
