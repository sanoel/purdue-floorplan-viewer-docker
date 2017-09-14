import {copy, set} from 'cerebral/operators'
import { getRoomsFromPerson, getPersonsFromPerson } from '../Viewer/chains'

export var setRoomMatch = [
  copy('input:match', 'state:roomtable.new_room.selected_match'),
  copy('input:text', 'state:roomtable.new_room.text'),
  getRoomMatches, {
    success: [copy('input:matches', 'state:roomtable.new_room.matches')],
    error: [],
  },
]

var resetPersonRooms = [
  getRoomsFromPerson, {
    success: [
      copy('input:rooms', 'state:personinfo.rooms'),
      set('state:roomtable.new_room.matches', []),
      set('state:roomtable.new_room.selected_match', {}),
      set('state:roomtable.new_room.text', ''),
    ],
    error: [],
  }
]

export var removeRoom = [
  deleteRoomPersonEdge, {
    success: [...resetPersonRooms],
    error: [],
  }
]

export var updateNewRoomText = [
  set('state:roomtable.new_room.selected_match', {}),
  copy('input:text', 'state:roomtable.new_room.text'),
  getRoomMatches, {
    success: [copy('input:matches', 'state:roomtable.new_room.matches')],
    error: [],
  },
]

export var addRoom = [
  getRoomFromText, {
    success: [
      createRoomPersonEdge, {
        success: [...resetPersonRooms],
        error: [],
      },
    ],
    error: [],
  }
]

function getRoomFromText({input, state, output, services}) {
  if (input.match) return output.success({room:input.match})
  return services.http.get('/room/'+input.text).then((results)=>{
    if (results.result.length > 0) return output.success({room: results.result[0]})
    return output.error({room: results.result[0]})
  })
}
getRoomFromText.async = true;
getRoomFromText.outputs = ['success', 'error'];

function createRoomPersonEdge({input, state, output, services}) {
//  input.person.rooms.forEach((room) => {
//    if (input.room._id === room._id) return output.error()
//  })
  let edge = {_from: input.room._id, _to: input.person._id}
  return services.http.put('createRoomPersonEdge/', edge).then((results) => {
    return output.success()
  }).catch((error) => {
    console.log(error);
    return output.error({error})
  })
}
createRoomPersonEdge.async = true;
createRoomPersonEdge.outputs = ['success', 'error'];

function deleteRoomPersonEdge({input, state, output, services}) {
  let edge = {_from: input.room._id, _to: input.person._id}
  return services.http.delete('deleteRoomPersonEdge?room='+input.room._key+'&person='+input.person._key).then((results) => {
    return output.success()
  }).catch((error) => {
    console.log(error);
    return output.error({error})
  })
}
deleteRoomPersonEdge.async = true;
deleteRoomPersonEdge.outputs = ['success', 'error'];

function getRoomMatches({input, state, output, services}) {
  if (input.text !== '') {
    return services.http.get('searchRooms/'+ input.text).then((results) => {
      return output.success({matches: results.result.slice(0, 25)})
    }).catch((error) => {
      console.log(error);
      return output.error({error})
    })
  } else return output.success({matches: []})
}
getRoomMatches.async = true;
getRoomMatches.outputs = ['success', 'error']