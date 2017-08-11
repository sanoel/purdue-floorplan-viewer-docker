import {copy, set, unset, toggle, when } from 'cerebral/operators'
import Promise from 'bluebird'

export var removePerson = [
  unsetPerson,
  resetTable,
]

export var updateNewPersonText = [
  handleNewPersonText,
  getPersonMatches, {
    success: [setMatches],
    error: [],
  },
]

export var setPersonMatch = [
  handlePersonMatch,
  getPersonMatches, {
    success: [setMatches],
    error: [],
  },
]

export var addPerson = [
  getPersonFromText, {
    success: [setPerson, resetTable],
    error: [
      putNewPerson, {
        success: [setPerson, resetTable],
        error: [],
      },
    ],
  },
]

export var setPercent = [
  setSharePercent,
]

export var setDescription = [
  setShareDescription,
]

export var setNote = [
  setShareNote,
]

export var setStations = [
  setShareStations
]

export var setDepartmentUsing = [
  setDeptUsing,
]

export var setDepartmentAssigned = [
  setDeptAssigned,
]

export var removeShare = [
  deleteShare, {
    success: [
      unsetShare,
    ],
    error: [],
  },
]

export var editShare = [
  copy('input:share', 'state:roominfo.share_dialog.share'),
  set('state:roominfo.share_dialog.open', true),
]

export var addShare = [
  addTempShare, {
    success: [
      setTempShare,
      set('state:roominfo.share_dialog.open', true),
      set('state:roominfo.share_dialog.new_share', true),
      copy('input:share', 'state:roominfo.share_dialog.share'),
    ],
    error: [],
  }
]

export var cancelDialog = [
  set('state:roominfo.share_dialog.open', false),
  set('state:roominfo.share_dialog.new_person', { text: '', matches: [], selected_match: {} }),
  when('state:roominfo.share_dialog.new_share'), {
    true: [
      deleteShare, {
        success: [
          unsetShare,
        ],
        error: [],
      },
    ],
    false: [
      revertShare,
    ],
  }, 
]

export var submitDialog = [
  set('state:roominfo.share_dialog.open', false),
  copyShareToRoom,
  addPersonsToShare, {
    success: [],
    error: [],
  }
]

export var startEditingRoom = [
  copy('state:roominfo.room', 'state:roominfo.room_edits'),
  set('state:roominfo.new_person', {text: '', matches: [], selected_match: {}}),
]

export var doneEditingRoom = [
  copy('state:roominfo.room_edits', 'state:roominfo.room'),
  copy('state:roominfo.room_edits.assigned_persons', 'state:roominfo.room.assigned_persons'),
  copy('state:roominfo.room_edits', 'output:room'),
  updateRoom, {
    success: [],
    error: [],
  }
]

export var cancelEditingRoom = [
  copy('state:roominfo.room', 'state:roominfo.room_edits'),
  copy('state:roominfo.room', 'output:room'),
]

export var toggleEditMode = [
  toggle('state:roominfo.editing'),
]

export var setRoomOption = [
  setShareRoomOption,
]

export var setRoomType = [
  setShareRoomType,
]

export var setNotePopover = [
  setShareNotePopover
]



function setTempShare({input, state}) {
  state.set(`roominfo.share_dialog.share`, input.share)
  state.set(`roominfo.share_dialog.share.persons`, {})
}

function setShareNotePopover({input, state}) {
  state.set(`roominfo.popover.${input.share}.open`, input.open);
  state.set(`roominfo.popover.${input.share}.anchorEl`, input.anchorEl);
}

function setShareRoomOption({input, state}) {
  var note = state.get(`roominfo.share_dialog.share.note`)
  if (input.value) {
    state.set(`roominfo.share_dialog.share.note`, note+input.opt+';') 
  } else {
    state.set(`roominfo.share_dialog.share.note`, note.replace(input.opt+';', ''))
  }
}

function copyShareToRoom({input, state}) {
  let shareKey = state.get('roominfo.share_dialog.share._key');
  console.log(shareKey)
  let editShare = state.get(`roominfo.share_dialog.share`)
  console.log(editShare)
  state.set(`roominfo.room.shares.${shareKey}`, editShare);
}

// Delete the share in the DB, room-share edge, and share-person edges
function deleteShare({input, state, services, output}) {
  let to = input.share._id;
  let from = state.get('roominfo.room._id') 
  return services.http.delete('/nodes?id='+input.share._id).then((results) => {
    return services.http.delete('/edges?to='+to+'&from='+from).then((results) => {
      return Promise.each(Object.keys(input.share.persons), (key, i) => {
        let person = input.share.persons[key];
        return services.http.delete('/edges?to='+person._id+'&from='+input.share._id)
        
      }).then(() => {
        return output.success()
      })
    }).catch((error) =>{
      console.log(error);
      return output.error({error})
    })
  }).catch((error) =>{
    console.log(error);
    return output.error({error})
  })
}
deleteShare.async = true;
deleteShare.outputs = ['success', 'error']

function addPersonsToShare({input, state, services, output}) {
  let editShare = state.get(`roominfo.share_dialog.share`)
  let share = state.get(`roominfo.room.shares.${editShare._key}`)
  let newShare = state.get(`roominfo.share_dialog.new_share`)
  if (newShare) {
    console.log('new share')
    return Promise.each(Object.keys(editShare.persons), (key) => { 
      return services.http.put('/edges?to='+editShare.persons[key]._id+'&from='+editShare._id).then((result) => {
        return true;
      }).catch((err) => {
        console.log(err)
        output.error({error:err})
      })
    }).then((res) => { return output.success({})})
  } else {
    console.log('editing share')
    return Promise.each(Object.keys(editShare.persons), (key) => { 
      console.log('editing - adding persons')
      if (!share.persons[key]) {
        return services.http.put('/edges?to='+key+'&from='+shareKey).then((result) => {
          return true;
        }).catch((err) => {
          console.log(err)
          output.error({error:err})
        })
      } else return false
    }).then((res) => {
      return Promise.each(Object.keys(share.persons), (key) => { 
        console.log('editing - deleting persons')
        if (!editShare.persons[key]) {
          return services.http.delete('/edges?to='+key+'&from='+editShare._key).then((result) => {
            return true;
          }).catch((err) => {
            console.log(err)
            output.error({error:err})
          })
        } else return false
      })
    }).then((res) => { return output.success({}) })
  }
}
addPersonsToShare.async = true;
addPersonsToShare.outputs = ['success', 'error']

function revertShare({input, state}) {
  let shareKey = state.get('roominfo.share_dialog.share._key') 
  let shares = state.get('roominfo.room.shares')
  if (shares[shareKey]) {
    state.set(`roominfo.share_dialog.share`, shares[shareKey])
  }
}

function unsetShare({input, state}) {
  state.set(`roominfo.share_dialog.share`, {})
  state.unset(`roominfo.room.shares.${input.index}`)
}

function addTempShare({input, state, services, output}) {
  let shares = state.get('roominfo.room.shares')
  let id = state.get('roominfo.room._id')
  let share = {
    percent: '',
    type: '',
    area: '',
    assigned: '', 
    using: '',
    stations: '',
    description: '',
    note: '',
    _type: 'share'
  }
  return services.http.post('/nodes', share).then((res) => {
    console.log(res.result)
    return services.http.put('/edges?to='+res.result._id+'&from='+id).then((results) => {
      Object.assign(share, res.result)
      console.log(share)
      return output.success({share})
    }).catch((error) =>{
      console.log(error);
      return output.error({error})
    })
  }).catch((error) =>{
    console.log(error);
    return output.error({error})
  })
}
addTempShare.async = true;
addTempShare.outputs = ['success', 'error'];

function setShareRoomType({input, state}) {
  state.set(`roominfo.share_dialog.share.type`, input.type)
}

function setShareDescription({input, state}) {
  state.set(`roominfo.share_dialog.share.description`, input.note)
}

function setShareNote({input, state}) {
  state.set(`roominfo.share_dialog.shares.note`, input.note)
}

function setShareStations({input, state}) {
  state.set(`roominfo.share_dialog.share.stations`, input.stations)
}

function setSharePercent({input, state}) {
  let shareKey = state.get('roominfo.share_dialog.share')
  let totalArea = state.get(`roominfo.room.area`)
  let area = Math.round(parseInt(input.percent)*0.01*parseInt(totalArea)).toString()
  state.set(`roominfo.share_dialog.share.percent`, input.percent)
  state.set(`roominfo.share_dialog.share.area`, area)
}

function setDeptUsing({input, state}) {
  state.set(`roominfo.share_dialog.share.using`, input.using)
}

function setDeptAssigned({input, state}) {
  state.set(`roominfo.share_dialog.share.assigned`, input.assigned)
}

function updateRoom({input, state, output, services}) {
  var body = {example:{_id:input.room._id}, newValue:input.room}
  return services.http.put('/update/', body).then((results) => {
    return output.success()
  }).catch((error) =>{
    console.log(error);
    return output.error({error})
  })
}
updateRoom.async = true;
updateRoom.outputs = ['success', 'error']

/////////////////////////////////////////////////////////////////
///////////////////PersonTable-related actions///////////////////

function resetTable({input, state}) {
  state.set(`roominfo.share_dialog.new_person`, {matches: [], selected_match: {}, text: ''})
}

function unsetPerson({input, state}) {
  state.unset(`roominfo.share_dialog.share.persons.${input.person._key}`)
}

function handleNewPersonText({input, state}) {
  state.set(`roominfo.share_dialog.new_person.selected_match`, {})
  state.set(`roominfo.share_dialog.new_person.text`, input.text)
}

function setMatches({input, state}) {
  state.set(`roominfo.share_dialog.new_person.matches`, input.matches)
}

function handlePersonMatch({input, state}) {
  state.set(`roominfo.share_dialog.new_person.selected_match`, input.match)
  state.set(`roominfo.share_dialog.new_person.text`, input.text)
}

function setPerson({input, state}) {
  state.set(`roominfo.share_dialog.share.persons.${input.person._key}`, input.person)
}

function getPersonFromText({input, state, output, services}) {
  if (input.match) return output.success({person:input.match})
  return services.http.get('/person/'+input.text).then((results)=>{
    if (results.result.length > 0) return output.success({person: results.result[0]})
    return output.error({person: results.result[0]})
  })
}
getPersonFromText.async = true;
getPersonFromText.outputs = ['success', 'error'];

function createPersonEdge({input, state, output, services}) {
  let to = input.match._id;
  let from = input.share._id;
  return services.http.put('/edges?to='+to+'&from='+from+'&type=share-person').then((results) => {
    return output.success()
  }).catch((error) => {
    console.log(error);
    return output.error({error})
  })
}
createPersonEdge.async = true;
createPersonEdge.outputs = ['success', 'error'];

function deletePersonEdge({input, state, output, services}) {
  let from = input.share._id;
  let to = input.person._id;
  return services.http.delete('/edges?from='+from+'&to='+to)
  .then((results) => {
    return output.success()
  }).catch((error) => {
    console.log(error);
    return output.error({error})
  })
}
deletePersonEdge.async = true;
deletePersonEdge.outputs = ['success', 'error'];

function getPersonMatches({input, state, output, services}) {
  if (input.text !== '') {
    return services.http.get('/search?text='+input.text+'&type=person').then((results) => {
      return output.success({matches: results.result.filter((match) => {return match._type === 'person'})})
    }).catch((error) => {
      console.log(error);
      return output.error({error})
    })
  } else return output.success({matches: []})
}
getPersonMatches.async = true;
getPersonMatches.outputs = ['success', 'error']

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

function putNewPerson({input, state, output, services}) {
  var person = {
    name: input.text,
    _type: 'person',
  }
  person.fulltext = createFullText(person, searchablePersonAttributes)
  return services.http.put('/person/', person)
  .then((results)=>{
    return output.success({person: Object.assign(results.result, person), to: results.result._id})
  }).catch((error)=>{
    return output.error({error})
  })
}
putNewPerson.async = true;
putNewPerson.outputs = ['success', 'error'];
