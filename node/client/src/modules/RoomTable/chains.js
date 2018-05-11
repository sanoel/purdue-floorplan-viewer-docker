import { set } from 'cerebral/operators'
import { state, props } from 'cerebral/tags'
import { getRoomsFromPerson, getPersonsFromPerson } from '../Viewer/chains'
import { failedAuth } from '../Login/chains'

export var setRoomMatch = [
  set(state`roomtable.new_room.selected_match`, props`match`),
  set(state`roomtable.new_room.text`, props`text`),
  getRoomMatches, {
    success: [set(state`roomtable.new_room.matches`, props`matches`)],
    error: [],
		unauthorized: [...failedAuth],
  },
]

var resetPersonRooms = [
  getRoomsFromPerson, {
    success: [
      set(state`personinfo.rooms`, props`rooms`),
      set(state`roomtable.new_room.matches`, []),
      set(state`roomtable.new_room.selected_match`, {}),
      set(state`roomtable.new_room.text`, ''),
    ],
    error: [],
		unauthorized: [...failedAuth],
  }
]

export var removeRoom = [
  deleteRoomPersonEdge, {
    success: [...resetPersonRooms],
    error: [],
		unauthorized: [...failedAuth],
  }
]

export var updateNewRoomText = [
  set(state`roomtable.new_room.selected_match`, {}),
  set(state`roomtable.new_room.text`, props`text`),
  getRoomMatches, {
    success: [set(state`roomtable.new_room.matches`, props`matches`)],
    error: [],
		unauthorized: [...failedAuth],
  },
]

export var addRoom = [
  getRoomFromText, {
    success: [
      createRoomPersonEdge, {
        success: [...resetPersonRooms],
        error: [],
				unauthorized: [...failedAuth],
      },
    ],
    error: [],
		unauthorized: [...failedAuth],
  }
]

function getRoomFromText({props, state, path, http}) {
  if (props.match) return path.success({room:props.match})
  return http.get('/room/'+props.text).then((results)=>{
    if (results.result.length > 0) return path.success({room: results.result[0]})
  }).catch((error) => {
		console.log(error)
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({})
  })
}
getRoomFromText.async = true;
getRoomFromText.paths = ['success', 'error', 'unauthorized'];

function createRoomPersonEdge({props, state, path, http}) {
//  props.person.rooms.forEach((room) => {
//    if (props.room._id === room._id) return path.error()
//  })
  let edge = {_from: props.room._id, _to: props.person._id}
  return http.put('createRoomPersonEdge/', edge).then((results) => {
    return path.success()
  }).catch((error) => {
		console.log(error)
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
	})
}
createRoomPersonEdge.async = true;
createRoomPersonEdge.paths = ['success', 'error', 'unauthorized'];

function deleteRoomPersonEdge({props, state, path, http}) {
  let edge = {_from: props.room._id, _to: props.person._id}
  return http.delete('deleteRoomPersonEdge?room='+props.room._key+'&person='+props.person._key).then((results) => {
    return path.success()
  }).catch((error) => {
		console.log(error)
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
	})
}
deleteRoomPersonEdge.async = true;
deleteRoomPersonEdge.paths = ['success', 'error', 'unauthorized'];

function getRoomMatches({props, state, path, http}) {
  if (props.text !== '') {
    return http.get('searchRooms/'+ props.text).then((results) => {
      return path.success({matches: results.result.slice(0, 25)})
	  }).catch((error) => {
			console.log(error)
			if (error.status === 401) {
				return path.unauthorized({})
			}
			return path.error({error})
		})
  } else return path.success({matches: []})
}
getRoomMatches.async = true;
getRoomMatches.paths = ['success', 'error', 'unauthorized']
