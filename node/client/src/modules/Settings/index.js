import { Module } from 'cerebral'
import {
  computeSmasDiffs
} from './chains2'

export default Module({

  state: {
    // Whether the app is saving (currently using HTTP POST method) the data for
    // rooms.
    saving_rooms: false,

    generating_smas_report: false,
		
  },

  signals: {
    smasFileDropped: computeSmasDiffs,
  }
})
