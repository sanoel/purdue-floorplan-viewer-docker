import { 
addRoom, 
removeRoom, 
setRoomMatch,
updateNewRoomText,
} from './chains'

export default module => {

  module.addState({

// The bottom row of the RoomTable has an autocomplete text input. Users must select an autocomplete
// entry in order to proceed
    new_room: {
      text: '',
      selected_match: {},
      matches: [],
    }
  })

  module.addSignals({
    addRoomButtonClicked: addRoom,
    newRoomTextChanged: {
      chain: updateNewRoomText,
      immediate: true
    },
    removeRoomButtonClicked: removeRoom,
    roomMatchSelected: setRoomMatch,
    roomMatchClicked: addRoom,

  })
}
