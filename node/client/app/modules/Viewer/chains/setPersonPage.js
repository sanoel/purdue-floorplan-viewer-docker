import { copy, set } from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'

export default [
  set('output:current_page', 'person'),
  getPerson, {
    success: [
      copy('input:person', 'state:personinfo.person'),
/*      getPersonsFromPerson, {
        success: [
          copy('input:persons', 'state:personinfo.persons'), 
        ],
        error: [],
      },
*/
      getSharesFromPerson, {
        success: [
          copy('input:shares', 'state:personinfo.shares'), 
        ],
        error: [],
      },
      ...setFrontPage,
    ],
    error: [],
  },
]

export function getPerson({input, state, services, output}) {
  return services.http.get('nodes/?type=person&name='+input.person).then((results) => {
    if (results.result.length === 1) return output.success({person:results.result[0]})
    return output.error({message: 'either multiple or zero persons found'})
    console.log(results.result)
  }).catch((err) => {
    output.error({message:err})
  })
}
getPerson.outputs=['success', 'error']
getPerson.async = true;

export function getSharesFromPerson({input, services, output}) {
  services.http.get('edges?type=share&to='+input.person._id).then((results) => {
    output.success({shares:results.result})
  }).catch((err) => {
    output.error({message:err})
  })
}
getSharesFromPerson.outputs=['success', 'error']
getSharesFromPerson.async = true;

/*
function getPersonsFromPerson({input, services, output}) {
  services.http.get('edges?type=person&'+input.person._key).then((results) => {
    output.success({persons:results.result})
  }).catch((err) => {
    output.error({message:err})
  })
}
getPersonsFromPerson.outputs=['success', 'error']
getPersonsFromPerson.async = true;
*/
