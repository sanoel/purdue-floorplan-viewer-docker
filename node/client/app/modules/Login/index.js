import {
  updateLoginInputs,
	logIn,
} from './chains'

export default module => {

  // Use lower case, with dash line to separate words, for naming the variables
  // in the cerebral state.
  module.addState({
    // Login information.
    user: {
      name: 'sam',
      password: 'test'
    },
    is_validating: false,
    error: ''
  })

  module.addSignals({
    loginInputsChanged: {
      chain: updateLoginInputs,
      immediate: true
    },
		loginSubmitted: logIn,
  })

}
