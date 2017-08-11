import {copy, set} from 'cerebral/operators'
import { getRoomsFromPerson } from '../../Viewer/chains/setPersonPage'

export default [
  createRoomPersonEdge, {
    success: [
      getRoomsFromPerson, {
        success: [
          copy('input:rooms', 'state:personinfo.rooms'),
        ],
        error: [],
      }
    ],
    error: [],
  }
]

function createRoomPersonEdge({input, state, output, services}) {
  let rooms = state.get('personinfo.rooms');
  rooms.forEach((room) => {
    if (input.room._id === room._id) output.error()
  })
  let edge = {_from: input.room._id, _to: input.person._id}
  return services.http.put('createRoomPersonEdge/', edge).then((results) => {
    output.success()
  }).catch((error) => {
    console.log(error);
    output.error({error})
  })
}
createRoomPersonEdge.async = true;
createRoomPersonEdge.outputs = ['success', 'error'];
