import { set, toggle, when } from 'cerebral/operators';
import { state, props } from 'cerebral/tags'
import { failedAuth } from '../Login/chains';
import Promise from 'bluebird';
import uuid from 'uuid';
import _ from 'lodash';

export var cancelAttributeDialog = [
  set(state`roominfo.attribute_dialog.attributes`, state`roominfo.room.attributes`), 
  toggle(state`roominfo.attribute_dialog.open`),
]

export var submitAttributeDialog = [
  set(state`roominfo.room.attributes`, state`roominfo.attribute_dialog.attributes`),
  toggle(state`roominfo.attribute_dialog.open`),
  putRoomAttributes, {
    success: [],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export var toggleRoomAttribute = [
  setRoomAttribute,
]

export var openAttributeDialog = [
  toggle(state`roominfo.attribute_dialog.open`),
  setRoomAttributes,
]

export var removePerson = [
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
  unsetPerson,
  resetTable,
]

export var updateNewPersonText = [
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
  handleNewPersonText,
  getPersonMatches, {
    success: [setMatches],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export var setPersonMatch = [
  handlePersonMatch,
  getPersonMatches, {
    success: [setMatches],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export var addPerson = [
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
  getPersonFromText, {
    success: [setPerson, resetTable],
    error: [
      putNewPerson, {
        success: [setPerson, resetTable],
        error: [],
        unauthorized: [...failedAuth],
      },
    ],
    unauthorized: [...failedAuth],
  },
]

export var setPercent = [
  setSharePercent,
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
]

export var setDescription = [
  setShareDescription,
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
]

export var setNote = [
  setShareNote,
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
]

export var setStations = [
  setShareStations,
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
]

export var setDepartmentUsing = [
  setDeptUsing,
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
]

export var setDepartmentAssigned = [
  setDeptAssigned,
  set(state`roominfo.share_dialog.share.edit.date`, new Date()),
  set(state`roominfo.share_dialog.share.edit.username`, state`login.user.name`),
]

export var removeShare = [
  set(state`roominfo.share_dialog.open`, false),
  deleteShare, {
    success: [
      unsetShare,
      set(state`roominfo.share_dialog.new_person`, { text: '', matches: [], selected_match: {} }),
    ],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export var editShare = [
  set(state`roominfo.share_dialog.share`, props`share`),
  set(state`roominfo.share_dialog.open`, true),
]

export var cancelDialog = [
  set(state`roominfo.share_dialog.open`, false),
  when(state`roominfo.share_dialog.new_share`), {
    true: [
      deleteShare, {
        success: [
          unsetShare,
        ],
        error: [],
        unauthorized: [...failedAuth],
      },
    ],
    false: [
      revertShare,
    ],
  }, 
  set(state`roominfo.share_dialog.new_person`, { text: '', matches: [], selected_match: {} }),
  set(state`roominfo.share_dialog.new_share`, false)
]

export var addShare = [
  addTempShare, {
    success: [
      set(state`roominfo.share_dialog.open`, true),
      set(state`roominfo.share_dialog.new_share`, true),
      set(state`roominfo.share_dialog.share`, props`share`),
      set(state`roominfo.share_dialog.share.persons`, {}),
      copyShareToRoom,
    ],
    error: [],
    unauthorized: [...failedAuth],
  }
]

export var submitDialog = [
  set(state`roominfo.share_dialog.open`, false),
  set(state`roominfo.share_dialog.new_person`, { text: '', matches: [], selected_match: {} }),
  when(state`roominfo.share_dialog.new_share`), {
    false: [
      updateShare, {
        success: [
          copyShareToRoom,
        ],
        error: [],
        unauthorized: [...failedAuth],
      },
    ],
    true: [
      postNewShare, {
        success: [
          copyShareToRoom,
          moveNewShare,
        ],
        error: [],
        unauthorized: [...failedAuth],
      },
    ],
  },
  set(state`roominfo.share_dialog.new_share`, false)
]

export var startEditingRoom = [
  set(state`roominfo.room_edits`, state`roominfo.room`),
  set(state`roominfo.new_person`, {text: '', matches: [], selected_match: {}}),
]

export var doneEditingRoom = [
  set(state`roominfo.room`, state`roominfo.room_edits`),
  set(state`roominfo.room.assigned_persons`, state`roominfo.room_edits.assigned_persons`),
  set(props`room`, state`roominfo.room_edits`),
  updateRoom, {
    success: [],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export var cancelEditingRoom = [
  set(state`roominfo.room_edits`, state`roominfo.room`),
  set(props`room`, state`roominfo.room`),
]

export var toggleEditMode = [
  toggle(state`roominfo.editing`),
]

export var setRoomOption = [
  setShareRoomOption,
]

export var setRoomType = [
  setShareRoomType,
]

function moveNewShare({props, state}) {
  state.unset(`roominfo.room.shares.${props.tempKey}`);
}

function setShareRoomOption({props, state}) {
  var note = state.get(`roominfo.share_dialog.share.note`)
  if (props.value) {
    state.set(`roominfo.share_dialog.share.note`, note+props.opt+';') 
  } else {
    state.set(`roominfo.share_dialog.share.note`, note.replace(props.opt+';', ''))
  }
}

function copyShareToRoom({props, state}) {
  let newShare = state.get('roominfo.share_dialog.new_share');
  let editShare = state.get(`roominfo.share_dialog.share`)
  let shareKey = newShare ? props.share._key : editShare._key;
  state.set(`roominfo.room.shares.${shareKey}`, newShare ? props.share : editShare);
}

// Delete the share in the DB, room-share edge, and share-person edges
function deleteShare({props, state, http, path}) {
  let to = props.share._id;
  let from = state.get('roominfo.room._id') 
  return http.delete('/nodes?id='+props.share._id).then((results) => {
    return http.delete('/edges?_to='+to+'&_from='+from).then((results) => {
      return Promise.each(Object.keys(props.share.persons), (key, i) => {
        let person = props.share.persons[key];
        return http.delete('/edges?_to='+person._id+'&_from='+props.share._id)
      }).then(() => {
        return path.success()
      })
    }).catch((error) =>{
      console.log(error);
      return path.error({error})
    })
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

function postNewShare({props, state, http, path}) {
  let editShare = state.get('roominfo.share_dialog.share');
  let tempKey = editShare._key;
  let room = state.get('roominfo.room')
  let example = _.cloneDeep(editShare)
  delete example.persons
  delete example._key
	return http.request({
		method: 'POST',
		url: '/nodes',
		body: example,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}
	}).then((meta) => {
    example = Object.assign(example, meta.result);
    example.persons = editShare.persons;
		return http.request({
			method: 'POST',
			url: '/edges?_to='+meta.result._id+'&_from='+room._id+'&_type=room-share'
		}).then((results) => {
// Add persons that are new 
      return Promise.each(Object.keys(editShare.persons), (key) => { 
				return http.request({
					method: 'POST',
					url: '/edges?_to='+encodeURIComponent('nodes/'+key)+'&_from='+encodeURIComponent(meta.result._id)+'&_type=share-person',
				}).then((res) => {
          return path.success({share: example, tempKey})
        })
      })
    })
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

function updateShare({props, state, http, path}) {
  let editShare = state.get('roominfo.share_dialog.share');
  let share = state.get(`roominfo.room.shares.${editShare._key}`)
  let example = _.cloneDeep(editShare)
  delete example.persons
  delete example._rev
  delete example._id
  delete example._key
  console.log('PUTTING ROOM UPDATES', editShare._id, example)
	return http.request({
		method: 'PUT',
		url: '/nodes?id='+editShare._id,
		body: example,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}
	}).then((res) => {
// Add persons that are new 
    return Promise.each(Object.keys(editShare.persons), (key) => { 
      if (!share.persons[key]) {
				return http.request({
					method: 'POST',
					url: '/edges?_to=nodes/'+key+'&_from='+editShare._id+'&_type=share-person'
				}).catch((err) => {
          console.log(err)
          return path.error({error:err})
        })
      } else return false
    }).then((res) => {
// Delete persons that are no longer listed 
      console.log('DELETING PERSONS')
      return Promise.each(Object.keys(share.persons), (key) => { 
        if (!editShare.persons[key]) {
          console.log('POSTING REMOVING DELETED EDGES')
          return http.delete('/edges?_to='+key+'&_from='+editShare._key)
          .catch((err) => {
            console.log(err)
            return path.error({error:err})
          })
        } else return false
      })
    })
  }).then((res) => { 
    console.log('RETURNING OUTPUT')
    return path.success({})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

function revertShare({props, state}) {
  let shareKey = state.get('roominfo.share_dialog.share._key') 
  let shares = state.get('roominfo.room.shares')
  if (shares[shareKey]) {
    state.set(`roominfo.share_dialog.share`, shares[shareKey])
  }
}

function unsetShare({props, state}) {
  state.set(`roominfo.share_dialog.share`, {})
  state.unset(`roominfo.room.shares.${props.share._key}`)
}

function addTempShare({props, state, http, path}) {
  let shareNumber = uuid();
  let room = state.get('roominfo.room')
//      Object.assign(share, res.result)
  let username = state.get('login.user.name')
  let share = {
    percent: '',
    type: '',
    area: '',
    assigned: '', 
    using: '',
    stations: '',
    description: '',
    note: JSON.stringify({share: shareNumber.toString()}),
    building: room.building,
    floor: room.floor,
    room: room.room,
    share: shareNumber.toString(),
    persons: {},
    _type: 'share',
    _key: uuid(),
    edit: { 
      date: new Date(), 
      username,
    }
  }
  return path.success({share})
}

function setShareRoomType({props, state}) {
  state.set(`roominfo.share_dialog.share.type`, props.type)
}

function setShareDescription({props, state}) {
  state.set(`roominfo.share_dialog.share.description`, props.note)
}

function setShareNote({props, state}) {
  state.set(`roominfo.share_dialog.shares.note`, props.note)
}

function setShareStations({props, state}) {
  state.set(`roominfo.share_dialog.share.stations`, props.stations)
}

function setSharePercent({props, state}) {
  let totalArea = state.get(`roominfo.room.area`)
  let area = Math.round(parseInt(props.percent,10)*0.01*parseInt(totalArea,10)).toString()
  state.set(`roominfo.share_dialog.share.percent`, props.percent)
  state.set(`roominfo.share_dialog.share.area`, area)
}

function setDeptUsing({props, state}) {
  state.set(`roominfo.share_dialog.share.using`, props.using)
}

function setDeptAssigned({props, state}) {
  state.set(`roominfo.share_dialog.share.assigned`, props.assigned)
}

function updateRoom({props, state, path, http}) {
  var body = {example:{_id:props.room._id}, newValue:props.room}
	return http.request({
		method: 'PUT',
		url: '/update/',
		body,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}
	}).then((results) => {
    return path.success()
  }).catch((error) =>{
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

/////////////////////////////////////////////////////////////////
///////////////////PersonTable-related actions///////////////////

function resetTable({props, state}) {
  state.set(`roominfo.share_dialog.new_person`, {matches: [], selected_match: {}, text: ''})
}

function unsetPerson({props, state}) {
  state.unset(`roominfo.share_dialog.share.persons.${props.person._key}`)
}

function handleNewPersonText({props, state}) {
  state.set(`roominfo.share_dialog.new_person.selected_match`, {})
  state.set(`roominfo.share_dialog.new_person.text`, props.text)
}

function setMatches({props, state}) {
  state.set(`roominfo.share_dialog.new_person.matches`, props.matches)
}

function handlePersonMatch({props, state}) {
  state.set(`roominfo.share_dialog.new_person.selected_match`, props.match)
  state.set(`roominfo.share_dialog.new_person.text`, props.text)
}

function setPerson({props, state}) {
  state.set(`roominfo.share_dialog.share.persons.${props.person._key}`, props.person)
}

function getPersonFromText({props, state, path, http}) {
  if (props.match._id) return path.success({person:props.match})
  return http.get('/nodes?name='+props.text).then((result)=>{
    if (result.result.length > 0) return path.success({person: result})
    return path.error({error: 'An error occurred while trying to find person by text', person: result})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

	/*function createPersonEdge({props, state, path, http}) {
  let to = props.match._id;
  let from = props.share._id;
  return http.post('/edges?_to='+to+'&_from='+from+'&_type=share-person').then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}*/

	/*function deletePersonEdge({props, state, path, http}) {
  let from = props.share._id;
  let to = props.person._id;
  return http.delete('/edges?_from='+from+'&_to='+to).then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error);
    return path.error({error})
  })
}*/

function getPersonMatches({props, state, path, http}) {
  if (props.text !== '') {
    return http.get('/search?text='+props.text+'&_type=person').then((results) => {
      return path.success({matches: results.result.filter((match) => {return match._type === 'person'})})
    }).catch((error) => {
      console.log(error);
      return path.error({error})
    })
  } else return path.success({matches: []})
}

//TODO: Replace with coeLib.js
// Create a fulltext searchable string of an item, given an array of keys to use
// Currently a dumb operation where item[attribute] should be of type string 
var searchablePersonAttributes = ['name', 'id', 'department', 'status']
function createFullText(item, attributes) {
  var fulltext = '';
  attributes.forEach(function(attribute) {
    if (item[attribute]) fulltext += (' ' + item[attribute]);
  })
  return fulltext;
}

function putNewPerson({props, state, path, http}) {
  var person = {
    name: props.text,
    _type: 'person',
  }
  person.fulltext = createFullText(person, searchablePersonAttributes)
	return http.request({
		method: 'POST',
		url: '/nodes',
		body: person,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}
	}).then((results)=> {
    console.log(results)
    return path.success({person: Object.assign(results.result, person), to: results.result._id})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

////////////////// Attribute Dialog //////////////////////////

function setRoomAttribute({props, state}) {
  let checked = state.get('roominfo.attribute_dialog.attributes.'+props.attribute)
  if (checked) {
    state.set('roominfo.attribute_dialog.attributes.'+props.attribute, false)
  } else {
    state.set('roominfo.attribute_dialog.attributes.'+props.attribute, true)
  }
}

function setRoomAttributes({props, state}) {
  let roomAttributes = ['208 V', '220 V', '480 V', 'Single Phase', 'Three Phase']
  let attributes = state.get('roominfo.room.attributes')
  roomAttributes.forEach((attribute) => {
    if (attributes[attribute]) {
      state.set('roominfo.attribute_dialog.attributes.'+attribute, attributes[attribute])
    } else {
      state.set('roominfo.attribute_dialog.attributes.'+attribute, false)
    }
  })
}

function putRoomAttributes({props, state, http, path}) {
	let room = state.get('roominfo.room')
	console.log(room._id)
	let body = {
		attributes: room.attributes
	}
	return http.request({
		method: 'PUT',
		url: '/nodes?id='+room._id,
		body,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		}
	}).then((results) => {
		console.log(results)
    return path.success({})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}


