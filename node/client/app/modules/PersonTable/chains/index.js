import {copy, set, unset} from 'cerebral/operators'

export var removePerson = [
  deletePersonEdge, {
    success: [
      unsetPerson,
      resetTable,
    ],
    error: [],
  }
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

function resetTable({input, state}) {
  state.set(`roominfo.room_edits.new_person.matches`, [])
  state.set(`roominfo.room_edits.new_person.selected_match`, {})
  state.set(`roominfo.room_edits.new_person.text`, '')
}

function unsetPerson({input, state}) {
  state.unset(`roominfo.room_edits.shares.${input.share._key}.persons.${input.person._key}`)
}

function handleNewPersonText({input, state}) {
  state.set(`roominfo.room_edits.new_person.selected_match`, {})
  state.set(`roominfo.room_edits.new_person.text`, input.text)
}

function setMatches({input, state}) {
  state.set(`roominfo.room_edits.new_person.matches`, input.matches)
}

function handlePersonMatch({input, state}) {
  state.set(`roominfo.room_edits.new_person.selected_match`, input.match)
  state.set(`roominfo.room_edits.new_person.text`, input.text)
}

function setPerson({input, state}) {
  state.set(`roominfo.room_edits.shares.${input.share._key}.persons.${input.person._key}`, input.person)
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
