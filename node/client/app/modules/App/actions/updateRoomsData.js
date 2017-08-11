//TODO: Use the database instead.

function updateRoomsData({input, state}) {
  // If input.roomObjId and input.roomObjField is defined, we will update
  // app.rooms_meta_data accordingly.
  if(input.roomObjId && input.roomObjField) {
    // To make the array editable.
    let rooms = state.get('app.rooms_meta_data.rooms').slice()
    for (var i=0; i<rooms.length; i++) {
      if (rooms[i].id === input.roomObjId) {
        // To make the object editable.
        let room = Object.assign({},rooms[i])
        room[input.roomObjField] = input.roomObjFieldValue.trim()
        rooms[i] = room
      }
    }

    state.set('app.rooms_meta_data.rooms', rooms)
  }
}

export default updateRoomsData
