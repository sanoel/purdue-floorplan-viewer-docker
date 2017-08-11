import {copy, set} from 'cerebral/operators'
import { getRoomsFromPerson } from '../../Viewer/chains/setPersonPage'

export default [
  deleteRoomPersonEdge, {
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

function deleteRoomPersonEdge({input, state, output, services}) {
  let edge = {_from: input.room._id, _to: input.person._id}
  return services.http.delete('deleteRoomPersonEdge?room='+input.room._key+'&person='+input.person._key).then((results) => {
    output.success()
  }).catch((error) => {
    console.log(error);
    output.error({error})
  })
}
deleteRoomPersonEdge.async = true;
deleteRoomPersonEdge.outputs = ['success', 'error'];
