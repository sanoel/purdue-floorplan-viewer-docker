import {copy, set, toggle} from 'cerebral/operators'
import { getRoomsFromPerson, getPersonsFromPerson } from '../Viewer/chains'
import { failedAuth } from '../Login/chains'

export var toggleEditMode = [
  toggle('state:personinfo.editing'),
]

export var updateNewRoomText = [
  copy('input:text', 'state:personinfo.new_room.text'),
  getRoomMatches, {
    success: [copy('input:matches', 'state:personinfo.new_room.matches')],
    error: [],
		unauthorized: [...failedAuth], 
  },
]

export var updateSupervisorText = [
  copy('input:text', 'state:personinfo.new_supervisor.text'),
  getPersonMatches, {
    success: [copy('input:supervisor_matches', 'state:personinfo.new_supervisor.matches')],
    error: [],
  },
]

export var updateNewSubordinateText = [
  copy('input:text', 'state:personinfo.new_subordinate.text'),
  getPersonMatches, {
    success: [copy('input:subordinate_matches', 'state:personinfo.new_subordinate.matches')],
    error: [],
  },
]

export var addRoom = [
  createRoomPersonEdge, {
    success: [
      getRoomsFromPerson, {
        success: [
          copy('input:rooms', 'state:personinfo.rooms'),
          set('state:personinfo.new_room.matches', []),
          set('state:personinfo.new_room.text', ''),
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
          copy('input:persons', 'state:personinfo.persons'),
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
          copy('input:rooms', 'state:personinfo.rooms'),
        ],
        error: [],
      }
    ],
    error: [],
		unauthorized: [...failedAuth], 
  }
]

export var setDepartment = [
  copy('input:department', 'state:personinfo.person.department'),
  copy('state:personinfo.person', 'output:person'),
  updatePerson, {
    success: [],
    error: [],
		unauthorized: [...failedAuth],
  }
]

export var setStatus = [
  copy('input:status', 'state:personinfo.person.status'),
  copy('state:personinfo.person', 'output:person'),
  updatePerson, {
    success: [],
    error: [],
		unauthorized: [...failedAuth],
  }
]

export var startEditingPerson = [
  copy('state:personinfo.person', 'state:personinfo.person_edits'),
  copy('state:personinfo.assigned_rooms', 'state:personinfo.assigned_rooms_editing.rooms'),
]

export var doneEditingPerson = [
  copy('state:personinfo.room_edits', 'state:personinfo.room'),
  copy('state:personinfo.assigned_persons_editing.persons', 'state:personinfo.assigned_persons'),
  copy('state:personinfo.room_edits', 'output:room'),
  updatePerson, {
    success: [],
    error: [],
		unauthorized: [...failedAuth],
  }
]

//TODO: Recompute Fulltext on person
function updatePerson({input, state, output, services}) {
  var body = {example:{_id:input.person._id}, newValue: input.person}
  return services.http.put('updatePerson/', body).then((results) => {
    return output.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return output.unauthorized({})
		}
		return output.error({error})
  })
  console.log('updating assigned rooms for: ', person)
  person.rooms.forEach((room) => {
  })
}
updatePerson.async = true;
updatePerson.outputs = ['success', 'error', 'unauthorized']

function createSupervisorPersonEdge({input, state, output, services}) {
  let persons = state.get('personinfo.persons');
  persons.supervisors.forEach((person) => {
    if (input.person._id === person._id) output.error()
  })
  let edge = {_from: input.person._id, _to: input.person._id}
  return services.http.put('createSupervisorPersonEdge/', edge).then((results) => {
    output.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return output.unauthorized({})
		}
		return output.error({error})
  })
}
createSupervisorPersonEdge.async = true;
createSupervisorPersonEdge.outputs = ['success', 'error', 'unauthorized']

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
		if (error.status === 401) {
			return output.unauthorized({})
		}
		return output.error({error})
  })
}
createRoomPersonEdge.async = true;
createRoomPersonEdge.outputs = ['success', 'error', 'unauthorized'];


function deleteRoomPersonEdge({input, state, output, services}) {
  let edge = {_from: input.room._id, _to: input.person._id}
  return services.http.delete('deleteRoomPersonEdge?room='+input.room._key+'&person='+input.person._key).then((results) => {
    output.success()
  }).catch((error) => {
    console.log(error);
		if (error.status === 401) {
			return output.unauthorized({})
		}
		return output.error({error})
  })
}
deleteRoomPersonEdge.async = true;
deleteRoomPersonEdge.outputs = ['success', 'error', 'unauthorized'];

function getRoomMatches({input, state, output, services}) {
  if (input.text !== '') {
    return services.http.get('searchRooms/'+ input.text).then((results) => {
      output.success({matches: results.result.slice(0, 10)})
		}).catch((error) => {
			console.log(error);
			if (error.status === 401) {
				return output.unauthorized({})
			}
			return output.error({error})
		})
  } else output.success({matches: []})
}
getRoomMatches.async = true;
getRoomMatches.outputs = ['success', 'error', 'unauthorized']

function getPersonMatches({input, state, output, services}) {
  if (input.text !== '') {
    return services.http.get('searchPersons/'+ input.text).then((results) => {
      output.success({matches: results.result.slice(0, 10)})
		}).catch((error) => {
			console.log(error);
			if (error.status === 401) {
				return output.unauthorized({})
			}
			return output.error({error})
		})
  } else output.success({matches: []})
}
getPersonMatches.async = true;
getPersonMatches.outputs = ['success', 'error', 'unauthorized']
