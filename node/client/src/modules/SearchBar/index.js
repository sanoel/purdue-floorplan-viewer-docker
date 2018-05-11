import { Module } from 'cerebral'
import {
  updateSearchBarInput,
	clearSearchBarClicked,
} from './chains'
import authenticate from '../Login/authenticate.js'
import {
	setCardsPage,
} from '../Viewer/chains'

export default Module({

  state: {
    text: '',
    results: [],

    // Error message. Can be shown using the action displayErrorOnSidebar.
    error: '',
  },

  signals: {
		searchBarInputChanged: updateSearchBarInput,
		clearClicked: clearSearchBarClicked,
		searchSubmitClicked: authenticate([updateSearchBarInput, setCardsPage])
  }
})
