import updateSearchBarInput from './chains/updateSearchBarInput'

export default module => {

  module.addState({
    searchbar: {
      text: '',
    },
    search_results: [],

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
