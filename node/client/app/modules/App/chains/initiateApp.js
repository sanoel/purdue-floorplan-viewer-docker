import {set} from 'cerebral/operators'
import checkInitializationState from '../actions/checkInitializationState'
import displayErrorOnSidebar from '../../Sidebar/actions/displayErrorOnSidebar'
import loadSvgFileNames from '../actions/loadSvgFileNames'
import initiateSupportedFloorPlans from '../actions/initiateSupportedFloorPlans'
import validateLogin from '../../Login/chains/validateLogin'

// TODO: use a database instead.

export default [
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
