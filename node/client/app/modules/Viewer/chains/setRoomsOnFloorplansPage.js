import {set} from 'cerebral/operators'

import setFrontPage from '../../App/chains/setFrontPage'
import updateFloorplansToShow from '../../FloorPlans/actions/updateFloorplansToShow'

export default [
  // Set the page requested.
  set('output:current_page', 'floorplan'),
  // Start the app with an updated state.
  ...setFrontPage,
  // Update floorplans_to_show.
  updateFloorplansToShow
]
