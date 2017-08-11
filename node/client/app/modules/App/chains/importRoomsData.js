import {set} from 'cerebral/operators'
import redirectToSignal from 'cerebral-module-router/redirectToSignal'

import importRoomsData from '../actions/importRoomsData'
import readDropPanFile from '../actions/readDropPanFile'
//import initiateRoomsData from '../actions/initiateRoomsData'

import loadSvgFileNames from '../actions/loadSvgFileNames'
import initiateSupportedFloorPlans from '../actions/initiateSupportedFloorPlans'
import displayErrorOnSidebar from '../../Sidebar/actions/displayErrorOnSidebar'

export default [
  set('state:app.exporting_rooms', false),
  readDropPanFile, {
    success: [
      importRoomsData, {
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
