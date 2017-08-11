// Reset the app according to the input. If input is not properly given, it will
// only set the parts specified by the input.

import {copy} from 'cerebral/operators'

import validateInputForResetApp from '../actions/validateInputForResetApp'
import updateSearchBarInput from '../../Sidebar/chains/updateSearchBarInput'

export default [
  // Create the searchbar_input and viewer_state fields in the input.
  validateInputForResetApp,
  // Clear / update the search bar and the suggestion table.
  ...updateSearchBarInput,
  // Reset the viewer states.
  copy('input:viewer_state', 'state:viewer.state')
]
