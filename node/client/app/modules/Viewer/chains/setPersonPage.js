import { copy, set } from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'

export default [
  set('output:current_page', 'person'),
  getPerson, {
    success: [
      copy('input:person', 'state:personinfo.person'),
      getPersonsFromPerson, {
        success: [
          copy('input:persons', 'state:personinfo.persons'), 
        ],
        error: [],
      },
      getRoomsFromPerson, {
        success: [
          copy('input:rooms', 'state:personinfo.rooms'), 
        ],
        error: [],
      },
      ...setFrontPage,
    ],
    error: [],
  },
]

export function getRoomsFromPerson({input, services, output}) {
  services.http.get('roomsFromPerson/'+input.person._key).then((results) => {
    output.success({rooms:results.result})
  }).catch((err) => {
    output.error({message:err})
  })
}
getRoomsFromPerson.outputs=['success', 'error']
getRoomsFromPerson.async = true;

export function getPerson({input, state, services, output}) {
  services.http.get('person/'+input.person).then((results) => {
    if (results.result.length === 1) return output.success({person:results.result[0]})
    return output.error({message: 'either multiple or zero persons found'})
  }).catch((err) => {
    output.error({message:err})
  })
}
getPerson.outputs=['success', 'error']
getPerson.async = true;

function getPersonsFromPerson({input, services, output}) {
  services.http.get('personsFromPerson/'+input.person._key).then((results) => {
    output.success({persons:results.result})
  }).catch((err) => {
    output.error({message:err})
  })
}
getPersonsFromPerson.outputs=['success', 'error']
getPersonsFromPerson.async = true;
