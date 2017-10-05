import {
  updateSearchBarInput,
} from './chains'

export default module => {

  module.addState({
    text: '',
    results: [],

    // Error message. Can be shown using the action displayErrorOnSidebar.
    error: '',
  })

  module.addSignals({
    searchBarInputChanged: {
      chain: updateSearchBarInput,
      immediate: true
    }
  })
}
