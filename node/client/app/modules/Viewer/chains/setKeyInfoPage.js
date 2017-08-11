import {set} from 'cerebral/operators'

import setFrontPage from '../../App/chains/setFrontPage'
import updateKeyInfo from '../../KeyInfo/actions/updateKeyInfo'

export default [
  // Set the page requested.
  set('output:current_page', 'key'),
  // Start the app with an updated state.
  ...setFrontPage,
  updateKeyInfo
]
