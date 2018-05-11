import {set, toggle} from 'cerebral/operators'
import { state, props } from 'cerebral/tags'
import { getRoomsFromPerson, getPersonsFromPerson } from '../Viewer/chains'
import { failedAuth } from '../Login/chains'

export var toggleEditMode = [
  toggle(state`personinfo.editing`),
]

export var updateNewRoomText = [
  set(state`personinfo.new_room.text`, props`text`),
  getRoomMatches, {
    success: [set(state`personinfo.new_room.matches`, props`matches`)],
    error: [],
		unauthorized: [...failedAuth], 
  },
]

export var updateSupervisorText = [
  set(state`personinfo.new_supervisor.text`, props`text`),
  getPersonMatches, {
    success: [set(state`personinfo.new_supervisor.matches`, props`supervisor_matches`)],
    error: [],
  },
]

export var updateNewSubordinateText = [
  set(state`personinfo.new_subordinate.text`, props`text`),
  getPersonMatches, {
    success: [set(state`personinfo.new_subordinate.matches`, props`subordinate_matches`)],
    error: [],
  },
]

export var addRoom = [
  createRoomPersonEdge, {
    success: [
      getRoomsFromPerson, {
        success: [
          set(state`personinfo.rooms`, props`rooms`),
          set(state`personinfo.new_room.matches`, []),
          set(state`personinfo.new_room.text`, ''),
        ],
        error: [],
      }
    ],
    error: [],
		unauthorized: [...failedAuth], 
  }
]

export var addPerson = [
  createSupervisorPersonEdge, {
    success: [
      getPersonsFromPerson, {
        success: [
          set(state`personinfo.persons`, props`persons`),
        ],
        error: [],
      }
    ],
    error: [],
		unauthorized: [...failedAuth], 
  }
]

export var deletePerson = [
  deleteRoomPersonEdge, {
    success: [
      getRoomsFromPerson, {
        success: [
          set(state`personinfo.rooms`, props`rooms`),
        ],
        error: [],
      }
    ],
    error: [],
		unauthorized: [...failedAuth], 
  }
]

export var setDepartment = [
  set(state`personinfo.person.department`, props`department`),
  set(props`person`, state`personinfo.person`),
  updatePerson, {
    success: [],
    error: [],
		unauthorized: [...failedAuth],
  }
]

export var setStatus = [
  set(state`personinfo.person.status`, props`status`),
  set(props`person`, state`personinfo.person`),
  updatePerson, {
    success: [],
    error: [],
		unauthorized: [...failedAuth],
  }
]

export var startEditingPerson = [
  set(state`personinfo.person_edits`, state`personinfo.person`),
  set(state`personinfo.assigned_rooms_editing.rooms`, state`personinfo.assigned_rooms`),
]

export var doneEditingPerson = [
  set(state`personinfo.room`, state`personinfo.room_edits`),
  set(state`personinfo.assigned_persons`, state`personinfo.assigned_persons_editing.persons`),
  set(props`room`, state`personinfo.room_edits`),
  updatePerson, {
    success: [],
    error: [],
		unauthorized: [...failedAuth],
  }
]

//TODO: Recompute Fulltext on person
function updatePerson({props, state, path, http}) {
  var body = {example:{_id:props.person._id}, newValue: props.person}
  return http.put('updatePerson/', body).then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
  })
}

function createSupervisorPersonEdge({props, state, path, http}) {
  let persons = state.get('personinfo.persons');
  persons.supervisors.forEach((person) => {
    if (props.person._id === person._id) return path.error()
  })
  let edge = {_from: props.person._id, _to: props.person._id}
  return http.put('createSupervisorPersonEdge/', edge).then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
  })
}

function createRoomPersonEdge({props, state, path, http}) {
  let rooms = state.get('personinfo.rooms');
  rooms.forEach((room) => {
    if (props.room._id === room._id) return path.error()
  })
  let edge = {_from: props.room._id, _to: props.person._id}
  return http.put('createRoomPersonEdge/', edge).then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
  })
}

function deleteRoomPersonEdge({props, state, path, http}) {
  return http.delete('deleteRoomPersonEdge?room='+props.room._key+'&person='+props.person._key).then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
  })
}

function getRoomMatches({props, state, path, http}) {
  if (props.text !== '') {
    return http.get('searchRooms/'+ props.text).then((results) => {
      return path.success({matches: results.result.slice(0, 10)})
		}).catch((error) => {
			console.log(error);
			if (error.status === 401) {
				return path.unauthorized({})
			}
			return path.error({error})
		})
  } else path.success({matches: []})
}

function getPersonMatches({props, state, path, http}) {
  if (props.text !== '') {
    return http.get('searchPersons/'+ props.text).then((results) => {
      return path.success({matches: results.result.slice(0, 10)})
		}).catch((error) => {
			console.log(error);
			if (error.status === 401) {
				return path.unauthorized({})
			}
			return path.error({error})
		})
  } else path.success({matches: []})
}
