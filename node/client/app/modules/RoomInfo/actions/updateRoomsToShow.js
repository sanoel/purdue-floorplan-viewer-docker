
export default function updateRoomsToShow({state, services}) {
  let viewerState = state.get('viewer.state')
  // Validate the information for the selected room, both building and id are
  // needed.
  if(viewerState.building && viewerState.id) {
/*
    if(state.get('app.rooms_meta_data.rooms')) {
      let selectedRoom = state.get('app.rooms_meta_data.rooms').filter((room) => {
        return room.Bldg == viewerState.building && room.Room == viewerState.id
      })

      state.set('roominfo.rooms_to_show', selectedRoom)
    }
  } else {
    // Clear rooms_to_show.
    state.set('roominfo.rooms_to_show', [])
*/
    let roomString = viewerState.building + ' ' + viewerState.id;
    let roomsToShow = state.get(['app', 'data', 'rooms', roomString])
    state.set('roominfo.rooms_to_show', [roomsToShow])
  }
}

