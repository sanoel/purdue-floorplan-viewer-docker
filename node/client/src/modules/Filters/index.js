import { Module } from 'cerebral'
import {
	showHideSection,
	toggleCheckbox,
	clearFilters,
	inputChanged,
} from './chains'

export default Module({

  // Use lower case, with dash line to separate words, for naming the variables
  // in the cerebral state.
	state: {
		headers: {
			buildings: {
				visible: false,
			},
			types: {
				visible: false,
			},
			attributes: {
				visible: false,
			},
			using: {
				visible: false,
			},
			assigned: {
				visible: false,
			},
			stations: {
				visible: false,
			},
			roomArea: {
				visible: false,
			},
			shareArea: {
				visible: false,
			},
		},
		query: {
			buildings: {
			},
			types: {
			},
			attributes: {
			},
			using: {
			},
			assigned: {
			},
			minStations: '',
			maxStations: '',
			minRoomArea: '',
			maxRoomArea: '',
			minShareArea: '',
			maxShareArea: '',
		},
		result: {

		}
  },

  signals: {
    boxChecked: toggleCheckbox,
		headerClicked: showHideSection,
		clearFiltersClicked: clearFilters,
		inputChanged,
  }
})
