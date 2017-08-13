import {set, copy} from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'
import updateRoomsToShow from '../../RoomInfo/actions/updateRoomsToShow'
import Promise from 'bluebird'

export default [
  set('output:current_page', 'room'),
  getRoom, {
    success: [
      copy('input:room', 'state:roominfo.room'), 
//TODO: don't overwrite stuff from database
      setRoomAttributes,
      getSharesFromRoom, {
        success: [
          getPersonsFromShares, {
            success: [
              copy('input:shares', 'state:roominfo.room.shares'), 
              ...setFrontPage,
            ],
          },
        ],
      },
    ],
    error: [],
  },
]

export function getRoom({input, state, services, output}) {
  return services.http.get('/nodes?type=room&name='+input.room).then((results) => {
    if (results.result.length === 1) return output.success({room:results.result[0]})
    console.log('either multiple or zero rooms found')
    console.log(results.result)
    return output.error({message: 'either multiple or zero rooms found'})
  }).catch((err) => {
    console.log(err)
    return output.error({message:err})
  })
}
getRoom.outputs=['success', 'error']
getRoom.async = true;

export function getSharesFromRoom({input, services, output}) {
  return services.http.get('/edges?type=share&from='+input.room._id).then((results) => {
    return output.success({shares: results.result})
  }).catch((err) => {
    console.log(err)
    return output.error({message:err})
  })
}
getSharesFromRoom.outputs=['success', 'error']
getSharesFromRoom.async = true;

export function getPersonsFromShares({input, services, output}) {
  let shares = {}
  return Promise.each(input.shares, (share, i) => {
    return services.http.get('/edges?type=person&from='+share._id).then((results) => {
      shares[share._key] = share
      shares[share._key].persons = {}
      return Promise.each(results.result, (person, j) => {
        shares[share._key].persons[person._key] = person;
        return true;
      })
    }).catch((err) => {
      console.log(err)
      return output.error({message:err})
    })
  }).then(() => {
    return output.success({shares})
  })
}
getPersonsFromShares.outputs=['success', 'error']
getPersonsFromShares.async = true;

export function setRoomAttributes({input, state}) {
  state.set('roominfo.room.attributes', input.room.attributes || {})
}
