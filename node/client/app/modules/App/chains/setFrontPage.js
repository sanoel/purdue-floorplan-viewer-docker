// Reset the app to a clean state with initialization if necessary.
//
// If fields of the state for the viewer is specified, those parts of the state
// will be properly set, too.

import {set} from 'cerebral/operators'

import initiateApp from './initiateApp'
import wait from '../actions/wait'
import resetApp from './resetApp'

export default [
  ...initiateApp,
  wait,
  ...resetApp,
  wait,
  // Also get rid of the error information in the sidebar if there is any.
  set('state:sidebar.error', ''),
]
