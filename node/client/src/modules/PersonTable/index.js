import { Module } from 'cerebral'
import {
  removePerson, 
  addPerson, 
  setPersonMatch,
  updateNewPersonText,
} from './chains'

export default Module({

  state: {
    new_person: {
      text: '',
      selected_match: {},
      matches: [],
    }
  },

  signals: {
    personMatchSelected: setPersonMatch,
    removePersonButtonClicked: removePerson,
    addPersonButtonClicked: addPerson,
    newPersonTextChanged: updateNewPersonText,
  }
})
