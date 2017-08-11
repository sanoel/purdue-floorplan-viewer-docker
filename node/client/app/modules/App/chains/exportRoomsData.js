import {set} from 'cerebral/operators'

import exportRoomsMetaData from '../actions/exportRoomsMetaData'

export default [
  // set('state:app.exporting_rooms', true),
  exportRoomsMetaData,
  // set('state:app.exporting_rooms', false)
]
