import {set} from 'cerebral/operators'

import exportSmasData from '../actions/exportSmasData'

export default [
  // set('state:app.exporting_rooms', true),
  exportSmasData,
  // set('state:app.exporting_rooms', false)
]
