import {copy, set} from 'cerebral/operators'

export default [
  copy('input:text', 'state:personinfo.new_room.text'),
  getRoomMatches, {
    success: [copy('input:matches', 'state:personinfo.new_room.matches')],
    error: [],
  },
]

function getRoomMatches({input, state, output, services}) {
  if (input.text !== '') {
    return services.http.get('searchRooms/'+ input.text).then((results) => {
      output.success({matches: results.result.slice(0, 10)})
    }).catch((error) => {
      console.log(error);
      output.error({error})
    })
  } else output.success({matches: []})
}
getRoomMatches.async = true;
getRoomMatches.outputs = ['success', 'error']
