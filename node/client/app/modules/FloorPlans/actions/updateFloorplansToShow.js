import {getFloorPlansToShow} from './updateFloorplanToShow'

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

export default updateFloorplansToShow
