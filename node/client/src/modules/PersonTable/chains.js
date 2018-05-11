import { failedAuth } from '../Login/chains'

export var removePerson = [
  deletePersonEdge, {
    success: [
      unsetPerson,
      resetTable,
    ],
    error: [],
    unauthorized: [...failedAuth],
  }
]

export var updateNewPersonText = [
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

function resetTable({props, state}) {
  state.set(`roominfo.room_edits.new_person.matches`, [])
  state.set(`roominfo.room_edits.new_person.selected_match`, {})
  state.set(`roominfo.room_edits.new_person.text`, '')
}

function unsetPerson({props, state}) {
  state.unset(`roominfo.room_edits.shares.${props.share._key}.persons.${props.person._key}`)
}

function handleNewPersonText({props, state}) {
  state.set(`roominfo.room_edits.new_person.selected_match`, {})
  state.set(`roominfo.room_edits.new_person.text`, props.text)
}

function setMatches({props, state}) {
  state.set(`roominfo.room_edits.new_person.matches`, props.matches)
}

function handlePersonMatch({props, state}) {
  state.set(`roominfo.room_edits.new_person.selected_match`, props.match)
  state.set(`roominfo.room_edits.new_person.text`, props.text)
}

function setPerson({props, state}) {
  state.set(`roominfo.room_edits.shares.${props.share._key}.persons.${props.person._key}`, props.person)
}

function getPersonFromText({props, state, path, http}) {
  if (props.match) return path.success({person:props.match})
  return http.get('/person/'+props.text).then((results)=>{
    if (results.result.length > 0) return path.success({person: results.result[0]})
  }).catch((error) => {
    console.log(error)
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

	/*function createPersonEdge({props, state, path, http}) {
  let to = props.match._id;
  let from = props.share._id;
  return http.put('/edges?_to='+to+'&_from='+from+'&type=share-person').then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error)
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}*/

function deletePersonEdge({props, state, path, http}) {
  let from = props.share._id;
  let to = props.person._id;
  return http.delete('/edges?_from='+from+'&_to='+to).then((results) => {
    return path.success()
  }).catch((error) => {
    console.log(error)
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

function getPersonMatches({props, state, path, http}) {
  if (props.text !== '') {
    return http.get('/search?text='+props.text+'&_type=person').then((results) => {
      return path.success({matches: results.result.filter((match) => {return match._type === 'person'})})
    }).catch((error) => {
      console.log(error)
      if (error.status === 401) {
        return path.unauthorized({})
      }
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
  return http.put('/person/', person).then((results)=>{
    return path.success({person: Object.assign(results.result, person), to: results.result._id})
  }).catch((error) => {
    console.log(error)
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}
