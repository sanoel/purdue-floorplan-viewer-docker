import { set, equals } from 'cerebral/operators';
import _ from 'lodash';
import { string, state, props } from 'cerebral/tags';
import { setFrontPage } from '../App/chains';
import { failedAuth } from '../Login/chains';
import Promise from 'bluebird';
import { filter } from '../Filters/chains';
import { redirect, redirectToSignal } from '@cerebral/router/operators'

export let viewerReady = [
  set(state`app.ready`, true)
]

export let setRoomPage = [
	set(state`viewer.state.current_page`, 'loadingpage'),
	set(props`current_page`, 'room'),
  getRoom, {
    success: [
      set(state`roominfo.room`, props`room`), 
//TODO: don't overwrite stuff from database
      setRoomAttributes,
      getSharesFromRoom, {
        success: [
          getPersonsFromShares, {
            success: [
              set(state`roominfo.room.shares`, props`shares`), 
							filter, 
              ...setFrontPage,
            ],
            unauthorized: [...failedAuth],
          },
        ],
        unauthorized: [...failedAuth],
      },
    ],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export let setPersonPage = [
	set(state`viewer.state.current_page`, 'loadingpage'),
  set(props`current_page`, 'person'),
  getPerson, {
    success: [
/*      getPersonsFromPerson, {
        success: [
          set(state`personinfo.persons`, props`persons`), 
        ],
        error: [],
      },
*/
      getSharesFromPerson, {
        success: [
					set(state`personinfo.person`, props`person`),
          set(state`personinfo.shares`, props`shares`), 
        ],
        error: [],
        unauthorized: [...failedAuth],
      },
      ...setFrontPage,
    ],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export let setLoadingPage = [
  set(state`viewer.state.current_page`, 'loadingpage')
]

// Set props.force to be true to use all queries supported as the start point
// generating the cards.
//
export let setCardsPage = [
	set(state`viewer.state.current_page`, 'loadingpage'),
  // Set the page requested.
  set(props`current_page`, 'cards'),
  // Start the app with an updated state.
  ...setFrontPage,
  // Update cards_to_show.
	set(state`cards.cards_to_show`, state`searchbar.results`),
]

export let setFloorplanPage = [
	set(state`viewer.state.current_page`, 'loadingpage'),
  set(props`current_page`, 'floorplan'),
  getFloorplan, {
    success: [
      set(state`floorplans.floorplan_to_show`, props`floorplan`), 
      getRoomsFromFloorplan, {
        success: [
          set(state`floorplans.rooms`, props`rooms`),
					filter,
          ...setFrontPage,
        ],
        error: [],
        unauthorized: [...failedAuth],
      },
    ],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export let setBuildingPage = [
	set(state`viewer.state.current_page`, 'loadingpage'),
	set(props`current_page`, 'building'),
  getBuilding, {
    success: [
      getFloorplansFromBuilding, {
				success: [
          set(state`cards.cards_to_show`, props`floorplans`),
					filter,
          ...setFrontPage
        ],
        error: [],
        unauthorized: [...failedAuth],
      }
    ],
    error: [],
    unauthorized: [...failedAuth],
  },
]

export let handleSearchResult = [
  set(state`viewer.state.current_page`, 'loadingpage'),
  equals(props`type`), { 
    building: [
			redirect(string`/building/${props`card.name`}`),
    ],
    floorplan: [
			redirect(string`/floorplan/${props`card.name`}`),
    ],
    room: [
			redirect(string`/room/${props`card.name`}`),
    ],
    person: [
			redirect(string`/person/${props`card.name`}`),
		],
		cards: [
			redirect(string`/search?q=${state`searchbar.text`}`),
		],
    otherwise: [
		
    ],
  },
]

function getBuilding({props, http, path}) {
  return http.get('/nodes?_type=building&name='+encodeURIComponent(props.building)).then((results) => {
    return path.success({building:results.result[0]})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

function getFloorplansFromBuilding({props, http, path}) {
	return http.get('/edges?_type=floorplan&_from='+props.building._id).then((results) => {
		let floorplans = results.result;
		floorplans.forEach((fl) => {
			switch(fl.floor) {
				case 'R':
					fl.floorOrder = floorplans.length + 5;
					break;
				case 'AB':
					fl.floorOrder = -3;
					break;
				case 'B':
					fl.floorOrder = -2;
					break;
				case 'G':
					fl.floorOrder = -1;
					break;
				default:
					fl.floorOrder = parseInt(fl.floor) || fl.floor;
					break;
			}
		})
    return path.success({floorplans: _.sortBy(floorplans, 'floorOrder')})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}


// Update floorplans.floorplan_to_show. 
export function getFloorplan({props, state, http, path}) {
  return http.get('/nodes?_type=floorplan&name='+encodeURIComponent(props.floorplan)).then((results) => {
    return path.success({floorplan:results.result[0]})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

export function getRoomsFromFloorplan({props, state, http, path}) {
	return http.get('/edges?_type=room&_from='+props.floorplan._id).then((results) => {
		var rooms = {}; 
		results.result.forEach((res) => {
			rooms[res.name] = res;
		})
		return path.success({rooms})
	}).catch((error) => {
		console.log(error);
		if (error.status === 401) {
			return path.unauthorized({})
		}
		return path.error({error})
	})
}

export function getRoomsFromFloorplans({props, state, http, path}) {
	console.log(props.floorplans)
	return Promise.map(props.floorplans || [], (floorplan) => {
		return http.get('/edges?_type=room&_from='+props.floorplan._id).then((results) => {
			var rooms = {}; 
			results.result.forEach((res) => {
				rooms[res.name] = res;
			})
			return path.success({rooms})
		}).catch((error) => {
			console.log(error);
			if (error.status === 401) {
				return path.unauthorized({})
			}
			return path.error({error})
		})
	})
}

export function getRoomsFromPerson({props, state, http, path}) {
  return http.get('/edges?_type=room&_from='+props.person._id).then((results) => {
    var rooms = {}; 
    results.result.forEach((res) => {
      rooms[res.name] = res;
    })
    return path.success({rooms})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

export function getPerson({props, state, http, path}) {
	return http.get('/nodes/?_type=person&name='+encodeURIComponent(props.person)).then((results) => {
    if (results.result.length === 1) return path.success({person:results.result[0]})
    return path.error({message: 'either multiple or zero persons found'})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

export function getSharesFromPerson({props, http, path}) {
	return http.get('/edges?_type=share&_to='+props.person._id).then((results) => {
		console.log(results)
    return path.success({shares:results.result})
  }).catch((error) => {
    console.log(error);
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

/*
function getPersonsFromPerson({props, http, path}) {
  http.get('edges?type=person&'+props.person._key).then((results) => {
    path.success({persons:results.result})
  }).catch((err) => {
    path.error({message:err})
  })
}
*/

export function getRoom({props, state, http, path}) {
  return http.get('/nodes?_type=room&name='+encodeURIComponent(props.room)).then((results) => {
     return path.success({room:results.result[0]})
  }).catch((err) => {
    console.log(err)
    if (err.status === 401) {
      return path.unauthorized({})
    }
    return path.error({message:err})
  })
}

export function getSharesFromRoom({props, http, path}) {
  return http.get('/edges?_type=share&_from='+props.room._id).then((results) => {
    return path.success({shares: results.result})
  }).catch((err) => {
    console.log(err)
    if (err.status === 401) {
      return path.unauthorized({})
    }
    return path.error({message:err})
  })
}

export function getPersonsFromShares({props, http, path}) {
  let shares = {}
  return Promise.each(props.shares, (share, i) => {
    return http.get('/edges?_type=person&_from='+share._id).then((results) => {
      shares[share._key] = share
      shares[share._key].persons = {}
      return Promise.each(results.result, (person, j) => {
        shares[share._key].persons[person._key] = person;
        return true;
      })
    }).catch((err) => {
      console.log(err)
      if (err.status === 401) {
        return path.unauthorized({})
      }
      return path.error({message:err})
    })
  }).then(() => {
    return path.success({shares})
  })
}

export function getPersonsFromPerson({props, http, path}) {
  let persons = {}
  return http.get('/edges?_type=person&_from='+props.person._id).then((results) => {
    return Promise.each(results.result, (person, j) => {
      persons[person._key] = person;
      return true;
    })
  }).catch((err) => {
    console.log(err)
    if (err.status === 401) {
      return path.unauthorized({})
    }
    return path.error({message:err})
  }).then(() => {
    return path.success({persons})
  })
}

export function setRoomAttributes({props, state}) {
  state.set('roominfo.room.attributes', props.room.attributes || {})
}


export function updateRoomsToShow({state, http}) {
  let viewerState = state.get('viewer.state')
  // Validate the information for the selected room, both building and id are
  // needed.
  if(viewerState.building && viewerState.id) {
/*
    if(state.get('app.rooms_meta_data.rooms')) {
      let selectedRoom = state.get('app.rooms_meta_data.rooms').filter((room) => {
        return room.Bldg == viewerState.building && room.Room == viewerState.id
      })

      state.set('roominfo.rooms_to_show', selectedRoom)
    }
  } else {
    // Clear rooms_to_show.
    state.set('roominfo.rooms_to_show', [])
*/
    let roomString = viewerState.building + ' ' + viewerState.id;
    let roomsToShow = state.get(['app', 'data', 'rooms', roomString])
    state.set('roominfo.rooms_to_show', [roomsToShow])
  }
}

export function getFloorPlansToShow(query, floorplans) {
  // The current query. We are expecting building, e.g. "GRIS", or building + floor,
  // e.g. "GRIS_1" or "GRIS 1" (case insensitive, and with or without white
  // spaces or either side of the string).
  let formattedQuest = query.toUpperCase().trim().replace(/[^a-zA-Z0-9]/g, '_')

  // Search this building in the building object if the query isn't
  // empty.
  let validIndicesForCurBldg = formattedQuest ? 
    filterStrArrCaseIns(floorplans.filename,formattedQuest)
    : []

  // Discard past info stored.
  let floorPlansToShow = []

  if (validIndicesForCurBldg.length>0) {

    // Supported. Set floorPlansToShow accordingly.
    for(var idx=0; idx < validIndicesForCurBldg.length; idx++) {
      let validIdxForCurBldg = validIndicesForCurBldg[idx]
      let newValidFloorPlan = {}
      // Get the information for the corresponding floor plans from the state tree.
      newValidFloorPlan.idx = validIdxForCurBldg
      newValidFloorPlan.href = floorplans.href[validIdxForCurBldg]
      newValidFloorPlan.fileName = floorplans.filename[validIdxForCurBldg]
      newValidFloorPlan.building = floorplans.building[validIdxForCurBldg]
      newValidFloorPlan.floor = floorplans.floor[validIdxForCurBldg]
      newValidFloorPlan.key = 'floorplan_' + newValidFloorPlan.building + '_' + newValidFloorPlan.floor
      newValidFloorPlan.svg = floorplans.svg[validIdxForCurBldg]
      floorPlansToShow.push(newValidFloorPlan)
    }
  }

  return floorPlansToShow
}

// Get all indices of strArr's elements which contain subStr.
// Note: case sensitive.
function filterStrArr(strArr, subStr){
 var indices = []
  // idxSA: index for the String Array.
  for (var idxSA = 0; idxSA < strArr.length; ++idxSA) {
    let idx = strArr[idxSA].indexOf(subStr)
    if (idx > -1) {
      // This string element contains subStr
      indices.push(idxSA)
    }
  }
  return indices
}

// Get all indices of strArr's elements which contain subStr.
// Note: case insensitive.
function filterStrArrCaseIns(strArr, subStr){
  // Change to upper case.
  let strArrCap = strArr.map(
      function (obj) {
          return obj.toUpperCase()
      }
  )
  let subStrCap = subStr.toUpperCase()

  return filterStrArr(strArrCap, subStrCap)
}
