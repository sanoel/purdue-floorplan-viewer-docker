import {set, when, copy} from 'cerebral/operators'

import displayErrorOnSidebar from '../../Sidebar/actions/displayErrorOnSidebar'
import updateRoomsData from '../actions/updateRoomsData'

// TODO: use a database instead.
import saveRoomsData from '../actions/saveRoomsData'

export default [
  set('state:app.saving_rooms', true),
  updateRoomsData,
  saveRoomsData, {
    success: [
      set('state:app.saving_rooms', false),
      when('input:result.success'), {
        true: [],
        false: [
          copy('input:result.error', 'output:errorMsg'),
          displayErrorOnSidebar
        ]
      }
    ],
    error: [
      set('state:app.saving_rooms', false),
      displayErrorOnSidebar
    ]
  }
]
