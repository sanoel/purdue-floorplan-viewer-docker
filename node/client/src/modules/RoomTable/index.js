import { Module } from 'cerebral'
import { 
addRoom, 
removeRoom, 
setRoomMatch,
updateNewRoomText,
} from './chains'

export default Module({

  state: {

// The bottom row of the RoomTable has an autocomplete text input. Users must select an autocomplete
// entry in order to proceed
    new_room: {
      text: '',
      selected_match: {},
      matches: [],
    }
  },

  signals: {
    addRoomButtonClicked: addRoom,
    newRoomTextChanged: updateNewRoomText,
    removeRoomButtonClicked: removeRoom,
    roomMatchSelected: setRoomMatch,
    roomMatchClicked: addRoom,
  }
})
