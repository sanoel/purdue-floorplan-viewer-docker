//TODO: Use the database instead.
import {PATH_TO_JSON} from './loadRoomsData'

function saveRoomsData({state, output, services}) {
  // POST the object to the website.
  services.http.post(PATH_TO_JSON, {roomsJsonString: JSON.stringify(state.get('app.rooms_meta_data.rooms'))}, {
    headers: {
      // E.g. {success: false,  error: 'Error!'}
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }).then(output.success)
    .catch( () => output.error(
      {'errorMsg': 'saveRoomsData: Unable to upload the meta data for rooms to the server!'}
    ))
}

saveRoomsData.async = true

export default saveRoomsData
