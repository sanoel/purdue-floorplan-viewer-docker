import fildDownload from 'react-file-download'

function exportRoomsMetaData({input, state, output, services}) {
  debugger
  fildDownload(JSON.stringify(state.get('app.rooms_meta_data.rooms')), 'rooms.json')
}

export default exportRoomsMetaData
