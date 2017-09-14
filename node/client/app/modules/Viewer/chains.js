import { set, copy } from 'cerebral/operators'
import { setFrontPage } from '../App/chains'
import Promise from 'bluebird'

export let setRoomPage = [
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

export let setPersonPage = [
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

export let setLoadingPage = [
  set('state:viewer.state.current_page', 'loadingpage')
]

// Set input.force to be true to use all queries supported as the start point
// generating the cards.
//
export let setCardsPage = [
  // Set the page requested.
  set('output:current_page', 'cards'),
  // Start the app with an updated state.
  ...setFrontPage,
  // Update cards_to_show.
  updateCardsToShow
]

export let setFloorplanPage = [
  set('output:current_page', 'floorplan'),
  getFloorplan, {
    success: [
      copy('input:floorplan', 'state:floorplans.floorplan_to_show'), 
      getRoomsFromFloorplan, {
        success: [
          copy('input:rooms', 'state:floorplans.rooms'),
          ...setFrontPage,
        ],
        error: [],
      },
    ],
    error: [],
  },
]

export let setBuildingPage = [
  set('output:current_page', 'building'),
  getBuilding, {
    success: [
      getFloorplansFromBuilding, {
        success: [
          copy('input:floorplans', 'state:cards.cards_to_show'),
          ...setFrontPage
        ],
        error: [],
      }
    ],
    error: [],
  },
]

export let handleSearchResult = [
  set('state:viewer.state.current_page', 'loadingpage'),
  getPageType, { 
    building: [
      copy('input:card.name', 'output:building'),
      ...setBuildingPage
    ],
    cards: [
      ...setCardsPage,
    ],
    floorplan: [
      copy('input:card.name', 'output:floorplan'),
      ...setFloorplanPage,
    ],
    rooms_on_floorplans: [
      ...setRoomsOnFloorplansPage,
    ],
    room: [
      copy('input:card.floor', 'output:floor'),
      copy('input:card.building', 'output:building'),
      copy('input:card.floorplan', 'output:floorplan'),
      copy('input:card.name', 'output:room'),
      ...setRoomPage,
    ],
    person: [
      copy('input:card.name', 'output:person'),
      ...setPersonPage,
    ],
    unknown: [

    ],
  },
]

export let setRoomsOnFloorplansPage = [
  // Set the page requested.
  set('output:current_page', 'floorplan'),
  // Start the app with an updated state.
  ...setFrontPage,
  // Update floorplans_to_show.
  updateFloorplansToShow
]

function getBuilding({input, services, output}) {
  services.http.get('/nodes?type=building&name='+input.building).then((results) => {
    output.success({building:results.result[0]})
  }).catch((err) => {
    console.log(err);
    output.error({message:err})
  })
}
getBuilding.outputs=['success', 'error']
getBuilding.async = true;

function getFloorplansFromBuilding({input, services, output}) {
  services.http.get('/edges?type=floorplan&from='+input.building._id).then((results) => {
    output.success({floorplans:results.result})
  }).catch((err) => {
    console.log(err);
    output.error({message:err})
  })
}
getFloorplansFromBuilding.outputs=['success', 'error']
getFloorplansFromBuilding.async = true;


// Update floorplans.floorplan_to_show. 
export function getFloorplan({input, state, services, output}) {
  services.http.get('/nodes?type=floorplan&name='+input.floorplan).then((results) => {
    output.success({floorplan:results.result[0]})
  }).catch((err) => {
    output.error({message:err})
  })
}
getFloorplan.outputs=['success', 'error']
getFloorplan.async = true;

export function getRoomsFromFloorplan({input, state, services, output}) {
  services.http.get('/edges?type=room&from='+input.floorplan._id).then((results) => {
    var rooms = {}; 
    results.result.forEach((res) => {
      rooms[res.name] = res;
    })
    output.success({rooms})
  }).catch((err) => {
    output.error({message:err})
  })
}
getRoomsFromFloorplan.outputs=['success', 'error']
getRoomsFromFloorplan.async = true;

export function getPerson({input, state, services, output}) {
  return services.http.get('nodes/?type=person&name='+encodeURIComponent(input.person)).then((results) => {
    if (results.result.length === 1) return output.success({person:results.result[0]})
    return output.error({message: 'either multiple or zero persons found'})
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

function getPageType({input, state, output}) {
  switch(input.type) {
    case 'building':
      output.building({})
      break;

    case 'cards':
      output.cards()
      break;
    
    case 'floorplan':
      output.floorplan()
      break;

    case 'room_to_floorplan':
      output.room_to_floorplan()
      break;

    case 'room':
      output.room()
      break;

    case 'person':
      output.person()
      break;

    default:
      output.unknown()
      break;
  }
}
getPageType.outputs = ['building', 'cards', 'floorplan', 
  'rooms_on_floorplans', 'room', 'person', 'unknown'];

export function updateRoomsToShow({state, services}) {
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

// Update cards.cards_to_show. If input.card_filters is specified, only cards
// with a type listed there will be shown.
export function updateCardsToShow({input, state}) {
  let cardsToShowIndices = []
 // if (!input.card_force && state.get('viewer.state.query')){
    var cardsToShow = state.get('sidebar.search_results')
/*
  } else {
    // Use all search results
    var cardsToShow = state.get('sidebar.search_results')
  }
  if(input.card_filters.length>0) {
    cardsToShow = cardsToShow.filter((card)=>{
      console.log(input.card_filters, card.type);
      console.log(input.card_filters.indexOf(card.type) > -1);
      return input.card_filters.indexOf(card.type) > -1
    })
    // If current view is building view, will filter the cards to show according to
    // the building specified in the URL, too.
    //if(input.current_page && input.current_page == 'building') {
    if(input.current_page == 'building') {
      cardsToShow = cardsToShow.filter((card)=>{
        return card.name.indexOf(input.searchResult.name) > -1
      })
    }
  }
*/
  
  state.set('cards.cards_to_show', cardsToShow)
}

// Used for setFloorplanPage.
export function updateFloorplanToShow({state}) {
  let viewerState = state.get('viewer.state')

  // Clear all rooms to highlight just in case.
  state.set('floorplans.rooms_to_highlight', [])
  state.set('floorplans.floorplans_to_show',
    getFloorPlansToShow(viewerState.building + '_' + viewerState.floor, state.get('app.floorplans'))
  )
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
    let buildingRef = floorplans.building[validIndicesForCurBldg[0]]

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

// Used for setRoomsOnFloorplansPage.
function updateFloorplansToShow({input, state}) {
  console.log(input.rooms);
  state.set('floorplans.rooms_to_highlight', input.rooms)
  state.set('floorplans.floorplans_to_show',
    getFloorPlansToShowByRoomsToHighlight(input.rooms, state.get('app.floorplans'))
  )
}

// The helper function which parse an array of strings, e.g. ['GRIS 104',
// 'GRIS 203'], to get the information for the corresponding floorplans.
function getFloorPlansToShowByRoomsToHighlight(roomsToHighlight, floorplans) {
  let floorPlansToShow = []

  let queriesRequiredFloorplans = []
  roomsToHighlight.map( (roomQuery) => {
    let idxSpace = roomQuery.indexOf(' ')
    // Note:
    //  {
    //    building: roomQuery.substr(0, idxSpace),
    //    floor: roomQuery.substr(idxSpace+1, 1).toUpperCase(),
    //    id: roomQuery.substr(idxSpace+1),
    //  }
    return (roomQuery.substr(0, idxSpace) + ' ' + roomQuery.substr(idxSpace+1, 1).toUpperCase())
  }).forEach((query)=>{
    if(queriesRequiredFloorplans.indexOf(query) === -1) {
      queriesRequiredFloorplans.push(query)
    }
  })

  queriesRequiredFloorplans.forEach((queryFloorplan) => {

    let newValidFloorPlan = getFloorPlansToShow(queryFloorplan, floorplans)

    if(newValidFloorPlan.length>1){
      console.error('updateFloorplansToShow: found more than one floorplans for one single floor!');
    } else if (newValidFloorPlan.length<1) {
      console.warn('updateFloorplansToShow: no floorplan was found for a room to be highlighted!');
    } else {
      floorPlansToShow.push(newValidFloorPlan[0])
    }
  })

  return floorPlansToShow
}


