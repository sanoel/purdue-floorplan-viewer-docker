import { Module } from 'cerebral'
import {
	setTab,
} from './chains'

export default Module({

  state: {
		tab: 0,
    error: '',
  },

  signals: {
		tabClicked: setTab,
  }
})
