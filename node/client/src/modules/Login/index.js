import { Module } from 'cerebral'
import {
  updateLoginInputs,
	logIn,
	init
} from './chains'

export default Module({
  // Use lower case, with dash line to separate words, for naming the variables
  // in the cerebral state.
  state: {
    // Login information.
    user: {
      name: 'sanoel',
      password: 'test'
    },
    is_validating: false,
    error: ''
  },

  signals: {
    loginInputsChanged: updateLoginInputs,
		loginSubmitted: logIn,
		init
  }

})
