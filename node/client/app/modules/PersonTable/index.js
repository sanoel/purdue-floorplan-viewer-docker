import { 
removePerson, 
addPerson, 
setPersonMatch,
updateNewPersonText,
} from './chains'

export default module => {

  module.addState({
    new_person: {
      text: '',
      selected_match: {},
      matches: [],
    }
  })

  module.addSignals({
    personMatchSelected: setPersonMatch,
    removePersonButtonClicked: removePerson,
    addPersonButtonClicked: addPerson,
    newPersonTextChanged: {
      chain: updateNewPersonText,
      immediate: true
    },

  })
}
